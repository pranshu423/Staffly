import mongoose, { Document, Schema } from 'mongoose';

export interface ICandidate extends Document {
    name: string;
    email: string;
    phone: string;
    position: string;
    status: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
    resumeUrl?: string;
    companyId: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const candidateSchema = new Schema<ICandidate>({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email']
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    position: {
        type: String,
        required: [true, 'Please specify the position']
    },
    status: {
        type: String,
        enum: ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'],
        default: 'Applied'
    },
    resumeUrl: {
        type: String
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, {
    timestamps: true
});

// Prevent duplicate candidates for same position
candidateSchema.index({ email: 1, companyId: 1 }, { unique: true });

export default mongoose.model<ICandidate>('Candidate', candidateSchema);
