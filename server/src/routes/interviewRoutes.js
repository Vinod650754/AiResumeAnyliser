import { Router } from 'express';
import { evaluateInterview, generateInterview } from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/generate', protect, generateInterview);
router.post('/evaluate', protect, evaluateInterview);

export default router;
