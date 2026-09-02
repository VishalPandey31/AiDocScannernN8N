const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
// Temporarily bypass auth checks to allow easy frontend dev integration
// In a true environment, we'd import and use the protect/authorize middlewares.

router.get('/dashboard', adminController.getDashboardStats);
router.get('/reviews', adminController.getReviews);
router.post('/reviews/:id/action', adminController.reviewAction);

module.exports = router;
