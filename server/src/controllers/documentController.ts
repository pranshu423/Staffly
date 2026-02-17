import { Request, Response } from 'express';
import DocumentModel from '../models/Document';
import fs from 'fs';
import path from 'path';

// @desc    Upload a new document
// @route   POST /api/documents
// @access  Private
export const uploadDocument = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const { title, description, isPublic } = req.body;

        const document = await DocumentModel.create({
            title,
            description,
            fileName: req.file.filename,
            filePath: `/uploads/${req.file.filename}`,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            uploadedBy: (req as any).user._id,
            owner: (req as any).user._id, // Initially owned by uploader
            companyId: (req as any).user.companyId,
            isPublic: isPublic === 'true' // FormData sends strings
        });

        res.status(201).json(document);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all documents (User's + Public)
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const companyId = (req as any).user.companyId;

        const documents = await DocumentModel.find({
            companyId,
            $or: [
                { owner: userId },
                { isPublic: true },
                { uploadedBy: userId } // In case admin uploaded but assigned transparency? Keeping simple: User sees own + public
            ]
        })
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(documents);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get documents for specific employee (Admin)
// @route   GET /api/documents/employee/:id
// @access  Private/Admin
export const getEmployeeDocuments = async (req: Request, res: Response) => {
    try {
        const documents = await DocumentModel.find({
            owner: req.params.id,
            companyId: (req as any).user.companyId
        })
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(documents);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const document = await DocumentModel.findById(req.params.id);

        if (!document) {
            res.status(404).json({ message: 'Document not found' });
            return;
        }

        // Authorization: Owner or Admin
        if (
            document.owner.toString() !== (req as any).user._id.toString() &&
            (req as any).user.role !== 'admin'
        ) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '../../uploads', document.fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await document.deleteOne();
        res.json({ message: 'Document removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
