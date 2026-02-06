import { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import User from '../models/User';

// @desc    Check in (Employee)
// @route   POST /api/attendance/check-in
// @access  Private
export const checkIn = async (req: Request, res: Response) => {
    try {
        const employeeId = req.user._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to midnight

        const existingAttendance = await Attendance.findOne({
            employeeId,
            date: today
        });

        if (existingAttendance) {
            res.status(400).json({ message: 'You have already checked in today.' });
            return;
        }

        const attendance = await Attendance.create({
            employeeId,
            companyId: (req as any).user.companyId,
            date: today,
            checkInTime: new Date(),
            status: 'Present'
        });

        res.status(201).json(attendance);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check out (Employee)
// @route   POST /api/attendance/check-out
// @access  Private
export const checkOut = async (req: Request, res: Response) => {
    try {
        const employeeId = req.user._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            employeeId,
            date: today
        });

        if (!attendance) {
            res.status(400).json({ message: 'You have not checked in today.' });
            return;
        }

        if (attendance.checkOutTime) {
            res.status(400).json({ message: 'You have already checked out today.' });
            return;
        }

        attendance.checkOutTime = new Date();

        // Calculate duration
        const durationMs = attendance.checkOutTime.getTime() - attendance.checkInTime.getTime();
        attendance.workDuration = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2)); // Hours

        await attendance.save();

        res.json(attendance);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user's attendance status for today
// @route   GET /api/attendance/today
// @access  Private
export const getTodayAttendance = async (req: Request, res: Response) => {
    try {
        const employeeId = req.user._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            employeeId,
            date: today
        });

        res.json(attendance || null);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get my attendance history
// @route   GET /api/attendance/me
// @access  Private
export const getMyAttendance = async (req: Request, res: Response) => {
    try {
        const attendance = await Attendance.find({ employeeId: req.user._id }).sort({ date: -1 });
        res.json(attendance);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all attendance (Admin)
// @route   GET /api/attendance/all
// @access  Private/Admin
export const getAllAttendance = async (req: Request, res: Response) => {
    try {
        // Filter by company
        const attendance = await Attendance.find({ companyId: (req as any).user.companyId }).populate('employeeId', 'name email employeeId department').sort({ date: -1 });
        res.json(attendance);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get team status stats
// @route   GET /api/attendance/team-status
// @access  Private
export const getTeamStatus = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).user.companyId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Total Employees
        const totalEmployees = await User.countDocuments({ companyId, role: 'employee' });

        // In Office (Checked in today)
        const activeAttendance = await Attendance.find({
            companyId,
            date: today,
            checkInTime: { $exists: true }
        });
        const inOffice = activeAttendance.length;

        // On Leave (Simple mock or query leaves if available - assuming 0 for now to keep it safe, or check Leave model later)
        // For now, let's return a safe mock or 0, as Leave model integration requires more check
        const onLeave = 0;

        res.json({
            totalEmployees,
            inOffice,
            onLeave
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get recent activity for company
// @route   GET /api/attendance/recent-activity
// @access  Private
export const getRecentActivity = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).user.companyId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get recent check-ins/outs for today
        const recent = await Attendance.find({
            companyId,
            date: today
        })
            .populate('employeeId', 'name')
            .sort({ updatedAt: -1 }) // Sort by most recent update (check-in or check-out)
            .limit(5);

        res.json(recent);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
