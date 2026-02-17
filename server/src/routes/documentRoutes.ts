import express from 'express';
import multer from 'multer';
import path from 'path';
import {
    uploadDocument,
    getDocuments,
    getEmployeeDocuments,
    deleteDocument
} from '../controllers/documentController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Multer Configuration
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

const checkFileType = (file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const filetypes = /jpg|jpeg|png|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images and Documents only!'));
    }
};

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.route('/')
    .get(protect, getDocuments)
    .post(protect, upload.single('file'), uploadDocument);

router.route('/employee/:id')
    .get(protect, admin, getEmployeeDocuments);

router.route('/:id')
    .delete(protect, deleteDocument);

export default router;
