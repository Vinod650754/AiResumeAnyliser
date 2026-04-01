import { Router } from 'express';
import {
  deleteResume,
  getResumeById,
  getResumes,
  getSharedResume,
  saveResume
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/shared/:slug', getSharedResume);
router.get('/', protect, getResumes);
router.post('/save', protect, saveResume);
router.get('/:id', protect, getResumeById);
router.delete('/:id', protect, deleteResume);

export default router;

