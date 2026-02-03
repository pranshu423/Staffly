import mongoose, { Schema, Document } from 'mongoose';

export interface IPayroll extends Document {
    employeeId: mongoose.Schema.Types.ObjectId;
    month: string; // YYYY-MM
    baseSalary: number;
    deductions: number;
    netPay: number;
    status: 'pending' | 'paid';
}

const PayrollSchema: Schema = new Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true },
    baseSalary: { type: Number, required: true },
    deductions: { type: Number, default: 0 },
    netPay: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' }
}, {
    timestamps: true
});

// Ensure one payroll per employee per month
PayrollSchema.index({ employeeId: 1, month: 1 }, { unique: true });

export default mongoose.model<IPayroll>('Payroll', PayrollSchema);
