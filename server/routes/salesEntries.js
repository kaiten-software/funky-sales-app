import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images and PDFs are allowed'));
    }
});

// Submit sales entry
router.post('/submit', authenticateToken, upload.any(), async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { pos_id, entry_date, entries } = req.body;
        const parsedEntries = JSON.parse(entries);

        // Check if entry already exists for this POS and date
        const [existing] = await connection.query(
            'SELECT id FROM sales_entries WHERE pos_id = ? AND entry_date = ?',
            [pos_id, entry_date]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Entry already exists for this date' });
        }

        // Insert sales entry
        const [entryResult] = await connection.query(
            'INSERT INTO sales_entries (user_id, pos_id, entry_date, status) VALUES (?, ?, ?, ?)',
            [req.user.id, pos_id, entry_date, 'submitted']
        );

        const salesEntryId = entryResult.insertId;

        // Insert sales entry details
        for (const [typeId, amount] of Object.entries(parsedEntries)) {
            const attachmentFile = req.files?.find(f => f.fieldname === `attachment_${typeId}`);
            const attachmentPath = attachmentFile ? `/uploads/${attachmentFile.filename}` : null;

            await connection.query(
                'INSERT INTO sales_entry_details (sales_entry_id, sales_type_id, amount, attachment_path) VALUES (?, ?, ?, ?)',
                [salesEntryId, typeId, amount, attachmentPath]
            );
        }

        await connection.commit();
        res.json({ message: 'Sales entry submitted successfully', entryId: salesEntryId });

    } catch (error) {
        await connection.rollback();
        console.error('Error submitting sales entry:', error);
        res.status(500).json({ message: 'Error submitting sales entry' });
    } finally {
        connection.release();
    }
});

// Get single entry by ID (for super_admin edit)
router.get('/entry/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Only super_admin can access this
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Get entry details
        const [entries] = await db.query(
            `SELECT se.id, se.pos_id, se.entry_date, se.user_id, se.status,
                    p.name as pos_name, u.name as user_name
             FROM sales_entries se
             LEFT JOIN pos_terminals p ON se.pos_id = p.id
             LEFT JOIN users u ON se.user_id = u.id
             WHERE se.id = ?`,
            [id]
        );

        if (entries.length === 0) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        // Get sales data for this entry
        const [salesData] = await db.query(
            `SELECT sed.sales_type_id, sed.amount, sed.attachment_path, st.name as sales_type_name
             FROM sales_entry_details sed
             LEFT JOIN sales_types st ON sed.sales_type_id = st.id
             WHERE sed.sales_entry_id = ?`,
            [id]
        );

        res.json({
            ...entries[0],
            sales_data: salesData
        });

    } catch (error) {
        console.error('Error fetching entry:', error);
        res.status(500).json({ message: 'Error fetching entry' });
    }
});

// View entry details (for admin & super_admin - read only)
router.get('/view/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Admin and super_admin can view
        if (req.user.role !== 'administrator' && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Get entry details
        const [entries] = await db.query(
            `SELECT se.id, se.pos_id, se.entry_date, se.user_id, se.status, se.submitted_at,
                    p.name as pos_name, u.name as user_name
             FROM sales_entries se
             LEFT JOIN pos_terminals p ON se.pos_id = p.id
             LEFT JOIN users u ON se.user_id = u.id
             WHERE se.id = ?`,
            [id]
        );

        if (entries.length === 0) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        // Get sales data for this entry
        const [salesData] = await db.query(
            `SELECT sed.sales_type_id, sed.amount, sed.attachment_path, st.name as sales_type_name
             FROM sales_entry_details sed
             LEFT JOIN sales_types st ON sed.sales_type_id = st.id
             WHERE sed.sales_entry_id = ?`,
            [id]
        );

        res.json({
            ...entries[0],
            sales_data: salesData
        });

    } catch (error) {
        console.error('Error fetching entry:', error);
        res.status(500).json({ message: 'Error fetching entry' });
    }
});

// Update entry (super_admin only)
router.put('/update/:id', authenticateToken, async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { id } = req.params;
        const { entries } = req.body;

        // Only super_admin can update entries
        if (req.user.role !== 'super_admin') {
            await connection.rollback();
            return res.status(403).json({ message: 'Access denied' });
        }

        await connection.beginTransaction();

        // Verify entry exists
        const [existing] = await connection.query(
            'SELECT id FROM sales_entries WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Entry not found' });
        }

        // Update each sales entry detail
        for (const [typeId, amount] of Object.entries(entries)) {
            await connection.query(
                `UPDATE sales_entry_details 
                 SET amount = ? 
                 WHERE sales_entry_id = ? AND sales_type_id = ?`,
                [parseFloat(amount) || 0, id, typeId]
            );
        }

        await connection.commit();
        res.json({ message: 'Entry updated successfully' });

    } catch (error) {
        await connection.rollback();
        console.error('Error updating entry:', error);
        res.status(500).json({ message: 'Error updating entry' });
    } finally {
        connection.release();
    }
});

export default router;
