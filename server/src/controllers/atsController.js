import { generateAISuggestions, getJobSkills } from '../services/aiService.js';
import { analyzeResumeAgainstJD } from '../services/atsService.js';

export const analyzeATS = async (req, res) => {
  const { resume, jobDescription, targetRole } = req.body;

  if (!resume) {
    const error = new Error('Resume payload is required');
    error.statusCode = 400;
    throw error;
  }

  if (!targetRole) {
    const error = new Error('Target role is required');
    error.statusCode = 400;
    throw error;
  }

  // Get job skills using AI
  const jobSkills = await getJobSkills({ jobRole: targetRole, jobDescription });

  // Analyze resume against the job skills
  const analysis = analyzeResumeAgainstJD(resume, jobDescription, targetRole, jobSkills);
  const aiSuggestions = await generateAISuggestions({ resume, jobDescription, atsAnalysis: analysis });

  res.json({
    jobSkills,
    analysis: {
      ...analysis,
      suggestions: [...new Set([...(analysis.suggestions || []), ...(aiSuggestions.improvements || [])])],
      grammarNotes: [...new Set([...(analysis.grammarNotes || []), ...(aiSuggestions.grammarFixes || [])])],
      rewrittenSummary: aiSuggestions.rewrittenSummary
    }
  });
};
