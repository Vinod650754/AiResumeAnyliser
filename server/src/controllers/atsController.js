import { generateAISuggestions } from '../services/aiService.js';
import { analyzeResumeAgainstJD } from '../services/atsService.js';

// Enhanced keyword extraction with AI fallback
const extractKeywordsFromDescription = async (description = '', targetRole = '') => {
  if (!description || typeof description !== 'string') {
    return [];
  }

  try {
    // Try using AI to extract better keywords
    const aiExtracted = await extractKeywordsWithAI(description, targetRole);
    if (aiExtracted && aiExtracted.length > 0) {
      console.log('Keywords extracted using AI');
      return aiExtracted;
    }
  } catch (aiError) {
    console.log('AI keyword extraction failed, falling back to regex-based extraction:', aiError.message);
  }

  // Fallback to regex-based extraction
  return extractKeywordsRegex(description);
};

// AI-powered keyword extraction
const extractKeywordsWithAI = async (description, targetRole) => {
  const { generateAISuggestions: aiGenerate } = await import('../services/aiService.js').then(m => ({ generateAISuggestions: m.generateAISuggestions }));
  
  try {
    const prompt = `Extract only the most important technical skills and keywords from this job description. Return them as a comma-separated list of single words or short phrases (max 25 words).

Job Description:
${description}

Target Role: ${targetRole || 'Software Developer'}

Return only the keywords, nothing else. Example format: javascript, react, node.js, mongodb, rest api, docker, aws`;

    const response = await aiGenerate({ 
      resume: { title: targetRole }, 
      jobDescription: description,
      atsAnalysis: { suggestions: [prompt] }
    });

    if (response?.rewrittenSummary) {
      const keywords = response.rewrittenSummary
        .toLowerCase()
        .split(/[,;]/)
        .map(k => k.trim())
        .filter(k => k.length > 2 && !k.includes('example'))
        .slice(0, 20);
      return keywords;
    }
  } catch (error) {
    console.error('AI keyword extraction error:', error.message);
  }

  return null;
};

// Regex-based keyword extraction (fallback)
const extractKeywordsRegex = (description = '') => {
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with', 'would',
    'we', 'our', 'you', 'your', 'they', 'their', 'this', 'these', 'those', 'i', 'me', 'my', 'role', 'team', 'work', 'must', 'able', 'good', 'need', 'using', 'used',
    'high', 'strong', 'build', 'built', 'looking', 'engineer', 'developer', 'experience', 'years', 'knowledge', 'skills', 'ability', 'responsibilities',
    'requirements', 'qualifications', 'candidate', 'position', 'company', 'join', 'us', 'seeking'
  ]);

  const words = description
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .filter((word, index, arr) => arr.indexOf(word) === index);

  return words.slice(0, 20);
};

export const analyzeATS = async (req, res) => {
  try {
    const { resume, jobDescription, targetRole } = req.body;

    console.log('ATS Request received:', {
      hasResume: !!resume,
      jobDescriptionLength: jobDescription?.length || 0,
      targetRole: targetRole || 'none'
    });

    if (!resume) {
      return res.status(400).json({
        success: false,
        message: 'Resume payload is required'
      });
    }

    if (!targetRole && !jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Either target role or job description is required'
      });
    }

    // Extract keywords from job description with AI
    const targetJobSkills = await extractKeywordsFromDescription(jobDescription, targetRole);
    console.log('Extracted job skills from description:', targetJobSkills);

    // Create jobSkills object for compatibility
    const jobSkills = {
      requiredSkills: targetJobSkills,
      niceToHaveSkills: [],
      technicalSkills: [],
      softSkills: []
    };

    // Analyze resume against the job skills
    const analysis = analyzeResumeAgainstJD(resume, jobDescription, targetRole, jobSkills);
    console.log('ATS Analysis result:', {
      score: analysis.score,
      skillMatchScore: analysis.skillMatchScore,
      matchedSkillsCount: analysis.matchedSkills?.length || 0,
      missingSkillsCount: analysis.missingSkills?.length || 0
    });
    
    let aiSuggestions = {};
    try {
      aiSuggestions = await generateAISuggestions({ resume, jobDescription, atsAnalysis: analysis });
      console.log('AI suggestions generated successfully');
    } catch (suggError) {
      console.error('Error generating AI suggestions:', suggError.message);
      aiSuggestions = {
        improvements: [],
        grammarFixes: [],
        rewrittenSummary: analysis.rewrittenSummary || ''
      };
    }

    const response = {
      jobSkills: {
        extractedKeywords: targetJobSkills,
        requiredSkills: targetJobSkills,
        niceToHaveSkills: [],
        technicalSkills: [],
        softSkills: []
      },
      analysis: {
        ...analysis,
        suggestions: [...new Set([...(analysis.suggestions || []), ...(aiSuggestions.improvements || [])])],
        grammarNotes: [...new Set([...(analysis.grammarNotes || []), ...(aiSuggestions.grammarFixes || [])])],
        rewrittenSummary: aiSuggestions.rewrittenSummary
      }
    };

    console.log('Sending ATS response with score:', response.analysis.score);
    res.json(response);
  } catch (error) {
    console.error('ATS Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'ATS analysis failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
