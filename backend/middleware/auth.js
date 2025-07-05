// Authentication middleware

// Require authentication for API endpoints
function requireAuth(req, res, next) {
    if (!req.session.admin) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    next();
}

// Require authentication for web pages
function requireWebAuth(req, res, next) {
    if (!req.session.admin) {
        return res.redirect('/auth/login');
    }
    next();
}

// Require admin role
function requireAdmin(req, res, next) {
    if (!req.session.admin) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.session.admin.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }

    next();
}

// Require admin role for web pages
function requireWebAdmin(req, res, next) {
    if (!req.session.admin) {
        return res.redirect('/auth/login');
    }

    if (req.session.admin.role !== 'admin') {
        return res.status(403).render('error', {
            title: 'Access Denied - AutoEngage',
            message: 'Admin access required'
        });
    }

    next();
}

// Optional authentication (doesn't block if not authenticated)
function optionalAuth(req, res, next) {
    // Session will be available in req.session.admin if authenticated
    next();
}

module.exports = {
    requireAuth,
    requireWebAuth,
    requireAdmin,
    requireWebAdmin,
    optionalAuth
};
