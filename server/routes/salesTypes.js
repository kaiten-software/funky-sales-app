import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Get active sales types
router.get('/active', authenticateToken, async (req, res) => {
    try {
        const [salesTypes] = await db.query(`
      SELECT id, name, attachment_applicable, attachment_required
      FROM sales_types
      WHERE status = 'active'
      ORDER BY name
    `);

        res.json(salesTypes);
    } catch (error) {
        console.error('Error fetching sales types:', error);
        res.status(500).json({ message: 'Error fetching sales types' });
    }
});

export default router;
