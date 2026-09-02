const Application = require('../models/Application');
const Document = require('../models/Document');
const Requirement = require('../models/Requirement');
const crossDocumentService = require('./crossDocumentService');

exports.evaluateApplicationReadiness = async (applicationId) => {
    try {
        const application = await Application.findById(applicationId).populate('requirements');
        if (!application || !application.requirements) return;

        const documents = await Document.find({ applicationId });

        let readinessScore = 100;
        let attentionScore = 0;
        let requiresReview = false;
        let issues = [];
        let recommendations = [];

        // 1. Loop through all requirements and map accepted documents
        let missingReqCount = 0;
        let totalReqs = application.requirements.length;

        for (let req of application.requirements) {
            // Find an allowed, valid document satisfying this requirement
            let matchingDoc = documents.find(d =>
                req.allowedDocumentTypes.includes(d.documentType) &&
                ['COMPLETED', 'REVIEW_REQUIRED'].includes(d.processingStatus) &&
                d.qualityScore >= 50 &&
                d.validationStatus !== 'INVALID'
            );

            // Handle requirement status
            if (matchingDoc) {
                req.status = 'SATISFIED';
                req.acceptedDocumentId = matchingDoc._id;

                // Track rejected documents that tried to satisfy this requirement 
                req.rejectedDocumentIds = documents
                    .filter(d => req.allowedDocumentTypes.includes(d.documentType) && d._id.toString() !== matchingDoc._id.toString())
                    .map(d => d._id);

            } else {
                req.status = 'MISSING';
                req.acceptedDocumentId = null;

                // Are there uploads for this type but they failed?
                const failingUploads = documents.filter(d => req.allowedDocumentTypes.includes(d.documentType));
                req.rejectedDocumentIds = failingUploads.map(d => d._id);

                if (req.required) {
                    missingReqCount++;
                    issues.push(`Requirement not satisfied: ${req.requirementName}`);

                    if (failingUploads.length > 0) {
                        recommendations.push(`Upload a clearer/valid ${req.requirementName}. Previous upload was rejected.`);
                    } else {
                        recommendations.push(`Please upload ${req.requirementName}`);
                    }
                }
            }
            await req.save();
        }

        readinessScore -= (missingReqCount * 15);

        // 2. Cross Doc checks
        const { crossDocIssues, duplicateWarnings } = await crossDocumentService.compareDocuments(applicationId);

        if (crossDocIssues.length > 0) {
            issues.push(...crossDocIssues);
            attentionScore += (crossDocIssues.length * 20);
            requiresReview = true;
        }

        if (duplicateWarnings.length > 0) {
            issues.push(...duplicateWarnings);
            attentionScore += 5;
        }

        // 3. Document Quality & Validity Penalties
        let qualityPenalty = 0;
        let validityPenalty = 0;

        documents.forEach(doc => {
            if (doc.qualityScore < 75) qualityPenalty += 5;
            if (doc.validationStatus === 'INVALID') validityPenalty += 15;
            if (doc.validationStatus === 'WARNING') validityPenalty += 5;
            if (doc.processingStatus === 'REVIEW_REQUIRED') requiresReview = true;
        });

        readinessScore -= (qualityPenalty + validityPenalty);
        attentionScore += qualityPenalty + validityPenalty;

        // Bounding
        if (readinessScore < 0) readinessScore = 0;
        if (readinessScore > 100) readinessScore = 100;
        if (attentionScore > 100) attentionScore = 100;
        if (attentionScore < 0) attentionScore = 0;

        application.readinessScore = readinessScore;
        application.attentionScore = attentionScore;
        application.issues = issues;
        application.recommendations = recommendations;

        if (missingReqCount > 0 || readinessScore < 50) {
            application.status = 'INCOMPLETE';
        } else if (requiresReview || attentionScore > 40) {
            application.status = 'REVIEW_REQUIRED';
        } else if (readinessScore > 85 && attentionScore < 20 && missingReqCount === 0) {
            application.status = 'READY';
        } else {
            application.status = 'PROCESSING';
        }

        await application.save();

    } catch (error) {
        console.error('Error evaluating application readiness:', error);
    }
};
