const express = require('express');
const router = express.Router({ mergeParams: true });
const {
    uploadDocument,
    getDocumentsForApplication,
    getDocument,
    deleteDocument
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// The route will be mounted mostly at /api/applications/:id/documents
router.route('/')
    .post(protect, upload.single('document'), uploadDocument)
    .get(protect, getDocumentsForApplication);

// However, getting and deleting a specific document by ID usually happens directly on /api/documents/:id
router.route('/:id')
    .get(protect, getDocument)
    .delete(protect, deleteDocument);

module.exports = router;
