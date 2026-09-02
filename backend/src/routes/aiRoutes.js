const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

router.post('/chat', uploadMiddleware.single('document'), aiController.chat);

module.exports = router;
