import { Router } from 'express';
import { improveResume } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/improve', protect, improveResume);

export default router;
