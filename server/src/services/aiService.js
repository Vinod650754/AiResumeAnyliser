import OpenAI from 'openai';

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

export const generateAISuggestions = async ({ resume, jobDescription, atsAnalysis }) => {
  if (!client) {
    return {
      rewrittenSummary:
        'Results-driven professional with a strong blend of execution, technical capability, and cross-functional delivery experience.',
      improvements: atsAnalysis.suggestions,
      grammarFixes: ['Use stronger action verbs and reduce repeated phrases across bullet points.']
    };
  }

  const prompt = `
You are an elite resume strategist.
Return JSON with keys: rewrittenSummary, improvements, grammarFixes.
Resume JSON: ${JSON.stringify(resume)}
Job Description: ${jobDescription}
ATS Analysis: ${JSON.stringify(atsAnalysis)}
`;

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You improve resumes for ATS performance, clarity, grammar, and hiring conversion.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  return JSON.parse(completion.choices[0].message.content);
};

const createJsonCompletion = async ({ system, user, fallback }) => {
  if (!client) {
    return fallback;
  }

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  });

  return JSON.parse(completion.choices[0].message.content);
};

export const improveResumeWithAI = async ({ resume, jobDescription }) =>
  createJsonCompletion({
    system:
      'You are a world-class resume writer. Improve resumes for clarity, ATS relevance, measurable impact, and executive polish. Respond only as JSON.',
    user: `Improve this resume for the target role. Return JSON with keys: improvedSummary, improvedSkills, improvedHighlights, coverNote.
Resume: ${JSON.stringify(resume)}
Job description: ${jobDescription || 'General optimization without a specific JD.'}`,
    fallback: {
      improvedSummary:
        'Strategic full-stack engineer with a record of shipping AI-enabled products, leading cross-functional execution, and delivering measurable business outcomes.',
      improvedSkills: resume.skills || [],
      improvedHighlights:
        resume.experience?.flatMap((item) => item.highlights || []).slice(0, 4) ||
        ['Translate complex product goals into scalable, recruiter-friendly outcomes.'],
      coverNote: 'Emphasize measurable impact, stack breadth, and product ownership in interviews.'
    }
  });

export const generateJobMatches = async ({ resume, atsAnalysis }) =>
  createJsonCompletion({
    system:
      'You are an AI recruiting strategist. Suggest realistic job matches and identify missing skills honestly. Respond only as JSON.',
    user: `Return JSON with key "matches" as an array of 4 objects containing: title, company, matchScore, reason, missingSkills.
Resume: ${JSON.stringify(resume)}
ATS analysis: ${JSON.stringify(atsAnalysis)}`,
    fallback: {
      matches: [
        {
          title: 'Senior Full-Stack Engineer',
          company: 'Northstar Cloud',
          matchScore: 92,
          reason: 'Strong alignment across React, Node.js, MongoDB, APIs, and AI product delivery.',
          missingSkills: ['Kubernetes']
        },
        {
          title: 'AI Product Engineer',
          company: 'Helio Labs',
          matchScore: 88,
          reason: 'Resume shows product-minded engineering and applied AI workflow experience.',
          missingSkills: ['Prompt evaluation frameworks']
        },
        {
          title: 'Platform Engineer',
          company: 'Orbit Systems',
          matchScore: 84,
          reason: 'Backend architecture, analytics, and secure auth experience transfer well.',
          missingSkills: ['Terraform']
        },
        {
          title: 'Frontend Systems Engineer',
          company: 'Vector UI',
          matchScore: 80,
          reason: 'Strong UI execution and performance orientation fit modern design systems work.',
          missingSkills: ['Accessibility auditing']
        }
      ]
    }
  });

export const generateInterviewPrep = async ({ resume, jobDescription }) =>
  createJsonCompletion({
    system:
      'You are a senior engineering interviewer. Generate practical, role-relevant mock interview questions with a balance of technical, behavioral, and project deep-dive prompts. Respond only as JSON.',
    user: `Return JSON with keys: roleFocus, technicalQuestions, behavioralQuestions, projectQuestions, coachingTips.
Resume: ${JSON.stringify(resume)}
Job description: ${jobDescription || 'General senior software engineering role.'}`,
    fallback: {
      roleFocus: resume.personal?.role || resume.title || 'Senior Software Engineer',
      technicalQuestions: [
        'How would you design an ATS scoring system that compares resume content to a job description at scale?',
        'What tradeoffs would you consider when designing a Node.js and MongoDB backend for a resume platform?',
        'How do you identify and improve performance bottlenecks in a React application?'
      ],
      behavioralQuestions: [
        'Describe a time you made a difficult architecture tradeoff under delivery pressure.',
        'Tell me about a situation where you influenced product direction without direct authority.',
        'How do you handle disagreement with a designer or product manager when shipping a feature?'
      ],
      projectQuestions: [
        'Walk me through one project on your resume end to end and quantify the impact.',
        'Which part of that project was technically hardest, and how did you resolve it?',
        'If you rebuilt that project today, what would you change and why?'
      ],
      coachingTips: [
        'Lead with outcome, then architecture, then tradeoffs.',
        'Use specific metrics in each answer.',
        'Tie technical decisions back to recruiter, user, or revenue impact.'
      ]
    }
  });

export const generateJobFitNarrative = async ({ resume, selectedJob, atsAnalysis }) =>
  createJsonCompletion({
    system:
      'You are a recruiting strategist. Assess how well a candidate fits a real job description and explain the fit honestly. Respond only as JSON.',
    user: `Return JSON with keys: fitSummary, strengths, risks.
Resume: ${JSON.stringify(resume)}
Selected job: ${JSON.stringify(selectedJob)}
ATS analysis: ${JSON.stringify(atsAnalysis)}`,
    fallback: {
      fitSummary: 'The resume shows strong overlap with the selected role, especially across core stack and delivery ownership.',
      strengths: atsAnalysis.matchedKeywords?.slice(0, 6) || [],
      risks: atsAnalysis.missingSkills?.slice(0, 6) || []
    }
  });
