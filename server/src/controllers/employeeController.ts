import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Admin
// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Admin
export const getEmployees = async (req: Request, res: Response) => {
    try {
        const employees = await User.find({
            role: 'employee',
            companyId: req.user.companyId
        }).select('-password');
        res.json(employees);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private/Admin
export const createEmployee = async (req: Request, res: Response) => {
    const { name, email, password, department, joiningDate } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Generate random employee ID
        const employeeId = 'EMP-' + Math.floor(1000 + Math.random() * 9000);

        const user = await User.create({
            name,
            email,
            password, // Mongoose middleware will hash this
            role: 'employee',
            employeeId,
            department,
            joiningDate,
            companyId: req.user.companyId
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                employeeId: user.employeeId
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
export const updateEmployee = async (req: Request, res: Response) => {
    const { name, email, department, role, isActive } = req.body;

    try {
        const user = await User.findOne({
            _id: req.params.id,
            companyId: req.user.companyId
        });

        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            user.department = department || user.department;
            user.role = role || user.role;
            user.isActive = isActive !== undefined ? isActive : user.isActive;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                department: updatedUser.department,
                isActive: updatedUser.isActive
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
export const deleteEmployee = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({
            _id: req.params.id,
            companyId: req.user.companyId
        });

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
