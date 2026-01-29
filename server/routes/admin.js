import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = Router();

// ============ CITIES ============

router.get('/cities', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        const [cities] = await db.query('SELECT * FROM cities ORDER BY name');
        res.json(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ message: 'Error fetching cities' });
    }
});

router.post('/cities', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        const { name, status } = req.body;
        const [result] = await db.query(
            'INSERT INTO cities (name, status) VALUES (?, ?)',
            [name, status || 'active']
        );
        res.json({ id: result.insertId, message: 'City created successfully' });
    } catch (error) {
        console.error('Error creating city:', error);
        res.status(500).json({ message: 'Error creating city' });
    }
});

router.put('/cities/:id', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        const { name, status } = req.body;
        await db.query(
            'UPDATE cities SET name = ?, status = ? WHERE id = ?',
            [name, status, req.params.id]
        );
        res.json({ message: 'City updated successfully' });
    } catch (error) {
        console.error('Error updating city:', error);
        res.status(500).json({ message: 'Error updating city' });
    }
});

router.delete('/cities/:id', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        await db.query('DELETE FROM cities WHERE id = ?', [req.params.id]);
        res.json({ message: 'City deleted successfully' });
    } catch (error) {
        console.error('Error deleting city:', error);
        res.status(500).json({ message: 'Error deleting city' });
    }
});

// ============ LOCATIONS ============

router.get('/locations', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        const [locations] = await db.query(`
      SELECT l.*, c.name as city_name 
      FROM locations l 
      JOIN cities c ON l.city_id = c.id 
      ORDER BY c.name, l.name
    `);
        res.json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ message: 'Error fetching locations' });
    }
});

router.post('/locations', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        const { name, city_id, status } = req.body;
        const [result] = await db.query(
            'INSERT INTO locations (name, city_id, status) VALUES (?, ?, ?)',
            [name, city_id, status || 'active']
        );
        res.json({ id: result.insertId, message: 'Location created successfully' });
    } catch (error) {
        console.error('Error creating location:', error);
        res.status(500).json({ message: 'Error creating location' });
    }
});

router.put('/locations/:id', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        const { name, city_id, status } = req.body;
        await db.query(
            'UPDATE locations SET name = ?, city_id = ?, status = ? WHERE id = ?',
            [name, city_id, status, req.params.id]
        );
        res.json({ message: 'Location updated successfully' });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ message: 'Error updating location' });
    }
});

router.delete('/locations/:id', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        await db.query('DELETE FROM locations WHERE id = ?', [req.params.id]);
        res.json({ message: 'Location deleted successfully' });
    } catch (error) {
        console.error('Error deleting location:', error);
        res.status(500).json({ message: 'Error deleting location' });
    }
});

// ============ POS ============

router.get('/pos', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        const [pos] = await db.query(`
      SELECT p.*, l.name as location_name, c.name as city_name
      FROM pos p
      JOIN locations l ON p.location_id = l.id
      JOIN cities c ON p.city_id = c.id
      ORDER BY c.name, l.name, p.name
    `);
        res.json(pos);
    } catch (error) {
        console.error('Error fetching POS:', error);
        res.status(500).json({ message: 'Error fetching POS' });
    }
});

router.post('/pos', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        const { name, location_id, city_id, status } = req.body;
        const [result] = await db.query(
            'INSERT INTO pos (name, location_id, city_id, status) VALUES (?, ?, ?, ?)',
            [name, location_id, city_id, status || 'active']
        );
        res.json({ id: result.insertId, message: 'POS created successfully' });
    } catch (error) {
        console.error('Error creating POS:', error);
        res.status(500).json({ message: 'Error creating POS' });
    }
});

router.put('/pos/:id', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        const { name, location_id, city_id, status } = req.body;
        await db.query(
            'UPDATE pos SET name = ?, location_id = ?, city_id = ?, status = ? WHERE id = ?',
            [name, location_id, city_id, status, req.params.id]
        );
        res.json({ message: 'POS updated successfully' });
    } catch (error) {
        console.error('Error updating POS:', error);
        res.status(500).json({ message: 'Error updating POS' });
    }
});

router.delete('/pos/:id', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        await db.query('DELETE FROM pos WHERE id = ?', [req.params.id]);
        res.json({ message: 'POS deleted successfully' });
    } catch (error) {
        console.error('Error deleting POS:', error);
        res.status(500).json({ message: 'Error deleting POS' });
    }
});

// ============ USERS ============

router.get('/users', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, status FROM users ORDER BY name');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

router.post('/users', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        const { name, email, password, role, status } = req.body;
        const password_hash = await bcrypt.hash(password || 'password123', 10);
        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
            [name, email, password_hash, role || 'regular_user', status || 'active']
        );
        res.json({ id: result.insertId, message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

router.put('/users/:id', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        const { name, email, role, status } = req.body;
        await db.query(
            'UPDATE users SET name = ?, email = ?, role = ?, status = ? WHERE id = ?',
            [name, email, role, status, req.params.id]
        );
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
});

router.delete('/users/:id', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// ============ SALES TYPES ============

router.get('/sales-types', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        const [types] = await db.query('SELECT * FROM sales_types ORDER BY name');
        res.json(types);
    } catch (error) {
        console.error('Error fetching sales types:', error);
        res.status(500).json({ message: 'Error fetching sales types' });
    }
});

router.post('/sales-types', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        const { name, attachment_applicable, attachment_required, status } = req.body;
        const [result] = await db.query(
            'INSERT INTO sales_types (name, attachment_applicable, attachment_required, status) VALUES (?, ?, ?, ?)',
            [name, attachment_applicable || false, attachment_required || false, status || 'active']
        );
        res.json({ id: result.insertId, message: 'Sales type created successfully' });
    } catch (error) {
        console.error('Error creating sales type:', error);
        res.status(500).json({ message: 'Error creating sales type' });
    }
});

router.put('/sales-types/:id', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        const { name, attachment_applicable, attachment_required, status } = req.body;
        await db.query(
            'UPDATE sales_types SET name = ?, attachment_applicable = ?, attachment_required = ?, status = ? WHERE id = ?',
            [name, attachment_applicable, attachment_required, status, req.params.id]
        );
        res.json({ message: 'Sales type updated successfully' });
    } catch (error) {
        console.error('Error updating sales type:', error);
        res.status(500).json({ message: 'Error updating sales type' });
    }
});

router.delete('/sales-types/:id', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        await db.query('DELETE FROM sales_types WHERE id = ?', [req.params.id]);
        res.json({ message: 'Sales type deleted successfully' });
    } catch (error) {
        console.error('Error deleting sales type:', error);
        res.status(500).json({ message: 'Error deleting sales type' });
    }
});

export default router;
