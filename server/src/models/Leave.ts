import mongoose, { Schema, Document } from 'mongoose';

export interface ILeave extends Document {
    employeeId: mongoose.Schema.Types.ObjectId;
    type: 'casual' | 'sick' | 'paid';
    fromDate: Date;
    toDate: Date;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
}

const LeaveSchema: Schema = new Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['casual', 'sick', 'paid'], required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, {
    timestamps: true
});

export default mongoose.model<ILeave>('Leave', LeaveSchema);
