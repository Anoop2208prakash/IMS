// src/routes/staff.routes.ts
import { Router } from 'express';
import { registerStaff } from '../controllers/staff.controller';

const router = Router();

router.post('/register', registerStaff);

export default router;