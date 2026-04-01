import { Router } from 'express';
import { compareJobToResume, getJobMatches, searchJobs } from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/search', protect, searchJobs);
router.post('/match', protect, getJobMatches);
router.post('/compare', protect, compareJobToResume);

export default router;
