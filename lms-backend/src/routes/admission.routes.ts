import { Router } from 'express';
import multer from 'multer';
import { submitApplication, getAllApplications } from '../controllers/admission.controller';
import { protect, admin } from '../middleware/auth.middleware';

// Configure multer for admission images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './public/uploads/admissions/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

const router = Router();

router.post('/apply', upload.single('studentPhoto'), submitApplication);
router.get('/', protect, admin(['ADMIN_ADMISSION', 'SUPER_ADMIN']), getAllApplications);

export default router;