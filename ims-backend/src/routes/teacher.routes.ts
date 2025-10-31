import { Router } from 'express';
import { 
  getAllTeachers, 
  updateTeacher, 
  deleteTeacher,
  getMyAssignedSubjects
} from '../controllers/teacher.controller'; 
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { addTeacher } from '../controllers/teacher.controller'; // addTeacher is not in staff.controller

const router = Router();
const adminRoles = ['ADMIN', 'SUPER_ADMIN'];
const teacherRole = ['TEACHER'];

// Admin routes for managing teachers
router.get('/', authMiddleware, roleMiddleware(adminRoles), getAllTeachers);
router.put('/:id', authMiddleware, roleMiddleware(adminRoles), updateTeacher);
router.delete('/:id', authMiddleware, roleMiddleware(adminRoles), deleteTeacher);

// Note: The main 'addTeacher' logic is in staff.controller.ts,
// but if you still have a separate addTeacher function, this is how you'd route it.
// If you've fully moved to staff.controller, you can delete this line.
router.post('/', authMiddleware, roleMiddleware(adminRoles), addTeacher);

// Teacher-only route to get their assigned subjects
router.get(
  '/my-subjects',
  authMiddleware, 
  roleMiddleware(teacherRole), // Ensures only teachers can access this
  getMyAssignedSubjects
);

export default router;