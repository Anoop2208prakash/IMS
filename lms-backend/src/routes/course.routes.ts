import { Router } from 'express';
import { getAllCourses, createCourse } from '../controllers/course.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = Router();

router.route('/')
  .get(protect, getAllCourses)
  .post(protect, admin(['ADMIN', 'SUPER_ADMIN']), createCourse);

export default router;