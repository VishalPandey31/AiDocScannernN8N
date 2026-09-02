const Document = require('../models/Document');
const Application = require('../models/Application');
const { processDocument } = require('../jobs/processDocumentJob');
const path = require('path');
const fs = require('fs');

// @desc    Upload new document to application
// @route   POST /api/applications/:id/documents
// @access  Private
exports.uploadDocument = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            if (req.file && req.file.path) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Check ownership
        if (application.owner.toString() !== req.user.id && req.user.role === 'USER') {
            if (req.file && req.file.path) fs.unlinkSync(req.file.path);
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        // In a real app we'd upload to S3/Cloudinary here.
        // For development, we just store the local path or serve statically.
        const fileUrl = `/uploads/${req.file.filename}`;

        const document = await Document.create({
            applicationId: application._id,
            fileName: req.file.originalname,
            fileUrl: fileUrl, // local path
            mimeType: req.file.mimetype,
            fileSize: req.file.size,
            processingStatus: 'UPLOADED'
        });

        // Trigger processing job asynchronously here
        processDocument(document._id);

        res.status(201).json({ success: true, data: document });
    } catch (error) {
        if (req.file && req.file.path) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all documents for an application
// @route   GET /api/applications/:id/documents
// @access  Private
exports.getDocumentsForApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (application.owner.toString() !== req.user.id && req.user.role === 'USER') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const documents = await Document.find({ applicationId: req.params.id });
        res.status(200).json({ success: true, data: documents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
exports.getDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id).populate('applicationId');

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        const application = document.applicationId;
        if (application.owner.toString() !== req.user.id && req.user.role === 'USER') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.status(200).json({ success: true, data: document });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id).populate('applicationId');

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        const application = document.applicationId;
        if (application.owner.toString() !== req.user.id && req.user.role === 'USER') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await document.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
