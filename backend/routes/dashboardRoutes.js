const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { requireWebAuth } = require('../middleware/auth');

// Public routes
router.get('/', (req, res) => {
    if (req.session.admin) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/auth/login');
    }
});

// Protected dashboard routes
router.use(requireWebAuth);

router.get('/dashboard', DashboardController.showDashboard);
router.get('/dashboard/users', DashboardController.showUsers);
router.get('/dashboard/messages', DashboardController.showMessages);
router.get('/dashboard/send-message', DashboardController.showSendMessage);
router.post('/dashboard/send-message', DashboardController.handleSendMessage);
router.get('/dashboard/conversation/:userId', DashboardController.showConversation);

module.exports = router;
