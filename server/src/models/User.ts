import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'employee';
    employeeId: string;
    department: string;
    joiningDate: Date;
    isActive: boolean;
    companyId: mongoose.Schema.Types.ObjectId;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    employeeId: { type: String }, // Removed unique: true from here, will handle via compound index
    department: { type: String },
    joiningDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true
});

// Compound index to ensure employeeId is unique within a company
UserSchema.index({ companyId: 1, employeeId: 1 }, { unique: true });

UserSchema.pre('save', async function (this: IUser, next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
