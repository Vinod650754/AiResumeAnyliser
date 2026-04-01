import { Router } from 'express';
import { analyzeATS, improveResume } from '../controllers/atsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/analyze', protect, analyzeATS);
router.post('/improve', protect, improveResume);

export default router;

