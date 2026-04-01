import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/dashboard', protect, getDashboardAnalytics);

export default router;

