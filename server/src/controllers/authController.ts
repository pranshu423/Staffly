import { Request, Response } from 'express';
import User from '../models/User';
import Company from '../models/Company';
import generateToken from '../utils/generateToken';
import { sendEmail, emailTemplates } from '../utils/emailService';

// @desc    Register a new user (Company Admin)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, companyName } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Create new company
        const company = await Company.create({
            name: companyName
        });

        const user = await User.create({
            name,
            email,
            password,
            role: 'admin',
            employeeId: 'ADMIN-' + Math.floor(Math.random() * 10000),
            department: 'Management',
            companyId: company._id
        });

        if (user) {
            // Send Welcome Email
            try {
                await sendEmail(
                    user.email,
                    'Welcome to Staffly!',
                    emailTemplates.welcome(user.name, user.email, user.role)
                );
            } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
            }

            const token = generateToken(user._id as unknown as string, user.role);
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyName: company.name,
                token
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            const token = generateToken(user._id as unknown as string, user.role);

            const companyName = user.companyId ? (user.companyId as any).name : 'Unknown';

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyName: companyName,
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req: Request, res: Response) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};
