const mongoose = require('mongoose');

const workflowTemplateSchema = new mongoose.Schema({
    templateId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    category: {
        type: String,
        enum: ["BUSINESS_ONBOARDING", "RETAIL_LOAN", "HR_ONBOARDING", "CUSTOM"],
        required: true
    },
    mandatoryDocuments: [{
        docType: String,
        displayName: String,
        maxAgeDays: { type: Number, default: null } // e.g. 90 for utility bills
    }],
    optionalDocuments: [{
        docType: String,
        displayName: String
    }],
    crossMatchRules: [{
        targetField: String, // e.g., 'full_name', 'date_of_birth'
        strictness: { type: String, enum: ['STRICT', 'FUZZY_90', 'FUZZY_80'], default: 'FUZZY_90' }
    }],
    isCustom: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('WorkflowTemplate', workflowTemplateSchema);
