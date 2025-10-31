import { Router } from 'express';
import { 
  exportSemestersCSV, 
  importSemestersCSV,
  exportSubjectsCSV, 
  importSubjectsCSV,
  exportTeachersCSV, 
  importTeachersCSV,
  exportProgramsCSV,
  importProgramsCSV,
  exportExamsCSV, // <-- Added Exam export
  importExamsCSV,  // <-- Added Exam import
  exportInventoryCSV,
  importInventoryCSV
} from '../controllers/transfer.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import multer from 'multer';

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() }); // Store the file in memory

const router = Router();
const adminRoles = ['ADMIN', 'SUPER_ADMIN'];

// --- Semester Routes ---
router.get(
  '/semesters',
  authMiddleware,
  roleMiddleware(adminRoles),
  exportSemestersCSV
);
router.post(
  '/semesters',
  authMiddleware,
  roleMiddleware(adminRoles),
  upload.single('file'),
  importSemestersCSV
);

// --- Subject Routes ---
router.get(
  '/subjects',
  authMiddleware,
  roleMiddleware(adminRoles),
  exportSubjectsCSV
);
router.post(
  '/subjects',
  authMiddleware,
  roleMiddleware(adminRoles),
  upload.single('file'),
  importSubjectsCSV
);

// --- Teacher Routes ---
router.get(
  '/teachers',
  authMiddleware,
  roleMiddleware(adminRoles),
  exportTeachersCSV
);
router.post(
  '/teachers',
  authMiddleware,
  roleMiddleware(adminRoles),
  upload.single('file'),
  importTeachersCSV
);

// --- Program Routes ---
router.get(
  '/programs',
  authMiddleware,
  roleMiddleware(adminRoles),
  exportProgramsCSV
);
router.post(
  '/programs',
  authMiddleware,
  roleMiddleware(adminRoles),
  upload.single('file'),
  importProgramsCSV
);

// --- Exam Routes ---
router.get(
  '/exams',
  authMiddleware,
  roleMiddleware(adminRoles),
  exportExamsCSV
);
router.post(
  '/exams',
  authMiddleware,
  roleMiddleware(adminRoles),
  upload.single('file'),
  importExamsCSV
);
router.get(
  '/inventory', // 3. Add new route
  authMiddleware,
  roleMiddleware(adminRoles),
  exportInventoryCSV
);
router.post(
  '/inventory', // 4. Add new route
  authMiddleware,
  roleMiddleware(adminRoles),
  upload.single('file'),
  importInventoryCSV
);

export default router;