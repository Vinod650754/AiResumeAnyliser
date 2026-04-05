import { generateAISuggestions, getJobSkills } from '../services/aiService.js';
import { analyzeResumeAgainstJD } from '../services/atsService.js';

export const analyzeATS = async (req, res) => {
  try {
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
    let jobSkills = null;
    try {
      jobSkills = await getJobSkills({ jobRole: targetRole, jobDescription });
      console.log('Job skills extracted for role:', targetRole, jobSkills);
    } catch (aiError) {
      console.error('Error extracting job skills:', aiError.message);
      jobSkills = {
        requiredSkills: [],
        niceToHaveSkills: [],
        technicalSkills: [],
        softSkills: []
      };
    }

    // Analyze resume against the job skills
    const analysis = analyzeResumeAgainstJD(resume, jobDescription, targetRole, jobSkills);
    
    let aiSuggestions = {};
    try {
      aiSuggestions = await generateAISuggestions({ resume, jobDescription, atsAnalysis: analysis });
    } catch (suggError) {
      console.error('Error generating AI suggestions:', suggError.message);
      aiSuggestions = {
        improvements: [],
        grammarFixes: [],
        rewrittenSummary: analysis.rewrittenSummary || ''
      };
    }

    res.json({
      jobSkills,
      analysis: {
        ...analysis,
        suggestions: [...new Set([...(analysis.suggestions || []), ...(aiSuggestions.improvements || [])])],
        grammarNotes: [...new Set([...(analysis.grammarNotes || []), ...(aiSuggestions.grammarFixes || [])])],
        rewrittenSummary: aiSuggestions.rewrittenSummary
      }
    });
  } catch (error) {
    console.error('ATS Analysis Error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'ATS analysis failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
