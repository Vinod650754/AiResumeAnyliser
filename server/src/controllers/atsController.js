import { generateAISuggestions } from '../services/aiService.js';
import { analyzeResumeAgainstJD } from '../services/atsService.js';

// Extract keywords from job description
const extractKeywordsFromDescription = (description = '') => {
  if (!description || typeof description !== 'string') {
    return [];
  }

  // Common stop words to filter out
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with', 'would',
    'we', 'our', 'you', 'your', 'they', 'their', 'this', 'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
    'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this',
    'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and',
    'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
    'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't',
    'can', 'will', 'just', 'don', 'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn',
    'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn', 'also', 'may', 'might', 'must', 'need', 'ought', 'shall', 'will', 'able', 'about', 'across',
    'after', 'against', 'along', 'among', 'around', 'at', 'before', 'behind', 'below', 'beneath', 'beside', 'between', 'beyond', 'but', 'by', 'concerning', 'considering',
    'despite', 'down', 'during', 'except', 'for', 'from', 'in', 'inside', 'into', 'like', 'near', 'of', 'off', 'on', 'onto', 'out', 'outside', 'over', 'past', 'regarding',
    'round', 'since', 'through', 'throughout', 'to', 'toward', 'towards', 'under', 'underneath', 'until', 'unto', 'up', 'upon', 'with', 'within', 'without', 'role',
    'team', 'work', 'must', 'able', 'good', 'need', 'using', 'used', 'high', 'strong', 'build', 'built', 'looking', 'engineer', 'developer', 'experience', 'years',
    'knowledge', 'skills', 'ability', 'responsibilities', 'requirements', 'qualifications', 'candidate', 'position', 'company', 'join', 'us', 'looking', 'seeking'
  ]);

  // Extract words, convert to lowercase, filter out stop words and short words
  const words = description
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates

  return words.slice(0, 20); // Limit to 20 keywords
};

export const analyzeATS = async (req, res) => {
  try {
    const { resume, jobDescription, targetRole } = req.body;

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

    // Extract keywords from job description
    const targetJobSkills = extractKeywordsFromDescription(jobDescription);
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
    });
  } catch (error) {
    console.error('ATS Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'ATS analysis failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
