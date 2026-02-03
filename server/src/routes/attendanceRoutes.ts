import express from 'express';
import { checkIn, checkOut, getMyAttendance, getAllAttendance, getTodayAttendance } from '../controllers/attendanceController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/today', protect, getTodayAttendance);
router.get('/me', protect, getMyAttendance);
router.get('/all', protect, admin, getAllAttendance);

export default router;
