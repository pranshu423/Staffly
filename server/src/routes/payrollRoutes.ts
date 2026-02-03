import express from 'express';
import { generatePayroll, getMyPayroll, getAllPayroll, markAsPaid } from '../controllers/payrollController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/generate', protect, admin, generatePayroll);
router.get('/me', protect, getMyPayroll);
router.get('/all', protect, admin, getAllPayroll);
router.put('/:id/pay', protect, admin, markAsPaid);

export default router;
