import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  registerStaff,
  getAllStaff,
  deleteStaff,
} from '../controllers/staff.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const superAdminRole = ['SUPER_ADMIN'];

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', 'uploads');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
// ----------------------------

// All staff routes are now protected and require SUPER_ADMIN role
router.get(
  '/',
  authMiddleware,
  roleMiddleware(superAdminRole),
  getAllStaff
);

router.post(
  '/register',
  authMiddleware,
  roleMiddleware(superAdminRole),
  upload.single('profileImage'), // Handle the image upload
  registerStaff
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(superAdminRole),
  deleteStaff
);

export default router;