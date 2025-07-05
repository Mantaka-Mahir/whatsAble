const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// Web authentication routes
router.get('/login', AuthController.showLogin);
router.post('/login', AuthController.login);
router.get('/logout', AuthController.logout);
router.post('/logout', AuthController.logout);

// Registration routes (for demo)
router.get('/register', AuthController.showRegister);
router.post('/register', AuthController.register);

// API authentication endpoints
router.post('/api/login', AuthController.apiLogin);
router.post('/api/logout', AuthController.apiLogout);
router.get('/api/me', AuthController.getCurrentUser);

module.exports = router;
