import { Request, Response } from 'express';
import Candidate from '../models/Candidate';

// @desc    Get all candidates
// @route   GET /api/recruitment/candidates
// @access  Private
export const getCandidates = async (req: Request, res: Response) => {
    try {
        const candidates = await Candidate.find({ companyId: (req as any).user.companyId }).sort({ createdAt: -1 });
        res.json(candidates);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new candidate
// @route   POST /api/recruitment/candidates
// @access  Private
export const addCandidate = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, position, resumeUrl } = req.body;

        const candidateExists = await Candidate.findOne({
            email,
            companyId: (req as any).user.companyId
        });

        if (candidateExists) {
            res.status(400).json({ message: 'Candidate with this email already exists' });
            return;
        }

        const candidate = await Candidate.create({
            name,
            email,
            phone,
            position,
            resumeUrl,
            companyId: (req as any).user.companyId,
            status: 'Applied'
        });

        res.status(201).json(candidate);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update candidate status (Drag & Drop)
// @route   PUT /api/recruitment/candidates/:id/status
// @access  Private
export const updateCandidateStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const candidate = await Candidate.findById(req.params.id);

        if (!candidate) {
            res.status(404).json({ message: 'Candidate not found' });
            return;
        }

        // Verify company ownership
        if (candidate.companyId.toString() !== (req as any).user.companyId.toString()) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        candidate.status = status;
        await candidate.save();

        res.json(candidate);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete candidate
// @route   DELETE /api/recruitment/candidates/:id
// @access  Private
export const deleteCandidate = async (req: Request, res: Response) => {
    try {
        const candidate = await Candidate.findById(req.params.id);

        if (!candidate) {
            res.status(404).json({ message: 'Candidate not found' });
            return;
        }

        // Verify company ownership
        if (candidate.companyId.toString() !== (req as any).user.companyId.toString()) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        await candidate.deleteOne();
        res.json({ message: 'Candidate removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
