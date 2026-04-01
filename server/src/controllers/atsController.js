import { analyzeResumeAgainstJD } from '../services/atsService.js';

export const analyzeATS = async (req, res) => {
  const { resume, jobDescription } = req.body;

  if (!resume) {
    const error = new Error('Resume payload is required');
    error.statusCode = 400;
    throw error;
  }

  const analysis = analyzeResumeAgainstJD(resume, jobDescription);
  res.json({ analysis });
};
