const express = require('express');
const router = express.Router();
const ApiController = require('../controllers/apiController');
const { requireAuth } = require('../middleware/auth');

// Public webhook endpoint (no auth required for external services)
router.post('/webhook', ApiController.processWebhook);

// N8N Integration endpoints (public for local n8n access)
router.post('/n8n/new-lead', ApiController.handleN8nNewLead);
router.post('/n8n/send-message', ApiController.handleN8nSendMessage);
router.post('/n8n/process-response', ApiController.handleN8nProcessResponse);
router.get('/n8n/users', ApiController.getN8nUsers);
router.get('/n8n/pending-followups', ApiController.getN8nPendingFollowups);
router.post('/n8n/mark-processed', ApiController.markN8nProcessed);
router.get('/n8n/health', ApiController.n8nHealthCheck);
// New conversation endpoints for n8n
router.get('/n8n/conversation/:userId', ApiController.getN8nConversation);
router.get('/n8n/conversations', ApiController.getN8nConversations);

// Protected API endpoints
router.use(requireAuth);

// Message endpoints
router.get('/messages', ApiController.getAllMessages);
router.get('/messages/:userId', ApiController.getMessagesForUser);
router.put('/messages/:messageId/read', ApiController.markMessageAsRead);
router.post('/messages/:messageId/reply', ApiController.replyToMessage);

// Conversation endpoints
router.get('/conversations', ApiController.getAllConversations);
router.get('/conversation/:userId', ApiController.getConversation);
router.post('/conversation/:conversationId/message', ApiController.addMessageToConversation);
router.put('/conversation/:conversationId/read', ApiController.markConversationAsRead);

// User endpoints
router.get('/users', ApiController.getAllUsers);

// Utility endpoints
router.post('/simulate-followup', ApiController.simulateFollowup);
router.get('/dashboard/stats', ApiController.getDashboardStats);

module.exports = router;
