import { Request, Response } from 'express';
import Asset from '../models/Asset';
import User from '../models/User';

// @desc    Get all assets
// @route   GET /api/assets
// @access  Private
export const getAssets = async (req: Request, res: Response) => {
    try {
        const assets = await Asset.find({ companyId: (req as any).user.companyId })
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });
        res.json(assets);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new asset
// @route   POST /api/assets
// @access  Private
export const addAsset = async (req: Request, res: Response) => {
    try {
        const { name, type, serialNumber, purchaseDate } = req.body;

        const assetExists = await Asset.findOne({
            serialNumber,
            companyId: (req as any).user.companyId
        });

        if (assetExists) {
            res.status(400).json({ message: 'Asset with this serial number already exists' });
            return;
        }

        const asset = await Asset.create({
            name,
            type,
            serialNumber,
            purchaseDate,
            companyId: (req as any).user.companyId
        });

        res.status(201).json(asset);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update asset (Assign/Unassign/Edit)
// @route   PUT /api/assets/:id
// @access  Private
export const updateAsset = async (req: Request, res: Response) => {
    try {
        const { name, type, serialNumber, status, assignedTo } = req.body;
        const asset = await Asset.findById(req.params.id);

        if (!asset) {
            res.status(404).json({ message: 'Asset not found' });
            return;
        }

        // Verify company ownership
        if (asset.companyId.toString() !== (req as any).user.companyId.toString()) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        asset.name = name || asset.name;
        asset.type = type || asset.type;
        asset.serialNumber = serialNumber || asset.serialNumber;

        if (status) {
            asset.status = status;
            // If status is changed to Available/Broken/Lost, unassign user automatically
            if (status !== 'Assigned') {
                asset.assignedTo = undefined;
            }
        }

        if (assignedTo !== undefined) {
            // If assignedTo is provided (even null/empty string to unassign)
            if (assignedTo) {
                const user = await User.findById(assignedTo);
                if (!user) {
                    res.status(404).json({ message: 'User not found' });
                    return;
                }
                asset.assignedTo = assignedTo;
                asset.status = 'Assigned';
            } else {
                asset.assignedTo = undefined;
                asset.status = 'Available';
            }
        }

        await asset.save();
        const updatedAsset = await Asset.findById(asset._id).populate('assignedTo', 'name email');

        res.json(updatedAsset);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private
export const deleteAsset = async (req: Request, res: Response) => {
    try {
        const asset = await Asset.findById(req.params.id);

        if (!asset) {
            res.status(404).json({ message: 'Asset not found' });
            return;
        }

        // Verify company ownership
        if (asset.companyId.toString() !== (req as any).user.companyId.toString()) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        await asset.deleteOne();
        res.json({ message: 'Asset removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
