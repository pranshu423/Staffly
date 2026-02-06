import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import path from 'path';

// Load env from server root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || '');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const debug = async () => {
    await connectDB();

    console.log('--- Checking for Demo Employee ---');
    const demoEmp = await User.findOne({ email: 'employee@staffly.com' });
    console.log('Demo Employee (email=employee@staffly.com):', demoEmp ? 'EXISTS' : 'NOT FOUND');

    const demoEmpId = await User.findOne({ employeeId: 'EMP-001' });
    console.log('Demo Employee (id=EMP-001):', demoEmpId ? 'EXISTS' : 'NOT FOUND');

    console.log('--- Checking for Raj ---');
    const existingRaj = await User.findOne({ email: 'raj@company.com' });
    if (existingRaj) {
        console.log('Raj already exists:', existingRaj);
    } else {
        console.log('Raj does not exist.');
    }

    console.log('--- Attempting Create ---');
    const newEmployee = {
        name: 'Raj',
        email: 'raj@company.com',
        password: 'password123',
        department: 'Engineering',
        role: 'employee',
        joiningDate: '2026-02-06',
        // Simulate random ID generation
        employeeId: 'EMP-' + Math.floor(1000 + Math.random() * 9000)
    };

    try {
        const user = await User.create(newEmployee);
        console.log('User created successfully:', user);
        // Clean up
        await User.deleteOne({ _id: user._id });
        console.log('Cleaned up test user.');
    } catch (error: any) {
        console.error('CREATE FAILED:', error);
    }

    process.exit();
};

debug();
