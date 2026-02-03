import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { connectDB } from '../config/db';

dotenv.config();

const employeesBuffer = [
    {
        name: 'Demo Admin',
        email: 'admin@staffly.com',
        password: 'admin123',
        role: 'admin',
        employeeId: 'ADMIN-001',
        department: 'Management',
        joiningDate: new Date(),
        isActive: true,
    },
    {
        name: 'Demo Employee',
        email: 'employee@staffly.com',
        password: 'employee123',
        role: 'employee',
        employeeId: 'EMP-001',
        department: 'Engineering',
        joiningDate: new Date(),
        isActive: true,
    },
];

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing users
        await User.deleteMany({});
        console.log('Users cleared');

        // Create new users
        await User.create(employeesBuffer);
        console.log('Users imported');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

seedData();
