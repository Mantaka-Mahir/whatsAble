const database = require('./database');
const { v4: uuidv4 } = require('uuid');

class Conversation {
    static getAll() {
        return database.conversations || [];
    }

    static getById(id) {
        return this.getAll().find(conversation => conversation.id === id);
    }

    static getByUserId(userId) {
        return this.getAll().find(conversation => conversation.userId === userId);
    }

    static getByTelegramId(telegramId) {
        return this.getAll().find(conversation => conversation.telegramId === telegramId);
    }

    static create(conversationData) {
        if (!database.conversations) {
            database.conversations = [];
        }

        const conversation = {
            id: uuidv4(),
            userId: conversationData.userId,
            telegramId: conversationData.telegramId || null,
            phoneNumber: conversationData.phoneNumber || null,
            status: conversationData.status || 'active', // 'active', 'closed', 'pending'
            createdAt: new Date(),
            updatedAt: new Date(),
            lastMessageAt: new Date(),
            messages: [],
            participants: [
                {
                    id: conversationData.userId,
                    type: 'customer',
                    name: conversationData.customerName || 'Customer'
                },
                {
                    id: 'system',
                    type: 'admin',
                    name: 'WhatsAble Assistant'
                }
            ],
            metadata: {
                source: conversationData.source || 'telegram',
                lastReadByAdmin: null,
                lastReadByCustomer: null,
                unreadCount: 0
            }
        };

        database.conversations.push(conversation);
        return conversation;
    }

    static addMessage(conversationId, messageData) {
        const conversation = this.getById(conversationId);
        if (!conversation) return null;

        const message = {
            id: uuidv4(),
            conversationId: conversationId,
            content: messageData.content,
            sender: {
                id: messageData.senderId,
                type: messageData.senderType, // 'customer' or 'admin'
                name: messageData.senderName || 'Unknown'
            },
            type: messageData.type || 'text', // 'text', 'image', 'automated', 'followup'
            status: messageData.status || 'sent', // 'sending', 'sent', 'delivered', 'read', 'failed'
            sentAt: new Date(),
            readAt: null,
            metadata: {
                source: messageData.source || 'manual', // 'manual', 'n8n', 'telegram', 'whatsapp'
                automated: messageData.automated || false,
                originalMessageId: messageData.originalMessageId || null
            }
        };

        conversation.messages.push(message);
        conversation.lastMessageAt = new Date();
        conversation.updatedAt = new Date();

        // Update unread count
        if (messageData.senderType === 'customer') {
            conversation.metadata.unreadCount++;
        }

        return message;
    }

    static markAsRead(conversationId, readerType = 'admin') {
        const conversation = this.getById(conversationId);
        if (!conversation) return false;

        const now = new Date();

        if (readerType === 'admin') {
            conversation.metadata.lastReadByAdmin = now;
            conversation.metadata.unreadCount = 0;

            // Mark all customer messages as read
            conversation.messages.forEach(message => {
                if (message.sender.type === 'customer' && !message.readAt) {
                    message.readAt = now;
                    message.status = 'read';
                }
            });
        } else if (readerType === 'customer') {
            conversation.metadata.lastReadByCustomer = now;

            // Mark all admin messages as read
            conversation.messages.forEach(message => {
                if (message.sender.type === 'admin' && !message.readAt) {
                    message.readAt = now;
                    message.status = 'read';
                }
            });
        }

        conversation.updatedAt = now;
        return true;
    }

    static getConversationHistory(conversationId, limit = 50) {
        const conversation = this.getById(conversationId);
        if (!conversation) return null;

        const messages = conversation.messages
            .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt))
            .slice(-limit);

        return {
            conversation: {
                id: conversation.id,
                userId: conversation.userId,
                telegramId: conversation.telegramId,
                status: conversation.status,
                participants: conversation.participants,
                metadata: conversation.metadata
            },
            messages: messages
        };
    }

    static getActiveConversations() {
        return this.getAll().filter(conversation => conversation.status === 'active');
    }

    static getUnreadConversations() {
        return this.getAll().filter(conversation => conversation.metadata.unreadCount > 0);
    }

    static updateStatus(conversationId, status) {
        const conversation = this.getById(conversationId);
        if (!conversation) return null;

        conversation.status = status;
        conversation.updatedAt = new Date();
        return conversation;
    }

    static delete(conversationId) {
        if (!database.conversations) return false;

        const conversationIndex = database.conversations.findIndex(conversation => conversation.id === conversationId);
        if (conversationIndex === -1) return false;

        database.conversations.splice(conversationIndex, 1);
        return true;
    }
}

module.exports = Conversation;
