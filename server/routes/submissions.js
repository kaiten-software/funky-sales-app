import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/tracker', authenticateToken, requireRole('administrator', 'super_admin'), async (req, res) => {
  try {
    const { date } = req.query;
    const [submissions] = await db.query(`
      SELECT 
        p.id as pos_id,
        p.name as pos_name,
        l.name as location_name,
        c.name as city_name,
        u.name as user_name,
        u.profile_photo,
        se.id as entry_id,
        se.submitted_at,
        CASE WHEN se.id IS NULL THEN 'not_submitted' ELSE 'submitted' END as status,
        (SELECT COALESCE(SUM(sed.amount), 0) FROM sales_entry_details sed WHERE sed.sales_entry_id = se.id) as total_amount
      FROM pos_terminals p
      JOIN locations l ON p.location_id = l.id
      JOIN cities c ON p.city_id = c.id
      LEFT JOIN user_pos up ON p.id = up.pos_id
      LEFT JOIN users u ON up.user_id = u.id
      LEFT JOIN sales_entries se ON p.id = se.pos_id AND se.entry_date = ?
      WHERE p.status = 'active'
      ORDER BY c.name, l.name, p.name
    `, [date || new Date().toISOString().split('T')[0]]);

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Error fetching submissions' });
  }
});

export default router;
