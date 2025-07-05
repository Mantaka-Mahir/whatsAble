const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// In-memory database
const database = {
    users: [],
    messages: [],
    admins: []
};

// Sample users
const sampleUsers = [
    {
        id: uuidv4(),
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        status: 'active',
        createdAt: new Date('2024-01-15'),
        lastSeen: new Date()
    },
    {
        id: uuidv4(),
        name: 'Jane Smith',
        phone: '+1987654321',
        email: 'jane@example.com',
        status: 'active',
        createdAt: new Date('2024-01-20'),
        lastSeen: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
        id: uuidv4(),
        name: 'Mike Johnson',
        phone: '+1122334455',
        email: 'mike@example.com',
        status: 'inactive',
        createdAt: new Date('2024-01-10'),
        lastSeen: new Date(Date.now() - 86400000) // 1 day ago
    }
];

// Sample messages
const sampleMessages = [
    {
        id: uuidv4(),
        userId: sampleUsers[0].id,
        content: 'Hi John! Thanks for your interest in our services. Would you like to schedule a consultation?',
        type: 'initial',
        status: 'delivered',
        isRead: false,
        sentAt: new Date(Date.now() - 7200000), // 2 hours ago
        readAt: null,
        replies: []
    },
    {
        id: uuidv4(),
        userId: sampleUsers[1].id,
        content: 'Hello Jane! We have a special offer on our premium package. Are you interested?',
        type: 'initial',
        status: 'delivered',
        isRead: true,
        sentAt: new Date(Date.now() - 10800000), // 3 hours ago
        readAt: new Date(Date.now() - 9000000), // 2.5 hours ago
        replies: [
            {
                id: uuidv4(),
                content: 'Yes, I\'m interested! Can you tell me more?',
                sentAt: new Date(Date.now() - 8400000), // 2.3 hours ago
                sender: 'user'
            }
        ]
    },
    {
        id: uuidv4(),
        userId: sampleUsers[2].id,
        content: 'Hi Mike! Following up on our previous conversation. Are you still interested?',
        type: 'followup',
        status: 'delivered',
        isRead: false,
        sentAt: new Date(Date.now() - 3600000), // 1 hour ago
        readAt: null,
        replies: []
    }
];

// Sample admin users (passwords will be hashed during initialization)
const sampleAdmins = [
    {
        id: uuidv4(),
        username: 'admin',
        email: 'admin@autoengage.com',
        password: 'secret', // Will be hashed
        role: 'admin',
        createdAt: new Date('2024-01-01')
    },
    {
        id: uuidv4(),
        username: 'demo',
        email: 'demo@autoengage.com',
        password: 'secret', // Will be hashed
        role: 'user',
        createdAt: new Date('2024-01-01')
    }
];

// Initialize database with sample data
async function initializeDatabase() {
    database.users = [...sampleUsers];
    database.messages = [...sampleMessages];

    // Hash passwords for admin users
    const hashedAdmins = await Promise.all(
        sampleAdmins.map(async (admin) => ({
            ...admin,
            password: await bcrypt.hash(admin.password, 10)
        }))
    );

    database.admins = hashedAdmins;
}

// Initialize on module load
initializeDatabase().then(() => {
    console.log('📦 Database initialized with sample data');
    console.log(`👥 Users: ${database.users.length}`);
    console.log(`💬 Messages: ${database.messages.length}`);
    console.log(`🔐 Admins: ${database.admins.length}`);
}).catch(error => {
    console.error('❌ Database initialization failed:', error);
});

module.exports = database;
