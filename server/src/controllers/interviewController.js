import { generateInterviewPrep } from '../services/aiService.js';

export const generateInterview = async (req, res) => {
  const { resume, jobDescription } = req.body;

  if (!resume) {
    const error = new Error('Resume payload is required');
    error.statusCode = 400;
    throw error;
  }

  const interview = await generateInterviewPrep({ resume, jobDescription });
  res.json({ interview });
};

