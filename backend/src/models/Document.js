const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    documentType: {
        type: String,
        default: 'UNKNOWN'
    },
    classificationConfidence: {
        type: Number,
        default: 0
    },
    ocrText: {
        type: String,
        default: ''
    },
    extractedData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    extractionConfidence: {
        type: Number,
        default: 0
    },
    qualityScore: {
        type: Number,
        default: 0
    },
    expiryDate: {
        type: Date
    },
    validationStatus: {
        type: String,
        enum: ['PENDING', 'VALID', 'INVALID', 'WARNING'],
        default: 'PENDING'
    },
    issues: [{
        type: String
    }],
    duplicateOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    },
    processingStatus: {
        type: String,
        enum: ['UPLOADED', 'PROCESSING', 'OCR_COMPLETED', 'CLASSIFIED', 'EXTRACTING', 'VALIDATING', 'COMPLETED', 'FAILED', 'REVIEW_REQUIRED'],
        default: 'UPLOADED'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
