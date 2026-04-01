import { Router } from 'express';
import { generateInterview } from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/generate', protect, generateInterview);

export default router;
