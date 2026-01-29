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

export default router;
