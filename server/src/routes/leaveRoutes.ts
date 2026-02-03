import express from 'express';
import { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, getLeaveBalance } from '../controllers/leaveController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/apply', protect, applyLeave);
router.get('/me', protect, getMyLeaves);
router.get('/all', protect, admin, getAllLeaves);
router.put('/:id/status', protect, admin, updateLeaveStatus);
router.get('/balance', protect, getLeaveBalance);

export default router;
