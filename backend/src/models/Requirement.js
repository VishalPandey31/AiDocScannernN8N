const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    requirementName: {
        type: String, // e.g. "Primary Identity Info", "Address Proof"
        required: true
    },
    documentType: {
        type: String, // e.g. "PAN_CARD" or "ADDRESS_PROOF"
        required: true
    },
    required: {
        type: Boolean,
        default: true
    },
    allowedDocumentTypes: [{
        type: String // e.g. ['AADHAAR_CARD', 'VOTER_ID', 'PASSPORT'] for Address Proof
    }],
    status: {
        type: String,
        enum: ['MISSING', 'SATISFIED', 'UNSATISFIED'],
        default: 'MISSING'
    },
    acceptedDocumentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    },
    rejectedDocumentIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    }],
    issues: [{
        type: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Requirement', requirementSchema);
