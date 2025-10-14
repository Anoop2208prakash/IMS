import { Router } from 'express';
import { 
  getAllStudents, 
  addStudent, 
  updateStudent, 
  deleteStudent 
} from '../controllers/student.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import upload from '../config/multer.config'; // <-- Import the upload middleware

const router = Router();
// Defines which roles can manage student data
const studentManagerRoles = ['ADMIN', 'ADMIN_ADMISSION'];

// GET all students
router.get('/', [authMiddleware, roleMiddleware(studentManagerRoles)], getAllStudents);

// POST a new student (secure admin-only admission with photo upload)
router.post(
  '/', 
  [authMiddleware, roleMiddleware(studentManagerRoles)], 
  upload.single('image'), // <-- Add multer middleware here
  addStudent
);

// PUT (update) a specific student
router.put('/:id', [authMiddleware, roleMiddleware(studentManagerRoles)], updateStudent);

// DELETE a specific student
router.delete('/:id', [authMiddleware, roleMiddleware(studentManagerRoles)], deleteStudent);

export default router;