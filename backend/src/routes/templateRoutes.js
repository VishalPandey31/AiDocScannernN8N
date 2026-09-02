const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');

router.get('/', templateController.getAllTemplates);
router.post('/custom', templateController.createCustomTemplate);

module.exports = router;
