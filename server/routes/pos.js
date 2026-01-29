import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Get user's assigned POS terminals
router.get('/user-pos', authenticateToken, async (req, res) => {
    try {
        const [posList] = await db.query(`
      SELECT p.id, p.name, l.name as location_name, c.name as city_name
      FROM pos p
      JOIN user_pos up ON p.id = up.pos_id
      JOIN locations l ON p.location_id = l.id
      JOIN cities c ON p.city_id = c.id
      WHERE up.user_id = ? AND p.status = 'active'
      ORDER BY c.name, l.name, p.name
    `, [req.user.id]);

        res.json(posList);
    } catch (error) {
        console.error('Error fetching user POS:', error);
        res.status(500).json({ message: 'Error fetching POS terminals' });
    }
});

export default router;
