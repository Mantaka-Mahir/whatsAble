const User = require('../models/User');
const Message = require('../models/Message');

class ApiController {
    // Get messages for a specific user
    static async getMessagesForUser(req, res) {
        try {
            const { userId } = req.params;

            // Validate user exists
            const user = User.getById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const messages = Message.getByUserId(userId);

            res.json({
                success: true,
                data: {
                    user: user,
                    messages: messages
                }
            });
        } catch (error) {
            console.error('Error getting messages for user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve messages'
            });
        }
    }

    // Process webhook events (for n8n integration)
    static async processWebhook(req, res) {
        try {
            const { type, data } = req.body;

            console.log('📡 Webhook received:', { type, data });

            switch (type) {
                case 'new_lead':
                    await ApiController.handleNewLead(data);
                    break;
                case 'send_message':
                    await ApiController.handleSendMessage(data);
                    break;
                case 'schedule_followup':
                    await ApiController.handleScheduleFollowup(data);
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: `Unknown webhook type: ${type}`
                    });
            }

            res.json({
                success: true,
                message: 'Webhook processed successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error processing webhook:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process webhook'
            });
        }
    }

    // Handle new lead from webhook
    static async handleNewLead(data) {
        const { name, phone, email, source } = data;

        // Check if user already exists
        let user = User.getByPhone(phone) || User.getByEmail(email);

        if (!user) {
            user = User.create({
                name,
                phone,
                email,
                status: 'active'
            });
            console.log('👤 New user created:', user.name);
        } else {
            console.log('👤 Existing user found:', user.name);
        }

        // Send initial message
        const message = Message.create({
            userId: user.id,
            content: `Hi ${user.name}! Thanks for your interest in our services. Would you like to schedule a consultation?`,
            type: 'initial',
            status: 'delivered'
        });

        console.log('💬 Initial message sent to:', user.name);
        return { user, message };
    }

    // Handle send message from webhook
    static async handleSendMessage(data) {
        const { userId, content, type = 'manual' } = data;

        const user = User.getById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const message = Message.create({
            userId,
            content,
            type,
            status: 'delivered'
        });

        console.log('💬 Message sent to:', user.name);
        return message;
    }

    // Handle schedule followup from webhook
    static async handleScheduleFollowup(data) {
        const { userId, delay = 30000 } = data; // default 30 seconds for demo

        const user = User.getById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Schedule followup (in real app, this would use a job queue)
        setTimeout(() => {
            const unreadMessages = Message.getByUserId(userId).filter(msg => !msg.isRead);
            if (unreadMessages.length > 0) {
                Message.create({
                    userId,
                    content: `Hi ${user.name}! Following up on our previous message. Are you still interested?`,
                    type: 'followup',
                    status: 'delivered'
                });
                console.log('🔄 Followup message sent to:', user.name);
            }
        }, delay);

        console.log('⏰ Followup scheduled for:', user.name);
        return { scheduled: true, delay };
    }

    // Mark message as read
    static async markMessageAsRead(req, res) {
        try {
            const { messageId } = req.params;

            const message = Message.markAsRead(messageId);
            if (!message) {
                return res.status(404).json({
                    success: false,
                    message: 'Message not found'
                });
            }

            res.json({
                success: true,
                data: message,
                message: 'Message marked as read'
            });
        } catch (error) {
            console.error('Error marking message as read:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark message as read'
            });
        }
    }

    // Reply to a message
    static async replyToMessage(req, res) {
        try {
            const { messageId } = req.params;
            const { content, sender = 'user' } = req.body;

            if (!content || content.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Reply content is required'
                });
            }

            const reply = Message.addReply(messageId, content.trim(), sender);
            if (!reply) {
                return res.status(404).json({
                    success: false,
                    message: 'Message not found'
                });
            }

            res.json({
                success: true,
                data: reply,
                message: 'Reply added successfully'
            });
        } catch (error) {
            console.error('Error replying to message:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add reply'
            });
        }
    }

    // Get all users
    static async getAllUsers(req, res) {
        try {
            const users = User.getAll();

            // Add message count and last message for each user
            const usersWithMessageInfo = users.map(user => {
                const userMessages = Message.getByUserId(user.id);
                const unreadCount = userMessages.filter(msg => !msg.isRead).length;
                const lastMessage = userMessages.length > 0 ? userMessages[0] : null;

                return {
                    ...user,
                    messageCount: userMessages.length,
                    unreadCount,
                    lastMessage: lastMessage ? {
                        content: lastMessage.content,
                        sentAt: lastMessage.sentAt,
                        isRead: lastMessage.isRead
                    } : null
                };
            });

            res.json({
                success: true,
                data: usersWithMessageInfo
            });
        } catch (error) {
            console.error('Error getting all users:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve users'
            });
        }
    }

    // Simulate followup messages (for demo purposes)
    static async simulateFollowup(req, res) {
        try {
            const pendingFollowups = Message.getPendingFollowups();
            const results = [];

            for (const message of pendingFollowups) {
                const user = User.getById(message.userId);
                if (user) {
                    const followupMessage = Message.create({
                        userId: user.id,
                        content: `Hi ${user.name}! Following up on our previous message. Are you still interested?`,
                        type: 'followup',
                        status: 'delivered'
                    });

                    results.push({
                        userId: user.id,
                        userName: user.name,
                        originalMessageId: message.id,
                        followupMessageId: followupMessage.id
                    });
                }
            }

            res.json({
                success: true,
                data: results,
                message: `Sent ${results.length} followup messages`
            });
        } catch (error) {
            console.error('Error simulating followup:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to simulate followup'
            });
        }
    }

    // Get dashboard statistics
    static async getDashboardStats(req, res) {
        try {
            const users = User.getAll();
            const messages = Message.getAll();
            const unreadMessages = Message.getUnreadMessages();
            const messagesWithReplies = Message.getMessagesWithReplies();

            const stats = {
                totalUsers: users.length,
                activeUsers: users.filter(u => u.status === 'active').length,
                totalMessages: messages.length,
                unreadMessages: unreadMessages.length,
                responseRate: messages.length > 0 ? (messagesWithReplies.length / messages.length * 100).toFixed(1) : 0,
                recentMessages: Message.getRecentMessages(5)
            };

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve dashboard statistics'
            });
        }
    }
}

module.exports = ApiController;
