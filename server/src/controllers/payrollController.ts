import { Request, Response } from 'express';
import Payroll from '../models/Payroll';
import User from '../models/User';
import { sendEmail, emailTemplates } from '../utils/emailService';

// @desc    Generate payroll (Admin)
// @route   POST /api/payroll/generate
// @access  Private/Admin
export const generatePayroll = async (req: Request, res: Response) => {
    try {
        const { employeeId, month, baseSalary, deductions } = req.body;

        // Calculate Net Pay
        // Simple logic: Base - Deductions
        // In real world, logic is more complex (tax, etc.)
        const netPay = parseFloat(baseSalary) - parseFloat(deductions || 0);

        const payroll = await Payroll.create({
            employeeId,
            companyId: (req as any).user.companyId,
            month,
            baseSalary,
            deductions: deductions || 0,
            netPay,
            status: 'paid' // Default to paid as Admin generated it
        });

        // Send Payroll Email
        try {
            const employee = await User.findById(employeeId);
            if (employee && employee.email) {
                await sendEmail(
                    employee.email,
                    `Payroll Generated - ${month}`,
                    emailTemplates.payrollGenerated(employee.name, month, netPay, 'paid')
                );
            }
        } catch (emailError) {
            console.error('Failed to send payroll email:', emailError);
        }

        res.status(201).json(payroll);
    } catch (error: any) {
        // Handle duplicate key error
        if (error.code === 11000) {
            res.status(400).json({ message: 'Payroll for this month already exists for this employee.' });
            return;
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my payroll history
// @route   GET /api/payroll/me
// @access  Private
export const getMyPayroll = async (req: Request, res: Response) => {
    try {
        const payrolls = await Payroll.find({ employeeId: (req as any).user._id }).sort({ month: -1 });
        res.json(payrolls);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all payroll records (Admin)
// @route   GET /api/payroll/all
// @access  Private/Admin
export const getAllPayroll = async (req: Request, res: Response) => {
    try {
        const payrolls = await Payroll.find({ companyId: (req as any).user.companyId }).populate('employeeId', 'name email employeeId department').sort({ month: -1 });
        res.json(payrolls);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark payroll as paid
// @route   PUT /api/payroll/:id/pay
// @access  Private/Admin
export const markAsPaid = async (req: Request, res: Response) => {
    try {
        const payroll = await Payroll.findById(req.params.id).populate('employeeId', 'name email');

        if (!payroll) {
            res.status(404).json({ message: 'Payroll record not found' });
            return;
        }

        payroll.status = 'paid';
        await payroll.save();

        // Send Email
        try {
            if ((payroll.employeeId as any).email) {
                await sendEmail(
                    (payroll.employeeId as any).email,
                    `Payroll Status Update - ${payroll.month}`,
                    emailTemplates.payrollGenerated(
                        (payroll.employeeId as any).name,
                        payroll.month,
                        payroll.netPay,
                        'paid'
                    )
                );
            }
        } catch (emailError) {
            console.error('Failed to send payroll email:', emailError);
        }

        res.json(payroll);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
