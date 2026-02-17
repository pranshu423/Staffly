import mongoose, { Document, Schema } from 'mongoose';

export interface IAsset extends Document {
    name: string;
    type: string;
    serialNumber: string;
    status: 'Available' | 'Assigned' | 'Broken' | 'Lost';
    assignedTo?: mongoose.Schema.Types.ObjectId;
    companyId: mongoose.Schema.Types.ObjectId;
    purchaseDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const assetSchema = new Schema<IAsset>({
    name: {
        type: String,
        required: [true, 'Please add an asset name']
    },
    type: {
        type: String,
        required: [true, 'Please add an asset type']
    },
    serialNumber: {
        type: String,
        required: [true, 'Please add a serial number']
    },
    status: {
        type: String,
        enum: ['Available', 'Assigned', 'Broken', 'Lost'],
        default: 'Available'
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    purchaseDate: {
        type: Date,
        required: [true, 'Please add a purchase date']
    }
}, {
    timestamps: true
});

// Prevent duplicate serial numbers within the same company
assetSchema.index({ serialNumber: 1, companyId: 1 }, { unique: true });

export default mongoose.model<IAsset>('Asset', assetSchema);
