import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Get dashboard stats
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Today's sales
        const [todaySales] = await db.query(`
      SELECT COALESCE(SUM(sed.amount), 0) as total
      FROM sales_entries se
      JOIN sales_entry_details sed ON se.id = sed.sales_entry_id
      WHERE se.entry_date = CURDATE()
      ${userRole === 'regular_user' ? 'AND se.user_id = ?' : ''}
    `, userRole === 'regular_user' ? [userId] : []);

        // This week's sales
        const [weekSales] = await db.query(`
      SELECT COALESCE(SUM(sed.amount), 0) as total
      FROM sales_entries se
      JOIN sales_entry_details sed ON se.id = sed.sales_entry_id
      WHERE se.entry_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ${userRole === 'regular_user' ? 'AND se.user_id = ?' : ''}
    `, userRole === 'regular_user' ? [userId] : []);

        // This month's sales
        const [monthSales] = await db.query(`
      SELECT COALESCE(SUM(sed.amount), 0) as total
      FROM sales_entries se
      JOIN sales_entry_details sed ON se.id = sed.sales_entry_id
      WHERE MONTH(se.entry_date) = MONTH(CURDATE())
      AND YEAR(se.entry_date) = YEAR(CURDATE())
      ${userRole === 'regular_user' ? 'AND se.user_id = ?' : ''}
    `, userRole === 'regular_user' ? [userId] : []);

        // Pending submissions (for admins)
        let pendingSubmissions = 0;
        if (userRole !== 'regular_user') {
            const [pending] = await db.query(`
        SELECT COUNT(DISTINCT p.id) as count
        FROM pos p
        LEFT JOIN sales_entries se ON p.id = se.pos_id AND se.entry_date = CURDATE()
        WHERE p.status = 'active' AND se.id IS NULL
      `);
            pendingSubmissions = pending[0].count;
        }

        res.json({
            todaySales: parseFloat(todaySales[0].total),
            weekSales: parseFloat(weekSales[0].total),
            monthSales: parseFloat(monthSales[0].total),
            pendingSubmissions
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
});

// Get recent entries
router.get('/recent-entries', authenticateToken, async (req, res) => {
    try {
        const [entries] = await db.query(`
      SELECT * FROM v_sales_entries_complete
      ORDER BY submitted_at DESC
      LIMIT 10
    `);

        res.json(entries);

    } catch (error) {
        console.error('Recent entries error:', error);
        res.status(500).json({ message: 'Error fetching recent entries' });
    }
});

export default router;
