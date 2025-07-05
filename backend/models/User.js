const database = require('./database');
const { v4: uuidv4 } = require('uuid');

class User {
    static getAll() {
        return database.users;
    }

    static getById(id) {
        return database.users.find(user => user.id === id);
    }

    static getByPhone(phone) {
        return database.users.find(user => user.phone === phone);
    }

    static getByEmail(email) {
        return database.users.find(user => user.email === email);
    }

    static create(userData) {
        const user = {
            id: uuidv4(),
            name: userData.name,
            phone: userData.phone,
            email: userData.email,
            status: userData.status || 'active',
            createdAt: new Date(),
            lastSeen: new Date()
        };

        database.users.push(user);
        return user;
    }

    static update(id, updates) {
        const userIndex = database.users.findIndex(user => user.id === id);
        if (userIndex === -1) return null;

        database.users[userIndex] = {
            ...database.users[userIndex],
            ...updates,
            updatedAt: new Date()
        };

        return database.users[userIndex];
    }

    static delete(id) {
        const userIndex = database.users.findIndex(user => user.id === id);
        if (userIndex === -1) return false;

        database.users.splice(userIndex, 1);
        return true;
    }

    static updateLastSeen(id) {
        const user = this.getById(id);
        if (user) {
            user.lastSeen = new Date();
        }
        return user;
    }

    static getActiveUsers() {
        return database.users.filter(user => user.status === 'active');
    }

    static searchUsers(query) {
        const searchTerm = query.toLowerCase();
        return database.users.filter(user =>
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.phone.includes(searchTerm)
        );
    }
}

module.exports = User;
