import { Router } from 'express';
import multer from 'multer';
import { 
  getProfile, 
  getAllUsers, 
  updateProfile, 
  createUser, 
  updateUser, 
  deleteUser,
  updateMyPassword,
  getMyStudentProfile,
  uploadProfileImage
} from '../controllers/user.controller';
import { admin, protect } from '../middleware/auth.middleware';

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/');
  },
  filename: function (req, file, cb) {
    // @ts-ignore
    cb(null, `${req.user.userId}-${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

const router = Router();

// Routes for the logged-in user's own profile
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.patch('/profile/password', protect, updateMyPassword);
router.get('/student-profile', protect, getMyStudentProfile);
router.post('/profile/upload', protect, upload.single('profileImage'), uploadProfileImage);


// Routes for managing all users
router.route('/')
  .get(protect, admin(['ADMIN', 'SUPER_ADMIN']), getAllUsers)
  .post(protect, admin(['SUPER_ADMIN', 'ADMIN_ADMISSION']), createUser);

// Routes for managing a specific user by ID (Super Admin only)
router.route('/:id')
  .put(protect, admin(['SUPER_ADMIN']), updateUser)
  .delete(protect, admin(['SUPER_ADMIN']), deleteUser);

export default router;