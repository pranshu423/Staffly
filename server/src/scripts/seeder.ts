import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Company from '../models/Company';
import Attendance from '../models/Attendance';
import Leave from '../models/Leave';
import Payroll from '../models/Payroll';
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

        // Clear existing data
        await Company.deleteMany({});
        await User.deleteMany({});
        await Attendance.deleteMany({});
        await Leave.deleteMany({});
        await Payroll.deleteMany({});
        console.log('Data cleared');

        // Create Demo Company
        const company = await Company.create({
            name: 'Staffly Demo Corp'
        });

        // Create new users linked to company
        const employeesWithCompany = employeesBuffer.map(emp => ({
            ...emp,
            companyId: company._id
        }));

        await User.create(employeesWithCompany);
        console.log('Users imported');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

seedData();
