const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

class ApiController {
    // Get all messages
    static async getAllMessages(req, res) {
        try {
            const messages = Message.getAll();

            res.json({
                success: true,
                data: messages
            });
        } catch (error) {
            console.error('Error getting all messages:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve messages'
            });
        }
    }

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

    // N8N Integration Methods
    static async handleN8nNewLead(req, res) {
        try {
            const { name, phone, email, source, telegram_id } = req.body;

            console.log('🔥 N8N New Lead:', { name, phone, email, source, telegram_id });

            // Check if user already exists
            let user = User.getByPhone(phone) || User.getByEmail(email);

            if (!user) {
                user = User.create({
                    name: name || 'Unknown',
                    phoneNumber: phone,
                    email: email || '',
                    status: 'active',
                    telegramId: telegram_id || null,
                    source: source || 'n8n'
                });
                console.log('👤 New user created from n8n:', user.name);
            } else {
                // Update existing user with new info
                if (telegram_id && !user.telegramId) {
                    user.telegramId = telegram_id;
                }
                console.log('👤 Existing user found:', user.name);
            }

            res.json({
                success: true,
                data: {
                    user: user,
                    message: 'Lead processed successfully'
                }
            });
        } catch (error) {
            console.error('Error processing n8n new lead:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process new lead'
            });
        }
    }

    static async handleN8nSendMessage(req, res) {
        try {
            const { user_id, phone, content, type = 'automated', telegram_id } = req.body;

            console.log('💬 N8N Send Message:', { user_id, phone, content, type, telegram_id });

            // Find user by ID, phone, or telegram_id
            let user = null;
            if (user_id) {
                user = User.getById(user_id);
                console.log('Found user by ID:', user?.name);
            } else if (phone) {
                user = User.getByPhone(phone);
                console.log('Found user by phone:', user?.name);
            } else if (telegram_id) {
                user = User.getByTelegramId(telegram_id);
                console.log('Found user by telegram_id:', user?.name);
            }

            if (!user) {
                console.log('User not found with criteria:', { user_id, phone, telegram_id });
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Create or get conversation
            let conversation = Conversation.getByUserId(user.id);
            if (!conversation && user.telegramId) {
                conversation = Conversation.getByTelegramId(user.telegramId);
            }

            if (!conversation) {
                conversation = Conversation.create({
                    userId: user.id,
                    telegramId: user.telegramId,
                    phoneNumber: user.phoneNumber,
                    customerName: user.name,
                    source: user.source || 'telegram'
                });
                console.log('✅ Created new conversation for n8n message:', conversation.id);
            }

            // Add message to conversation
            const conversationMessage = Conversation.addMessage(conversation.id, {
                content: content,
                senderId: 'admin',
                senderType: 'admin',
                senderName: 'WhatsAble Assistant',
                type: type,
                source: 'n8n',
                automated: true
            });

            // Also create legacy message for backward compatibility
            const message = Message.create({
                userId: user.id,
                telegramId: user.telegramId,
                content: content,
                type: type,
                status: 'delivered',
                source: 'n8n',
                conversationId: conversation.id,
                isFromCustomer: false,
                automated: true
            });

            console.log('💬 Message sent via n8n to:', user.name);

            res.json({
                success: true,
                data: {
                    message: message,
                    conversationMessage: conversationMessage,
                    conversation: conversation,
                    user: user
                }
            });
        } catch (error) {
            console.error('Error sending message via n8n:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send message'
            });
        }
    }

    static async handleN8nProcessResponse(req, res) {
        try {
            const { user_id, phone, telegram_id, response_text, original_message_id } = req.body;

            console.log('📥 N8N Process Response:', { user_id, phone, telegram_id, response_text, original_message_id });

            // Find user
            let user = null;
            if (user_id) {
                user = User.getById(user_id);
            } else if (phone) {
                user = User.getByPhone(phone);
            } else if (telegram_id) {
                user = User.getByTelegramId(telegram_id);
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Get or create conversation
            let conversation = Conversation.getByUserId(user.id);
            if (!conversation && user.telegramId) {
                conversation = Conversation.getByTelegramId(user.telegramId);
            }

            if (!conversation) {
                conversation = Conversation.create({
                    userId: user.id,
                    telegramId: user.telegramId,
                    phoneNumber: user.phoneNumber,
                    customerName: user.name,
                    source: user.source || 'telegram'
                });
                console.log('✅ Created new conversation for customer response:', conversation.id);
            }

            // Add customer message to conversation
            const conversationMessage = Conversation.addMessage(conversation.id, {
                content: response_text,
                senderId: user.id,
                senderType: 'customer',
                senderName: user.name,
                type: 'text',
                source: 'telegram'
            });

            // Create incoming message (customer response) - legacy compatibility
            const incomingMessage = Message.create({
                userId: user.id,
                telegramId: user.telegramId,
                content: response_text,
                type: 'response',
                status: 'received',
                source: 'telegram',
                isFromCustomer: true,
                conversationId: conversation.id
            });

            // Mark original message as read if provided
            if (original_message_id) {
                Message.markAsRead(original_message_id);
            }

            console.log('📨 Customer response processed:', user.name);

            res.json({
                success: true,
                data: {
                    user: user,
                    incomingMessage: incomingMessage,
                    conversationMessage: conversationMessage,
                    conversation: conversation,
                    shouldFollowUp: true // Let n8n decide follow-up logic
                }
            });
        } catch (error) {
            console.error('Error processing response via n8n:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process response'
            });
        }
    }

    static async getN8nUsers(req, res) {
        try {
            const users = User.getAll();

            // Format for n8n consumption
            const n8nUsers = users.map(user => ({
                id: user.id,
                name: user.name,
                phone: user.phoneNumber,
                email: user.email,
                telegram_id: user.telegramId,
                status: user.isActive ? 'active' : 'inactive',
                created_at: user.createdAt,
                message_count: Message.getByUserId(user.id).length,
                unread_count: Message.getByUserId(user.id).filter(msg => !msg.isRead).length
            }));

            res.json({
                success: true,
                data: n8nUsers
            });
        } catch (error) {
            console.error('Error getting users for n8n:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve users'
            });
        }
    }

    static async getN8nPendingFollowups(req, res) {
        try {
            const pendingFollowups = Message.getPendingFollowups();

            // Format for n8n with user details
            const n8nFollowups = pendingFollowups.map(message => {
                const user = User.getById(message.userId);
                return {
                    message_id: message.id,
                    user_id: user.id,
                    user_name: user.name,
                    user_phone: user.phoneNumber,
                    user_telegram_id: user.telegramId,
                    original_content: message.content,
                    sent_at: message.sentAt,
                    hours_since_sent: Math.floor((Date.now() - new Date(message.sentAt).getTime()) / (1000 * 60 * 60))
                };
            });

            res.json({
                success: true,
                data: n8nFollowups
            });
        } catch (error) {
            console.error('Error getting pending followups for n8n:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve pending followups'
            });
        }
    }

    static async markN8nProcessed(req, res) {
        try {
            const { message_id, user_id, action } = req.body;

            console.log('✅ N8N Mark Processed:', { message_id, user_id, action });

            if (message_id) {
                Message.markAsRead(message_id);
            }

            // You could add more tracking here for n8n actions
            res.json({
                success: true,
                message: 'Marked as processed'
            });
        } catch (error) {
            console.error('Error marking as processed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark as processed'
            });
        }
    }

    static async n8nHealthCheck(req, res) {
        try {
            const stats = {
                timestamp: new Date().toISOString(),
                status: 'healthy',
                users_count: User.getAll().length,
                messages_count: Message.getAll().length,
                pending_followups: Message.getPendingFollowups().length,
                conversations_count: Conversation.getAll().length,
                active_conversations: Conversation.getActiveConversations().length,
                unread_conversations: Conversation.getUnreadConversations().length
            };

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error in n8n health check:', error);
            res.status(500).json({
                success: false,
                message: 'Health check failed'
            });
        }
    }

    // === CONVERSATION ENDPOINTS ===

    // Get all conversations (for admin dashboard)
    static async getAllConversations(req, res) {
        try {
            const conversations = Conversation.getAll();

            res.json({
                success: true,
                data: conversations
            });
        } catch (error) {
            console.error('Error getting conversations:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve conversations'
            });
        }
    }

    // Get conversation for a specific user (WhatsApp-style)
    static async getConversation(req, res) {
        try {
            const { userId } = req.params;
            const { limit = 50 } = req.query;

            // Validate user exists
            const user = User.getById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Get or create conversation
            let conversation = Conversation.getByUserId(userId);
            if (!conversation) {
                conversation = Conversation.create({
                    userId: userId,
                    telegramId: user.telegramId,
                    phoneNumber: user.phoneNumber,
                    customerName: user.name,
                    source: user.source || 'telegram'
                });
            }

            // Get conversation history
            const conversationHistory = Conversation.getConversationHistory(conversation.id, parseInt(limit));

            // Also get legacy messages and convert them
            const legacyMessages = Message.getConversationMessages(userId, user.telegramId);

            res.json({
                success: true,
                data: {
                    conversation: conversationHistory?.conversation || conversation,
                    messages: conversationHistory?.messages || [],
                    legacyMessages: legacyMessages,
                    user: user
                }
            });
        } catch (error) {
            console.error('Error getting conversation:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve conversation'
            });
        }
    }

    // Add message to conversation
    static async addMessageToConversation(req, res) {
        try {
            const { conversationId } = req.params;
            const { content, senderType = 'admin', senderId = 'admin', senderName = 'WhatsAble Assistant', type = 'text', source = 'manual' } = req.body;

            const conversation = Conversation.getById(conversationId);
            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message: 'Conversation not found'
                });
            }

            const message = Conversation.addMessage(conversationId, {
                content: content,
                senderId: senderId,
                senderType: senderType,
                senderName: senderName,
                type: type,
                source: source,
                automated: source === 'n8n'
            });

            res.json({
                success: true,
                data: {
                    message: message,
                    conversation: conversation
                }
            });
        } catch (error) {
            console.error('Error adding message to conversation:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add message to conversation'
            });
        }
    }

    // Mark conversation as read
    static async markConversationAsRead(req, res) {
        try {
            const { conversationId } = req.params;
            const { readerType = 'admin' } = req.body;

            const success = Conversation.markAsRead(conversationId, readerType);
            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Conversation not found'
                });
            }

            res.json({
                success: true,
                message: 'Conversation marked as read'
            });
        } catch (error) {
            console.error('Error marking conversation as read:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark conversation as read'
            });
        }
    }

    // === N8N CONVERSATION ENDPOINTS ===

    // Get conversation for n8n workflow
    static async getN8nConversation(req, res) {
        try {
            const { userId } = req.params;
            const { telegram_id, limit = 20 } = req.query;

            console.log('🔍 N8N Getting conversation for:', { userId, telegram_id, limit });

            // Find user by ID or telegram_id
            let user = null;
            if (userId && userId !== 'undefined') {
                user = User.getById(userId);
            } else if (telegram_id) {
                user = User.getByTelegramId(telegram_id);
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Get or create conversation
            let conversation = Conversation.getByUserId(user.id);
            if (!conversation && user.telegramId) {
                conversation = Conversation.getByTelegramId(user.telegramId);
            }

            if (!conversation) {
                conversation = Conversation.create({
                    userId: user.id,
                    telegramId: user.telegramId,
                    phoneNumber: user.phoneNumber,
                    customerName: user.name,
                    source: user.source || 'telegram'
                });
                console.log('✅ Created new conversation:', conversation.id);
            }

            // Get conversation history
            const conversationHistory = Conversation.getConversationHistory(conversation.id, parseInt(limit));

            // Format for n8n consumption
            const formattedMessages = conversationHistory?.messages?.map(msg => ({
                role: msg.sender.type === 'customer' ? 'user' : 'assistant',
                content: msg.content,
                timestamp: msg.sentAt,
                type: msg.type
            })) || [];

            res.json({
                success: true,
                data: {
                    conversation_id: conversation.id,
                    user_id: user.id,
                    telegram_id: user.telegramId,
                    user_name: user.name,
                    messages: formattedMessages,
                    message_count: formattedMessages.length
                }
            });
        } catch (error) {
            console.error('Error getting n8n conversation:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve conversation'
            });
        }
    }

    // Get all conversations for n8n
    static async getN8nConversations(req, res) {
        try {
            const conversations = Conversation.getActiveConversations();

            const formattedConversations = conversations.map(conv => ({
                conversation_id: conv.id,
                user_id: conv.userId,
                telegram_id: conv.telegramId,
                status: conv.status,
                last_message_at: conv.lastMessageAt,
                unread_count: conv.metadata.unreadCount,
                message_count: conv.messages.length
            }));

            res.json({
                success: true,
                data: formattedConversations
            });
        } catch (error) {
            console.error('Error getting n8n conversations:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve conversations'
            });
        }
    }
}

module.exports = ApiController;
