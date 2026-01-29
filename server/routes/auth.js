import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import db from '../config/database.js';

const router = Router();

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Get user from database
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ? AND status = ?',
            [email, 'active']
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Return user data (without password)
        const { password_hash, ...userData } = user;

        res.json({
            token,
            user: userData
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Verify token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Get fresh user data
        const [users] = await db.query(
            'SELECT id, name, email, role, can_delete, can_edit, can_view_all, status FROM users WHERE id = ? AND status = ?',
            [decoded.id, 'active']
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'User not found or inactive' });
        }

        res.json({ user: users[0] });

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Register (only for super admin)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, password_hash, role || 'regular_user']
        );

        res.status(201).json({
            message: 'User created successfully',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

export default router;
