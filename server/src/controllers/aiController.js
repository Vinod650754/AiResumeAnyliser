import { improveResumeWithAI } from '../services/aiService.js';

export const improveResume = async (req, res) => {
  const { resume, jobDescription } = req.body;

  if (!resume) {
    const error = new Error('Resume payload is required');
    error.statusCode = 400;
    throw error;
  }

  const improved = await improveResumeWithAI({ resume, jobDescription });
  res.json({ improved });
};
