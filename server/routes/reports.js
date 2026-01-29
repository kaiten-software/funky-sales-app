import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/sales-data', authenticateToken, requireRole('administrator', 'super_admin'), async (req, res) => {
    try {
        const [data] = await db.query('SELECT * FROM v_sales_by_type ORDER BY entry_date DESC LIMIT 100');
        res.json({ tableData: data, chartData: [] });
    } catch (error) {
        console.error('Error fetching report data:', error);
        res.status(500).json({ message: 'Error fetching reports' });
    }
});

export default router;
