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
        // Basic implementation, could add filtering by date/employee
        const attendance = await Attendance.find().populate('employeeId', 'name email employeeId department').sort({ date: -1 });
        res.json(attendance);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
