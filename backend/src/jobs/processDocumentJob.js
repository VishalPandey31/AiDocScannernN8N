const Document = require('../models/Document');
const ocrService = require('../services/ocrService');
const aiService = require('../services/aiService');
const validationService = require('../services/validationService');
const completenessService = require('../services/completenessService');
const Application = require('../models/Application');
const path = require('path');
const stringSimilarity = require('../utils/stringUtils');

exports.processDocument = async (documentId) => {
    try {
        const document = await Document.findById(documentId);
        if (!document) return;

        // Path resolving for local storage
        const filePath = path.join(__dirname, '..', '..', document.fileUrl);

        // Phase 5: OCR
        document.processingStatus = 'PROCESSING';
        await document.save();

        const ocrResult = await ocrService.extractText(filePath, document.mimeType);
        document.ocrText = ocrResult.text;
        document.processingStatus = 'OCR_COMPLETED';
        await document.save();

        // Phase 6: AI Classification
        const classification = await aiService.classifyDocument(filePath, document.mimeType);
        document.documentType = classification.documentType || 'UNKNOWN';
        document.classificationConfidence = classification.confidence || 0;

        if (classification.documentType === 'UNKNOWN' || classification.confidence < 0.6) {
            document.processingStatus = 'REVIEW_REQUIRED';
            document.issues.push('Low classification confidence: ' + classification.reason);
            await document.save();
            return;
        }

        document.processingStatus = 'CLASSIFIED';
        await document.save();

        // Phase 7: AI Extraction
        document.processingStatus = 'EXTRACTING';
        await document.save();
        const extraction = await aiService.extractFields(filePath, document.mimeType, document.documentType);
        document.extractedData = extraction.extractedData || {};
        document.extractionConfidence = extraction.extractionConfidence || 0;

        // Phase 9: Quality Check
        const quality = await aiService.analyzeQuality(filePath, document.mimeType);
        document.qualityScore = quality.qualityScore || 0;
        if (quality.problems) {
            document.issues.push(...quality.problems);
        }

        if (document.qualityScore < 50) {
            document.processingStatus = 'REVIEW_REQUIRED';
            document.issues.push('Poor document quality: ' + quality.recommendedAction);
            await document.save();
            return;
        }

        // Phase 8 & 9: Rule Validation & Expiry
        document.processingStatus = 'VALIDATING';
        await document.save();

        const validation = validationService.validateDocumentData(document.documentType, document.extractedData);
        document.validationStatus = validation.validationStatus;
        if (validation.issues.length > 0) {
            document.issues.push(...validation.issues);
        }

        if (document.extractedData && document.extractedData.expiryDate) {
            document.expiryDate = new Date(document.extractedData.expiryDate);
        }

        // Phase 11: Applicant Identity Matching
        const application = await Application.findById(document.applicationId);
        if (application && application.applicantName && document.extractedData && document.extractedData.name) {
            const similarity = stringSimilarity.compareTwoStrings(
                application.applicantName.toLowerCase().replace(/[^a-z\s]/g, ''),
                document.extractedData.name.toLowerCase().replace(/[^a-z\s]/g, '')
            );

            if (similarity < 0.6) {
                document.validationStatus = 'INVALID';
                document.issues.push(`Identity Mismatch: Document name '${document.extractedData.name}' does not match Applicant '${application.applicantName}'`);
            } else if (similarity < 0.85) {
                document.processingStatus = 'REVIEW_REQUIRED';
                document.issues.push(`Possible Identity Mismatch: Please verify '${document.extractedData.name}' matches Applicant '${application.applicantName}'`);
            }
        }

        // Phase 12: Duplicate Detection (Basic Content Match)
        if (document.extractedData && Object.keys(document.extractedData).length > 0) {
            const docNumber = document.extractedData.panNumber || document.extractedData.documentNumber || document.extractedData.passportNumber;
            if (docNumber) {
                const dupCheck = await Document.findOne({
                    applicationId: document.applicationId,
                    _id: { $ne: document._id },
                    $or: [
                        { 'extractedData.panNumber': docNumber },
                        { 'extractedData.documentNumber': docNumber },
                        { 'extractedData.passportNumber': docNumber }
                    ]
                });

                if (dupCheck) {
                    document.duplicateOf = dupCheck._id;
                    document.validationStatus = 'INVALID';
                    document.issues.push(`Duplicate Document: Detected same identifier (${docNumber}) as another uploaded document.`);
                }
            }
        }

        // Needs Review dynamically based on rules and confidence
        if (document.extractionConfidence < 0.7 || !validation.isValid || document.qualityScore < 70) {
            document.processingStatus = 'REVIEW_REQUIRED';
        } else {
            document.processingStatus = 'COMPLETED';
        }

        await document.save();

        // Trigger Phase 10 & 11: Application Readiness Re-evaluation here
        await completenessService.evaluateApplicationReadiness(document.applicationId);

    } catch (error) {
        console.error(`Document Processing Failed [${documentId}]:`, error);
        await Document.findByIdAndUpdate(documentId, {
            processingStatus: 'FAILED',
            issues: ['System Processing Error: ' + error.message]
        });
    }
};
