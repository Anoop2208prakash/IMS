import { Router } from 'express';
// getMyAttendance has been removed from here
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

// This file is now only for public (unprotected) admission routes.
// The public "submitApplication" route can be added here if needed.

// The /my-attendance route has been REMOVED.

export default router;