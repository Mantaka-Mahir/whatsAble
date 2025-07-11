const database = require('./database');
const { v4: uuidv4 } = require('uuid');

class Message {
    static getAll() {
        return database.messages;
    }

    static getById(id) {
        return database.messages.find(message => message.id === id);
    }

    static getByUserId(userId) {
        return database.messages
            .filter(message => message.userId === userId)
            .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    }

    static getConversationMessages(userId, telegramId = null) {
        // Get messages for a specific conversation (WhatsApp-style)
        const messages = database.messages
            .filter(message => {
                if (telegramId) {
                    return message.userId === userId || message.telegramId === telegramId;
                }
                return message.userId === userId;
            })
            .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

        // Format messages in WhatsApp-style conversation format
        return messages.map(message => ({
            id: message.id,
            content: message.content,
            sender: {
                id: message.isFromCustomer ? userId : 'admin',
                type: message.isFromCustomer ? 'customer' : 'admin',
                name: message.isFromCustomer ? 'Customer' : 'WhatsAble Assistant'
            },
            timestamp: message.sentAt,
            status: message.status,
            isRead: message.isRead,
            type: message.type,
            source: message.source,
            replies: message.replies || []
        }));
    }

    static create(messageData) {
        const message = {
            id: uuidv4(),
            userId: messageData.userId,
            telegramId: messageData.telegramId || null,
            content: messageData.content,
            type: messageData.type || 'initial', // 'initial', 'followup', 'manual', 'response', 'automated'
            status: messageData.status || 'pending', // 'pending', 'delivered', 'failed', 'received', 'read'
            isRead: false,
            sentAt: new Date(),
            readAt: null,
            replies: [],
            source: messageData.source || 'manual', // 'manual', 'n8n', 'telegram', 'whatsapp'
            isFromCustomer: messageData.isFromCustomer || false,
            // WhatsApp-style metadata
            conversationId: messageData.conversationId || null,
            replyTo: messageData.replyTo || null,
            metadata: {
                automated: messageData.automated || false,
                originalMessageId: messageData.originalMessageId || null,
                platform: messageData.platform || 'telegram'
            }
        };

        database.messages.push(message);
        return message;
    }

    static markAsRead(id) {
        const message = this.getById(id);
        if (message && !message.isRead) {
            message.isRead = true;
            message.readAt = new Date();
            return message;
        }
        return null;
    }

    static addReply(messageId, replyContent, sender = 'user') {
        const message = this.getById(messageId);
        if (!message) return null;

        const reply = {
            id: uuidv4(),
            content: replyContent,
            sentAt: new Date(),
            sender: sender // 'user' or 'admin'
        };

        message.replies.push(reply);

        // If user replied, mark original message as read
        if (sender === 'user') {
            this.markAsRead(messageId);
        }

        return reply;
    }

    static updateStatus(id, status) {
        const message = this.getById(id);
        if (message) {
            message.status = status;
            if (status === 'delivered') {
                message.deliveredAt = new Date();
            }
            return message;
        }
        return null;
    }

    static getUnreadMessages() {
        return database.messages.filter(message => !message.isRead);
    }

    static getMessagesByType(type) {
        return database.messages.filter(message => message.type === type);
    }

    static getRecentMessages(limit = 10) {
        return database.messages
            .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
            .slice(0, limit);
    }

    static delete(id) {
        const messageIndex = database.messages.findIndex(message => message.id === id);
        if (messageIndex === -1) return false;

        database.messages.splice(messageIndex, 1);
        return true;
    }

    static getMessagesWithReplies() {
        return database.messages.filter(message => message.replies.length > 0);
    }

    static getPendingFollowups() {
        // Return messages that either:
        // 1. Are explicitly marked as needing followup, OR
        // 2. Are unread system messages that were sent more than a day ago
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return database.messages.filter(message =>
            // Explicitly marked messages
            (message.needsFollowup === true) ||
            // Older unread system messages
            (!message.isFromCustomer &&
                !message.isRead &&
                new Date(message.sentAt) <= oneDayAgo)
        );
    }
}

module.exports = Message;
