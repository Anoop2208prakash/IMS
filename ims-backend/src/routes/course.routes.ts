import { Router } from 'express';
import { 
  getAllCourses, 
  addCourse, 
  updateCourse, 
  deleteCourse,
  assignTeacherToCourse,
  getEnrolledStudents // <-- Import new function
} from '../controllers/course.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public route to get all courses
router.get('/', getAllCourses);

// Admin-only routes for course CUD
router.post('/', [authMiddleware, roleMiddleware(['ADMIN'])], addCourse);
router.put('/:id', [authMiddleware, roleMiddleware(['ADMIN'])], updateCourse);
router.delete('/:id', [authMiddleware, roleMiddleware(['ADMIN'])], deleteCourse);

// Admin-only route for assigning a teacher
router.post(
  '/:courseId/assign-teacher',
  [authMiddleware, roleMiddleware(['ADMIN'])],
  assignTeacherToCourse
);

// Teacher-only route to get enrolled students for a course
router.get(
  '/:courseId/students', // <-- Add this route
  [authMiddleware, roleMiddleware(['TEACHER'])],
  getEnrolledStudents
);

export default router;