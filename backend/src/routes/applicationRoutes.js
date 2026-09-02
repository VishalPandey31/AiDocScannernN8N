const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

router.post('/create', applicationController.createApplication);
router.post('/:id/upload-and-verify', uploadMiddleware.array('documents', 10), applicationController.uploadAndVerify);
router.get('/', applicationController.getAllApplications);
router.get('/:id', applicationController.getApplication);

module.exports = router;
