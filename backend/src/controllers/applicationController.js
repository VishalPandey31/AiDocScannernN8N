const Application = require('../models/Application');
const WorkflowTemplate = require('../models/WorkflowTemplate');
const aiService = require('../services/aiService');
const forensicService = require('../services/forensicService');
const validationEngine = require('../services/validationEngine');
const AuditLog = require('../models/AuditLog');

exports.createApplication = async (req, res) => {
    try {
        const { templateId, applicantName } = req.body;
        const appId = 'APP-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        const template = templateId ? await WorkflowTemplate.findOne({ templateId }) : null;
        let missingDocuments = [];
        if (template && template.mandatoryDocuments) {
            missingDocuments = template.mandatoryDocuments.map(md => md.docType);
        }

        const application = new Application({
            applicationId: appId,
            templateId: templateId || "CUSTOM_AUTO_DETECT",
            applicantName: applicantName || "Pending Extraction",
            missingDocuments
        });

        await application.save();
        res.status(201).json({ success: true, data: application });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.uploadAndVerify = async (req, res) => {
    try {
        const appId = req.params.id;
        const query = appId.startsWith('APP-') ? { applicationId: appId } : { _id: appId };
        const application = await Application.findOne(query);

        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        const files = req.files || [];
        if (files.length === 0) {
            return res.status(400).json({ success: false, message: "No documents uploaded." });
        }

        // Parallel processing of all documents for lightning speed (<4s target)
        const processedDocs = await Promise.all(
            files.map(async (file) => {
                // 1. Run Forensic hashes & metadata
                const forensics = await forensicService.runForensics(file.buffer, file.mimetype);

                // 2. Run Gemini Zero-Shot Extraction
                const aiResult = await aiService.extractDocumentData(file.buffer, file.mimetype);

                return {
                    fileId: 'DOC-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
                    originalName: file.originalname,
                    fileHash: forensics.fileHash,
                    detectedDocType: aiResult.detectedDocType,
                    extractedData: aiResult.extractedData,
                    quality: {
                        blurScore: forensics.blurScore,
                        isReadable: aiResult.quality.isReadable,
                        isCropped: aiResult.quality.isCropped
                    },
                    forensics: {
                        hasEditorArtifacts: forensics.hasEditorArtifacts,
                        softwareTag: forensics.softwareTag,
                        isDuplicate: forensics.isDuplicate
                    },
                    confidenceScore: aiResult.quality.confidenceScore
                };
            })
        );

        // Append to application docs
        application.documents.push(...processedDocs);

        // Run comprehensive 5-dimension audit engine
        const auditedApplication = validationEngine.executeFullAudit(application);

        // Save state
        await auditedApplication.save();

        // Log Audit Event
        await AuditLog.create({
            applicationId: appId,
            action: 'VERIFICATION_PASS_COMPLETED',
            details: { finalReadiness: auditedApplication.readinessScore, status: auditedApplication.status }
        });

        res.status(200).json({ success: true, data: auditedApplication });
    } catch (err) {
        console.error("Upload & Verify Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getApplication = async (req, res) => {
    try {
        const id = req.params.id;
        const query = id.startsWith('APP-') ? { applicationId: id } : { _id: id };
        const application = await Application.findOne(query);
        if (!application) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: application });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: applications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
