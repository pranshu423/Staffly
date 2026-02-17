import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
    title: string;
    description?: string;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    uploadedBy: mongoose.Schema.Types.ObjectId;
    owner: mongoose.Schema.Types.ObjectId; // User who owns the doc (for personal docs)
    companyId: mongoose.Schema.Types.ObjectId;
    isPublic: boolean; // Accessible by all employees?
    createdAt: Date;
    updatedAt: Date;
}

const documentSchema = new Schema<IDocument>({
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: {
        type: String
    },
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model<IDocument>('Document', documentSchema);
