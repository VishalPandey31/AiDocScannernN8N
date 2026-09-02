const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    applicationId: { type: String, required: true, unique: true },
    templateId: { type: String, default: "CUSTOM_AUTO_DETECT" },
    applicantName: { type: String, default: "Pending Extraction" },
    status: {
        type: String,
        enum: ["PROCESSING", "VERIFIED", "ATTENTION_REQUIRED", "REJECTED"],
        default: "PROCESSING"
    },
    readinessScore: { type: Number, default: 0 },
    attentionScore: { type: Number, default: 0 },
    documents: [{
        fileId: String,
        originalName: String,
        fileHash: String, // SHA-256
        detectedDocType: String,
        extractedData: {
            fullName: String,
            identifierMasked: String,
            dateOfBirth: String,
            issueDate: String,
            expiryDate: String,
            address: String,
            employerOrBusinessName: String
        },
        quality: {
            blurScore: Number,
            isReadable: Boolean,
            isCropped: Boolean
        },
        forensics: {
            hasEditorArtifacts: Boolean,
            softwareTag: String,
            isDuplicate: Boolean
        },
        confidenceScore: Number
    }],
    auditMatrix: [{
        dimension: {
            type: String,
            enum: ["IDENTITY_MATCH", "PATTERN_INTEGRITY", "TEMPORAL_VALIDITY", "FINANCIAL_CONSISTENCY", "QUALITY_FORENSICS"]
        },
        field: String,
        sources: [String],
        extractedValues: mongoose.Schema.Types.Mixed,
        score: Number,
        status: { type: String, enum: ["PASSED", "WARNING", "FAILED"] },
        explanation: String
    }],
    missingDocuments: [String],
    aiSummary: String
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
