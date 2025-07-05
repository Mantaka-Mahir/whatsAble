const Admin = require('../models/Admin');

class AuthController {
    // Show login page
    static showLogin(req, res) {
        if (req.session.admin) {
            return res.redirect('/dashboard');
        }

        res.render('auth/login', {
            title: 'Login - AutoEngage',
            error: null
        });
    }

    // Handle login
    static async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.render('auth/login', {
                    title: 'Login - AutoEngage',
                    error: 'Username and password are required'
                });
            }

            const admin = await Admin.validatePassword(username, password);
            if (!admin) {
                return res.render('auth/login', {
                    title: 'Login - AutoEngage',
                    error: 'Invalid username or password'
                });
            }

            // Store admin in session
            req.session.admin = admin;

            console.log('🔐 Admin logged in:', admin.username);
            res.redirect('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            res.render('auth/login', {
                title: 'Login - AutoEngage',
                error: 'Login failed. Please try again.'
            });
        }
    }

    // Handle logout
    static logout(req, res) {
        const adminUsername = req.session.admin?.username;

        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.redirect('/dashboard');
            }

            console.log('🔐 Admin logged out:', adminUsername);
            res.redirect('/auth/login');
        });
    }

    // Show registration page (for demo)
    static showRegister(req, res) {
        if (req.session.admin) {
            return res.redirect('/dashboard');
        }

        res.render('auth/register', {
            title: 'Register - AutoEngage',
            error: null,
            success: null
        });
    }

    // Handle registration
    static async register(req, res) {
        try {
            const { username, email, password, confirmPassword } = req.body;

            // Validation
            if (!username || !email || !password || !confirmPassword) {
                return res.render('auth/register', {
                    title: 'Register - AutoEngage',
                    error: 'All fields are required',
                    success: null
                });
            }

            if (password !== confirmPassword) {
                return res.render('auth/register', {
                    title: 'Register - AutoEngage',
                    error: 'Passwords do not match',
                    success: null
                });
            }

            if (password.length < 6) {
                return res.render('auth/register', {
                    title: 'Register - AutoEngage',
                    error: 'Password must be at least 6 characters long',
                    success: null
                });
            }

            const admin = await Admin.create({
                username,
                email,
                password,
                role: 'user'
            });

            console.log('👤 New admin registered:', admin.username);

            res.render('auth/register', {
                title: 'Register - AutoEngage',
                error: null,
                success: 'Account created successfully! You can now login.'
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.render('auth/register', {
                title: 'Register - AutoEngage',
                error: error.message || 'Registration failed. Please try again.',
                success: null
            });
        }
    }

    // API login endpoint
    static async apiLogin(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username and password are required'
                });
            }

            const admin = await Admin.validatePassword(username, password);
            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            req.session.admin = admin;

            res.json({
                success: true,
                data: admin,
                message: 'Login successful'
            });
        } catch (error) {
            console.error('API login error:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed'
            });
        }
    }

    // API logout endpoint
    static apiLogout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Logout failed'
                });
            }

            res.json({
                success: true,
                message: 'Logout successful'
            });
        });
    }

    // Get current user info
    static getCurrentUser(req, res) {
        if (!req.session.admin) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        res.json({
            success: true,
            data: req.session.admin
        });
    }
}

module.exports = AuthController;
