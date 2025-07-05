const User = require('../models/User');
const Message = require('../models/Message');

class DashboardController {
    // Show main dashboard
    static async showDashboard(req, res) {
        try {
            const users = User.getAll();
            const messages = Message.getAll();
            const unreadMessages = Message.getUnreadMessages();
            const recentMessages = Message.getRecentMessages(10);
            const messagesWithReplies = Message.getMessagesWithReplies();

            const stats = {
                totalUsers: users.length,
                activeUsers: users.filter(u => u.status === 'active').length,
                totalMessages: messages.length,
                unreadMessages: unreadMessages.length,
                responseRate: messages.length > 0 ? (messagesWithReplies.length / messages.length * 100).toFixed(1) : 0
            };

            // Add user info to recent messages
            const recentMessagesWithUsers = recentMessages.map(message => {
                const user = User.getById(message.userId);
                return {
                    ...message,
                    user: user
                };
            });

            res.render('dashboard/index', {
                title: 'Dashboard - AutoEngage',
                admin: req.session.admin,
                stats: stats,
                recentMessages: recentMessagesWithUsers
            });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).render('error', {
                title: 'Error - AutoEngage',
                message: 'Failed to load dashboard'
            });
        }
    }

    // Show users page
    static async showUsers(req, res) {
        try {
            const users = User.getAll();

            // Add message statistics for each user
            const usersWithStats = users.map(user => {
                const userMessages = Message.getByUserId(user.id);
                const unreadCount = userMessages.filter(msg => !msg.isRead).length;
                const lastMessage = userMessages.length > 0 ? userMessages[0] : null;

                return {
                    ...user,
                    messageCount: userMessages.length,
                    unreadCount,
                    lastMessage
                };
            });

            res.render('dashboard/users', {
                title: 'Users - AutoEngage',
                admin: req.session.admin,
                users: usersWithStats
            });
        } catch (error) {
            console.error('Users page error:', error);
            res.status(500).render('error', {
                title: 'Error - AutoEngage',
                message: 'Failed to load users'
            });
        }
    }

    // Show messages page
    static async showMessages(req, res) {
        try {
            const { userId, type, status } = req.query;
            let messages = Message.getAll();

            // Filter messages based on query parameters
            if (userId) {
                messages = messages.filter(msg => msg.userId === userId);
            }
            if (type) {
                messages = messages.filter(msg => msg.type === type);
            }
            if (status === 'read') {
                messages = messages.filter(msg => msg.isRead);
            } else if (status === 'unread') {
                messages = messages.filter(msg => !msg.isRead);
            }

            // Sort by most recent first
            messages.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

            // Add user info to messages
            const messagesWithUsers = messages.map(message => {
                const user = User.getById(message.userId);
                return {
                    ...message,
                    user: user
                };
            });

            const users = User.getAll();

            res.render('dashboard/messages', {
                title: 'Messages - AutoEngage',
                admin: req.session.admin,
                messages: messagesWithUsers,
                users: users,
                filters: { userId, type, status }
            });
        } catch (error) {
            console.error('Messages page error:', error);
            res.status(500).render('error', {
                title: 'Error - AutoEngage',
                message: 'Failed to load messages'
            });
        }
    }

    // Show send message page
    static async showSendMessage(req, res) {
        try {
            const users = User.getActiveUsers();

            res.render('dashboard/send-message', {
                title: 'Send Message - AutoEngage',
                admin: req.session.admin,
                users: users,
                success: null,
                error: null
            });
        } catch (error) {
            console.error('Send message page error:', error);
            res.status(500).render('error', {
                title: 'Error - AutoEngage',
                message: 'Failed to load send message page'
            });
        }
    }

    // Handle send message
    static async handleSendMessage(req, res) {
        try {
            const { userId, content, type = 'manual' } = req.body;
            const users = User.getActiveUsers();

            if (!userId || !content) {
                return res.render('dashboard/send-message', {
                    title: 'Send Message - AutoEngage',
                    admin: req.session.admin,
                    users: users,
                    success: null,
                    error: 'User and message content are required'
                });
            }

            const user = User.getById(userId);
            if (!user) {
                return res.render('dashboard/send-message', {
                    title: 'Send Message - AutoEngage',
                    admin: req.session.admin,
                    users: users,
                    success: null,
                    error: 'User not found'
                });
            }

            const message = Message.create({
                userId,
                content: content.trim(),
                type,
                status: 'delivered'
            });

            console.log('💬 Manual message sent to:', user.name, 'by:', req.session.admin.username);

            res.render('dashboard/send-message', {
                title: 'Send Message - AutoEngage',
                admin: req.session.admin,
                users: users,
                success: `Message sent successfully to ${user.name}`,
                error: null
            });
        } catch (error) {
            console.error('Send message error:', error);
            const users = User.getActiveUsers();
            res.render('dashboard/send-message', {
                title: 'Send Message - AutoEngage',
                admin: req.session.admin,
                users: users,
                success: null,
                error: 'Failed to send message'
            });
        }
    }

    // Show conversation with a user
    static async showConversation(req, res) {
        try {
            const { userId } = req.params;

            const user = User.getById(userId);
            if (!user) {
                return res.status(404).render('error', {
                    title: 'User Not Found - AutoEngage',
                    message: 'The requested user was not found'
                });
            }

            const messages = Message.getByUserId(userId);

            res.render('dashboard/conversation', {
                title: `Conversation with ${user.name} - AutoEngage`,
                admin: req.session.admin,
                user: user,
                messages: messages
            });
        } catch (error) {
            console.error('Conversation error:', error);
            res.status(500).render('error', {
                title: 'Error - AutoEngage',
                message: 'Failed to load conversation'
            });
        }
    }
}

module.exports = DashboardController;
