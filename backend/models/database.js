const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// In-memory database
const database = {
    users: [],
    messages: [],
    conversations: [],
    admins: []
};

// Admin users for dashboard access
const sampleAdmins = [
    {
        id: uuidv4(),
        username: 'admin',
        email: 'admin@whatsable.com',
        password: 'secret', // Will be hashed
        role: 'admin',
        createdAt: new Date('2024-01-01')
    },
    {
        id: uuidv4(),
        username: 'demo',
        email: 'demo@whatsable.com',
        password: 'secret', // Will be hashed
        role: 'user',
        createdAt: new Date('2024-01-01')
    }
];

// Sample users with realistic data for demo
const sampleUsers = [
    {
        id: uuidv4(),
        name: 'John Smith',
        phoneNumber: '+14155552671',
        email: 'john.smith@example.com',
        telegramId: '123456789',
        isActive: true,
        status: 'active',
        source: 'telegram',
        createdAt: new Date('2025-06-28'),
        lastSeen: new Date('2025-07-10')
    },
    {
        id: uuidv4(),
        name: 'Emma Watson',
        phoneNumber: '+14155552672',
        email: 'emma.watson@example.com',
        telegramId: '987654321',
        isActive: true,
        status: 'active',
        source: 'telegram',
        createdAt: new Date('2025-07-01'),
        lastSeen: new Date('2025-07-10')
    },
    {
        id: uuidv4(),
        name: 'Michael Chen',
        phoneNumber: '+14155552673',
        email: 'michael.chen@example.com',
        telegramId: '246813579',
        isActive: true,
        status: 'active',
        source: 'telegram',
        createdAt: new Date('2025-07-05'),
        lastSeen: new Date('2025-07-09')
    },
    {
        id: uuidv4(),
        name: 'Sofia Rodriguez',
        phoneNumber: '+14155552674',
        email: 'sofia.rodriguez@example.com',
        telegramId: '135792468',
        isActive: true,
        status: 'active',
        source: 'telegram',
        createdAt: new Date('2025-07-08'),
        lastSeen: new Date('2025-07-11')
    }
];

// Initialize database with sample data for showcasing
async function initializeDatabase() {
    // Start with clean data
    database.users = [];
    database.messages = [];
    database.conversations = [];

    // Hash passwords for admin users
    const hashedAdmins = await Promise.all(
        sampleAdmins.map(async (admin) => ({
            ...admin,
            password: await bcrypt.hash(admin.password, 10)
        }))
    );

    database.admins = hashedAdmins;

    // Add sample users
    database.users = sampleUsers;

    // Create conversations for each user
    const conversations = sampleUsers.map(user => {
        return {
            id: uuidv4(),
            userId: user.id,
            telegramId: user.telegramId,
            phoneNumber: user.phoneNumber,
            status: 'active',
            createdAt: user.createdAt,
            updatedAt: new Date(),
            lastMessageAt: new Date(),
            messages: [],
            participants: [
                {
                    id: user.id,
                    type: 'customer',
                    name: user.name
                },
                {
                    id: 'system',
                    type: 'admin',
                    name: 'WhatsAble Assistant'
                }
            ],
            metadata: {
                source: user.source,
                lastReadByAdmin: null,
                lastReadByCustomer: null,
                unreadCount: 0,
                totalMessages: 0
            }
        };
    });

    database.conversations = conversations;

    // Create sample message history for each conversation
    sampleUsers.forEach((user, index) => {
        const conversation = conversations[index];
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        // Message templates based on user
        let messageHistory;

        switch (index) {
            case 0: // John - Complete conversation with followup needed
                messageHistory = [
                    {
                        id: uuidv4(),
                        userId: user.id,
                        telegramId: user.telegramId,
                        content: `Hi ${user.name}! Welcome to WhatsAble. How can we help you automate your customer follow-ups?`,
                        type: 'initial',
                        status: 'delivered',
                        sentAt: twoDaysAgo,
                        isRead: true,
                        source: 'telegram',
                        isFromCustomer: false,
                        conversationId: conversation.id,
                        replies: []
                    },
                    {
                        id: uuidv4(),
                        userId: user.id,
                        telegramId: user.telegramId,
                        content: "Hi! I'm looking for a solution to automate follow-ups with my customers. How does WhatsAble work?",
                        type: 'response',
                        status: 'received',
                        sentAt: new Date(twoDaysAgo.getTime() + 20 * 60000),
                        isRead: true,
                        source: 'telegram',
                        isFromCustomer: true,
                        conversationId: conversation.id,
                        replies: []
                    },
                    {
                        id: uuidv4(),
                        userId: user.id,
                        telegramId: user.telegramId,
                        content: 'WhatsAble helps you automate follow-ups with customers across WhatsApp and Telegram. Our AI system ensures timely responses and keeps your customers engaged. Would you like to see how it works with a quick demo?',
                        type: 'text',
                        status: 'delivered',
                        sentAt: new Date(twoDaysAgo.getTime() + 25 * 60000),
                        isRead: true,
                        source: 'telegram',
                        isFromCustomer: false,
                        conversationId: conversation.id,
                        replies: []
                    },
                    {
                        id: uuidv4(),
                        userId: user.id,
                        telegramId: user.telegramId,
                        content: 'Yes, I would love to see a demo. Can you also tell me about pricing?',
                        type: 'response',
                        status: 'received',
                        sentAt: yesterday,
                        isRead: true,
                        source: 'telegram',
                        isFromCustomer: true,
                        conversationId: conversation.id,
                        replies: []
                    },
                    {
                        id: uuidv4(),
                        userId: user.id,
                        telegramId: user.telegramId,
                        content: 'Great! Our pricing starts at $29/month for up to 500 automated follow-ups. We also offer a 14-day free trial. Would you like me to set up a trial account for you?',
                        type: 'text',
                        status: 'delivered',
                        sentAt: new Date(yesterday.getTime() + 15 * 60000),
                        isRead: false, // Unread message that needs follow-up
                        source: 'telegram',
                        isFromCustomer: false,
                        conversationId: conversation.id,
                        needsFollowup: true,
                        replies: []
                    }
                ];
                break;

            case 1: // Emma - Recent conversation
                messageHistory = [
                    {
                        id: uuidv4(),
                        userId: user.id,
                        telegramId: user.telegramId,
                        content: `Hello ${user.name}! Welcome to WhatsAble. How can we assist you today?`,
                        type: 'initial',
                        status: 'delivered',
                        sentAt: yesterday,
                        isRead: true,
                        source: 'telegram',
                        isFromCustomer: false,
                        conversationId: conversation.id,
                        replies: []
                    },
                    {
                        id: uuidv4(),
                        userId: user.id,
                        telegramId: user.telegramId,
                        content: "Hi, I run a small boutique and I'm interested in your customer follow-up system. Do you have features for scheduling reminders about new arrivals?",
                        type: 'response',
                        status: 'received',
                        sentAt: new Date(yesterday.getTime() + 30 * 60000),
                        isRead: true,
                        source: 'telegram',
                        isFromCustomer: true,
                        conversationId: conversation.id,
                        replies: []
                    },
                    {
                        id: uuidv4(),
                        userId: user.id,
                        telegramId: user.telegramId,
                        content: 'Absolutely! WhatsAble allows you to schedule automated notifications about new arrivals. You can segment customers by preferences and send personalized updates. Would you like to see how this works in a demo?',
                        type: 'text',
                        status: 'delivered',
                        sentAt: new Date(yesterday.getTime() + 35 * 60000),
                        isRead: false, // Unread message that needs follow-up
                        source: 'telegram',
                        isFromCustomer: false,
                        conversationId: conversation.id,
                        needsFollowup: true,
                        replies: []
                    }
                ];
                break;

            case 2: // Michael - Conversation with AI-generated image
                messageHistory = [
                    {
                        id: uuidv4(),
                        userId: user.id,
                        telegramId: user.telegramId,
                        content: `Welcome to WhatsAble, ${user.name}! How can we help you with customer engagement today?`,
                        type: 'initial',
                        status: 'delivered',
                        sentAt: new Date(today.getTime() - 5 * 3600000), // 5 hours ago
                        isRead: true,
                        source: 'telegram',
                        isFromCustomer: false,
                        conversationId: conversation.id,
                        replies: []
                    },
                    {
                        id: uuidv4(),
                        userId: user.id,
                        telegramId: user.telegramId,
                        content: 'Can you show me what the WhatsAble dashboard looks like?',
                        type: 'response',
                        status: 'received',
                        sentAt: new Date(today.getTime() - 4.8 * 3600000),
                        isRead: true,
                        source: 'telegram',
                        isFromCustomer: true,
                        conversationId: conversation.id,
                        replies: []
                    },
                    {
                        id: uuidv4(),
                        userId: user.id,
                        telegramId: user.telegramId,
                        content: '[Image: WhatsAble dashboard showing customer analytics and follow-up statistics]',
                        type: 'image',
                        status: 'delivered',
                        sentAt: new Date(today.getTime() - 4.7 * 3600000),
                        isRead: true,
                        source: 'telegram',
                        isFromCustomer: false,
                        conversationId: conversation.id,
                        replies: []
                    },
                    {
                        id: uuidv4(),
                        userId: user.id,
                        telegramId: user.telegramId,
                        content: 'This is the WhatsAble dashboard where you can see all your customer interactions, pending follow-ups, and engagement metrics. You can also create automation templates here. Would you like more information about any specific feature?',
                        type: 'text',
                        status: 'delivered',
                        sentAt: new Date(today.getTime() - 4.6 * 3600000),
                        isRead: false, // Needs followup
                        source: 'telegram',
                        isFromCustomer: false,
                        conversationId: conversation.id,
                        needsFollowup: true,
                        replies: []
                    }
                ];
                break;

            case 3: // Sofia - New lead with just initial message
                messageHistory = [
                    {
                        id: uuidv4(),
                        userId: user.id,
                        telegramId: user.telegramId,
                        content: `Hello ${user.name}! Thank you for your interest in WhatsAble. Our system helps businesses automate customer follow-ups to ensure no opportunity is missed. Would you like to learn how it can help your business?`,
                        type: 'initial',
                        status: 'delivered',
                        sentAt: new Date(today.getTime() - 2 * 3600000), // 2 hours ago
                        isRead: false, // Unread initial message
                        source: 'telegram',
                        isFromCustomer: false,
                        conversationId: conversation.id,
                        needsFollowup: true,
                        replies: []
                    }
                ];
                break;
        }

        // Add messages to the database
        database.messages = [...database.messages, ...messageHistory];

        // Add messages to conversations for API retrieval
        messageHistory.forEach(msg => {
            const conversationMsg = {
                id: msg.id,
                content: msg.content,
                type: msg.type,
                sentAt: msg.sentAt,
                sender: {
                    id: msg.isFromCustomer ? user.id : 'system',
                    type: msg.isFromCustomer ? 'customer' : 'admin',
                    name: msg.isFromCustomer ? user.name : 'WhatsAble Assistant'
                },
                metadata: {
                    source: msg.source,
                    status: msg.status
                }
            };

            const conv = database.conversations.find(c => c.id === msg.conversationId);
            if (conv) {
                conv.messages.push(conversationMsg);
                conv.lastMessageAt = msg.sentAt > conv.lastMessageAt ? msg.sentAt : conv.lastMessageAt;
                conv.metadata.totalMessages++;
                if (!msg.isRead && !msg.isFromCustomer) {
                    conv.metadata.unreadCount++;
                }
            }
        });
    });
}

// Initialize on module load
initializeDatabase().then(() => {
    console.log('📦 Sample database initialized for product showcase');
    console.log(`👥 Users: ${database.users.length}`);
    console.log(`💬 Messages: ${database.messages.length}`);
    console.log(`💬 Conversations: ${database.conversations?.length || 0}`);
    console.log(`🔐 Admins: ${database.admins.length}`);
}).catch(error => {
    console.error('❌ Database initialization failed:', error);
});

module.exports = database;
