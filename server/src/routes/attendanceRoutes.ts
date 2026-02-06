import express from 'express';
import { checkIn, checkOut, getMyAttendance, getAllAttendance, getTodayAttendance, getTeamStatus, getRecentActivity } from '../controllers/attendanceController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/today', protect, getTodayAttendance);
router.get('/me', protect, getMyAttendance);
router.get('/all', protect, admin, getAllAttendance);
router.get('/team-status', protect, getTeamStatus);
router.get('/recent-activity', protect, getRecentActivity);

export default router;
