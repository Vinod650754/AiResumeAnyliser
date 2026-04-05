import { generateAISuggestions } from '../services/aiService.js';
import { analyzeResumeAgainstJD } from '../services/atsService.js';

export const analyzeATS = async (req, res) => {
  const { resume, jobDescription, targetRole } = req.body;

  if (!resume) {
    const error = new Error('Resume payload is required');
    error.statusCode = 400;
    throw error;
  }

  const analysis = analyzeResumeAgainstJD(resume, jobDescription, targetRole);
  const aiSuggestions = await generateAISuggestions({ resume, jobDescription, atsAnalysis: analysis });

  res.json({
    analysis: {
      ...analysis,
      suggestions: [...new Set([...(analysis.suggestions || []), ...(aiSuggestions.improvements || [])])],
      grammarNotes: [...new Set([...(analysis.grammarNotes || []), ...(aiSuggestions.grammarFixes || [])])],
      rewrittenSummary: aiSuggestions.rewrittenSummary
    }
  });
};
