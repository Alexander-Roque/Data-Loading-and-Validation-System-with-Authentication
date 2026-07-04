import { Router } from 'express';
import { uploadFile } from '../controllers/upload.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer ({
    storage,
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
            cb (null, true);
        } else {
            cb (new Error("Solo se permiten archivos CSV"))
        }
    },
});

const router = Router()

router.post ("/upload", authMiddleware, upload.single("file"), uploadFile);

export default router
