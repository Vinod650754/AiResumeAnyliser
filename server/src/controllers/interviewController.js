import { evaluateInterviewAnswers, generateInterviewPrep } from '../services/aiService.js';

export const generateInterview = async (req, res) => {
  const { resume, jobTitle, jobDescription } = req.body;

  if (!resume) {
    const error = new Error('Resume payload is required');
    error.statusCode = 400;
    throw error;
  }

  const interview = await generateInterviewPrep({ resume, jobTitle, jobDescription });
  res.json({ interview });
};

export const evaluateInterview = async (req, res) => {
  const { roleFocus, questions, answers } = req.body;

  if (!questions?.length) {
    const error = new Error('Questions are required for interview evaluation');
    error.statusCode = 400;
    throw error;
  }

  const evaluation = await evaluateInterviewAnswers({
    roleFocus,
    questions,
    answers: answers || []
  });

  res.json({ evaluation });
};
