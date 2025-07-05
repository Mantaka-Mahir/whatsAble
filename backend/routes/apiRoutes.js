const express = require('express');
const router = express.Router();
const ApiController = require('../controllers/apiController');
const { requireAuth } = require('../middleware/auth');

// Public webhook endpoint (no auth required for external services)
router.post('/webhook', ApiController.processWebhook);

// Protected API endpoints
router.use(requireAuth);

// Message endpoints
router.get('/messages/:userId', ApiController.getMessagesForUser);
router.put('/messages/:messageId/read', ApiController.markMessageAsRead);
router.post('/messages/:messageId/reply', ApiController.replyToMessage);

// User endpoints
router.get('/users', ApiController.getAllUsers);

// Utility endpoints
router.post('/simulate-followup', ApiController.simulateFollowup);
router.get('/dashboard/stats', ApiController.getDashboardStats);

module.exports = router;
