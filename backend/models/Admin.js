const database = require('./database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class Admin {
    static getAll() {
        return database.admins.map(admin => {
            const { password, ...adminWithoutPassword } = admin;
            return adminWithoutPassword;
        });
    }

    static getById(id) {
        const admin = database.admins.find(admin => admin.id === id);
        if (admin) {
            const { password, ...adminWithoutPassword } = admin;
            return adminWithoutPassword;
        }
        return null;
    }

    static getByUsername(username) {
        return database.admins.find(admin => admin.username === username);
    }

    static getByEmail(email) {
        return database.admins.find(admin => admin.email === email);
    }

    static async create(adminData) {
        // Check if username or email already exists
        if (this.getByUsername(adminData.username)) {
            throw new Error('Username already exists');
        }
        if (this.getByEmail(adminData.email)) {
            throw new Error('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(adminData.password, 10);

        const admin = {
            id: uuidv4(),
            username: adminData.username,
            email: adminData.email,
            password: hashedPassword,
            role: adminData.role || 'user',
            createdAt: new Date()
        };

        database.admins.push(admin);

        // Return admin without password
        const { password, ...adminWithoutPassword } = admin;
        return adminWithoutPassword;
    }

    static async validatePassword(username, password) {
        const admin = this.getByUsername(username);
        if (!admin) {
            return null;
        }

        const isValid = await bcrypt.compare(password, admin.password);
        if (isValid) {
            const { password: _, ...adminWithoutPassword } = admin;
            return adminWithoutPassword;
        }

        return null;
    }

    static update(id, updates) {
        const adminIndex = database.admins.findIndex(admin => admin.id === id);
        if (adminIndex === -1) return null;

        // Don't update password directly - use changePassword method
        const { password, ...allowedUpdates } = updates;

        database.admins[adminIndex] = {
            ...database.admins[adminIndex],
            ...allowedUpdates,
            updatedAt: new Date()
        };

        const { password: _, ...adminWithoutPassword } = database.admins[adminIndex];
        return adminWithoutPassword;
    }

    static async changePassword(id, newPassword) {
        const adminIndex = database.admins.findIndex(admin => admin.id === id);
        if (adminIndex === -1) return false;

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        database.admins[adminIndex].password = hashedPassword;
        database.admins[adminIndex].updatedAt = new Date();

        return true;
    }

    static delete(id) {
        const adminIndex = database.admins.findIndex(admin => admin.id === id);
        if (adminIndex === -1) return false;

        database.admins.splice(adminIndex, 1);
        return true;
    }

    static getByRole(role) {
        return database.admins
            .filter(admin => admin.role === role)
            .map(admin => {
                const { password, ...adminWithoutPassword } = admin;
                return adminWithoutPassword;
            });
    }
}

module.exports = Admin;
