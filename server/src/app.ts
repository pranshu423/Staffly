import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Serve static files
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
import authRoutes from './routes/authRoutes';
import employeeRoutes from './routes/employeeRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import leaveRoutes from './routes/leaveRoutes';
import payrollRoutes from './routes/payrollRoutes';
import recruitmentRoutes from './routes/recruitmentRoutes';
import assetRoutes from './routes/assetRoutes';
import documentRoutes from './routes/documentRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/documents', documentRoutes);

// Placeholder Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

export default app;
