import express from 'express';
import {
    getAssets,
    addAsset,
    updateAsset,
    deleteAsset
} from '../controllers/assetController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, getAssets)
    .post(protect, addAsset);

router.route('/:id')
    .put(protect, updateAsset)
    .delete(protect, deleteAsset);

export default router;
