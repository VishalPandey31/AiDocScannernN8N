const WorkflowTemplate = require('../models/WorkflowTemplate');

exports.getAllTemplates = async (req, res) => {
    try {
        const templates = await WorkflowTemplate.find();
        res.status(200).json({ success: true, data: templates });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createCustomTemplate = async (req, res) => {
    try {
        const { title, mandatoryDocuments, optionalDocuments } = req.body;
        const templateId = 'CUSTOM-' + Math.random().toString(36).substring(2, 10).toUpperCase();

        const template = await WorkflowTemplate.create({
            templateId,
            title,
            category: "CUSTOM",
            isCustom: true,
            mandatoryDocuments,
            optionalDocuments
        });
        res.status(201).json({ success: true, data: template });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
