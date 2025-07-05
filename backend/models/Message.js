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

    static create(messageData) {
        const message = {
            id: uuidv4(),
            userId: messageData.userId,
            content: messageData.content,
            type: messageData.type || 'initial', // 'initial', 'followup', 'manual'
            status: messageData.status || 'pending', // 'pending', 'delivered', 'failed'
            isRead: false,
            sentAt: new Date(),
            readAt: null,
            replies: []
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
        const thirtySecondsAgo = new Date(Date.now() - 30000);
        return database.messages.filter(message =>
            message.type === 'initial' &&
            !message.isRead &&
            message.replies.length === 0 &&
            new Date(message.sentAt) <= thirtySecondsAgo
        );
    }
}

module.exports = Message;
