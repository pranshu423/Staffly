import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
    employeeId: mongoose.Schema.Types.ObjectId;
    companyId: mongoose.Schema.Types.ObjectId;
    date: Date;
    checkInTime: Date;
    checkOutTime?: Date;
    status: 'Present' | 'Absent' | 'Half-day';
    workDuration?: number; // in hours
}

const AttendanceSchema: Schema = new Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    date: { type: Date, required: true },
    checkInTime: { type: Date, required: true },
    checkOutTime: { type: Date },
    status: { type: String, enum: ['Present', 'Absent', 'Half-day'], default: 'Present' },
    workDuration: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Ensure one entry per employee per day
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
