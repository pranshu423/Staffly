import express from 'express';
import {
    getCandidates,
    addCandidate,
    updateCandidateStatus,
    deleteCandidate
} from '../controllers/recruitmentController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/candidates')
    .get(protect, getCandidates)
    .post(protect, addCandidate);

router.route('/candidates/:id/status')
    .put(protect, updateCandidateStatus);

router.route('/candidates/:id')
    .delete(protect, deleteCandidate);

export default router;
