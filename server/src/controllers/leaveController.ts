import { Request, Response } from 'express';
import Leave from '../models/Leave';

const TOTAL_LEAVES = {
    casual: 12,
    sick: 12,
    paid: 15
};

// @desc    Apply for leave
// @route   POST /api/leaves/apply
// @access  Private
export const applyLeave = async (req: Request, res: Response) => {
    try {
        const { type, fromDate, toDate, reason } = req.body;
        const employeeId = (req as any).user._id;

        const leave = await Leave.create({
            employeeId,
            type,
            fromDate,
            toDate,
            reason
        });

        res.status(201).json(leave);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my leaves
// @route   GET /api/leaves/me
// @access  Private
export const getMyLeaves = async (req: Request, res: Response) => {
    try {
        const leaves = await Leave.find({ employeeId: (req as any).user._id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all leaves (Admin)
// @route   GET /api/leaves/all
// @access  Private/Admin
export const getAllLeaves = async (req: Request, res: Response) => {
    try {
        const leaves = await Leave.find().populate('employeeId', 'name email employeeId department').sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update leave status
// @route   PUT /api/leaves/:id/status
// @access  Private/Admin
export const updateLeaveStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            res.status(404).json({ message: 'Leave not found' });
            return;
        }

        leave.status = status;
        await leave.save();

        res.json(leave);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get leave balance
// @route   GET /api/leaves/balance
// @access  Private
export const getLeaveBalance = async (req: Request, res: Response) => {
    try {
        const employeeId = (req as any).user._id;
        const currentYear = new Date().getFullYear();

        // Count approved leaves for current year
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31);

        const approvedLeaves = await Leave.find({
            employeeId,
            status: 'approved',
            fromDate: { $gte: startOfYear, $lte: endOfYear }
        });

        // Simple calculation: 1 leave entry = X days. 
        // For accurate calculation, we should diff toDate and fromDate.
        // For this MVP, let's assume strict accounting and calculate days.

        const used = { casual: 0, sick: 0, paid: 0 };

        approvedLeaves.forEach(leave => {
            const days = Math.ceil((new Date(leave.toDate).getTime() - new Date(leave.fromDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
            if (leave.type === 'casual') used.casual += days;
            if (leave.type === 'sick') used.sick += days;
            if (leave.type === 'paid') used.paid += days;
        });

        const balance = {
            casual: TOTAL_LEAVES.casual - used.casual,
            sick: TOTAL_LEAVES.sick - used.sick,
            paid: TOTAL_LEAVES.paid - used.paid,
            used
        };

        res.json(balance);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
