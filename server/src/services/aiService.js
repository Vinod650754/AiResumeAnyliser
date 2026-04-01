import OpenAI from 'openai';

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

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

const collectExperienceBullets = (resume) => (resume.experience || []).flatMap((item) => item.highlights || []).slice(0, 6);

export const generateAISuggestions = async ({ resume, jobDescription, atsAnalysis }) => {
  const fallback = {
    rewrittenSummary:
      'Results-driven engineer with strong execution across modern web stacks, measurable delivery outcomes, and the ability to turn ambiguous requirements into production-ready systems.',
    improvements: atsAnalysis.suggestions,
    grammarFixes: ['Use strong action verbs, reduce repeated wording, and make every bullet outcome-focused.']
  };

  return createJsonCompletion({
    system:
      'You are an elite resume strategist. Improve resumes for ATS performance, clarity, grammar, and hiring conversion. Respond only as JSON.',
    user: `Return JSON with keys: rewrittenSummary, improvements, grammarFixes.\nResume: ${JSON.stringify(resume)}\nJob Description: ${jobDescription}\nATS Analysis: ${JSON.stringify(atsAnalysis)}`,
    fallback
  });
};

export const improveResumeWithAI = async ({ resume, jobDescription }) =>
  createJsonCompletion({
    system:
      'You are a world-class resume writer. Rewrite the resume to sound polished, credible, ATS-friendly, and specific. Respond only as JSON.',
    user: `Return JSON with keys: improvedSummary, improvedSkills, improvedHighlights, improvedProjects, grammarFixes, recruiterNotes.\nResume: ${JSON.stringify(
      resume
    )}\nJob description: ${jobDescription || 'General improvement without a specific job description.'}`,
    fallback: {
      improvedSummary:
        'Strategic full-stack engineer with a record of shipping user-facing products, improving platform performance, and translating business goals into reliable technical delivery.',
      improvedSkills: [...new Set([...(resume.skills || []), 'System Design', 'Performance Optimization'])],
      improvedHighlights: collectExperienceBullets(resume).map((bullet) => bullet.replace(/^[a-z]/, (char) => char.toUpperCase())),
      improvedProjects: (resume.projects || []).map((project) => ({
        name: project.name,
        summary: `Delivered ${project.name} with clearer impact framing, stronger technical language, and better recruiter readability.`
      })),
      grammarFixes: ['Tighten the summary to 3-4 lines and start bullets with strong verbs.'],
      recruiterNotes: ['Lead with measurable outcomes, stack depth, and ownership in the first third of the resume.']
    }
  });

export const generateJobMatches = async ({ resume, atsAnalysis }) =>
  createJsonCompletion({
    system:
      'You are an AI recruiting strategist. Suggest realistic job matches and identify missing skills honestly. Respond only as JSON.',
    user: `Return JSON with key "matches" as an array of 4 objects containing: title, company, matchScore, reason, missingSkills.\nResume: ${JSON.stringify(
      resume
    )}\nATS analysis: ${JSON.stringify(atsAnalysis)}`,
    fallback: {
      matches: [
        {
          title: 'Senior Full-Stack Engineer',
          company: 'Northstar Cloud',
          matchScore: 92,
          reason: 'Strong overlap across React, Node.js, MongoDB, API design, and product delivery.',
          missingSkills: ['Kubernetes']
        },
        {
          title: 'AI Product Engineer',
          company: 'Helio Labs',
          matchScore: 88,
          reason: 'The resume combines engineering delivery with product-minded execution and AI context.',
          missingSkills: ['Prompt evaluation frameworks']
        },
        {
          title: 'Platform Engineer',
          company: 'Orbit Systems',
          matchScore: 84,
          reason: 'Backend architecture, analytics, and secure auth experience transfer well to platform work.',
          missingSkills: ['Terraform']
        },
        {
          title: 'Frontend Systems Engineer',
          company: 'Vector UI',
          matchScore: 80,
          reason: 'Strong UI execution and performance orientation align with design-system-heavy roles.',
          missingSkills: ['Accessibility auditing']
        }
      ]
    }
  });

export const generateInterviewPrep = async ({ resume, jobTitle, jobDescription }) =>
  createJsonCompletion({
    system:
      'You are a senior engineering interviewer. Generate 10 interview questions total with a mix of basic screening, technical, and applied scenario questions. Respond only as JSON.',
    user: `Return JSON with keys: roleFocus, basicQuestions, technicalQuestions, scenarioQuestions, coachingTips. Ensure there are exactly 10 total questions across the arrays.\nResume: ${JSON.stringify(
      resume
    )}\nJob title: ${jobTitle || resume.personal?.role || resume.title || 'Software Engineer'}\nJob description: ${jobDescription || 'General software engineering role.'}`,
    fallback: {
      roleFocus: jobTitle || resume.personal?.role || resume.title || 'Software Engineer',
      basicQuestions: [
        'Tell me about yourself and your current role in under two minutes.',
        'Why are you interested in this position and this domain?',
        'What kind of problems do you solve best as an engineer?'
      ],
      technicalQuestions: [
        'How would you design and scale a resume analysis platform that compares candidate resumes to job descriptions?',
        'What tradeoffs would you consider when choosing MongoDB versus PostgreSQL for this product?',
        'How do you improve API latency and frontend rendering performance in a MERN application?',
        'How would you secure JWT-based authentication for a production SaaS platform?'
      ],
      scenarioQuestions: [
        'Describe a technically difficult production issue you resolved and how you approached it.',
        'Walk through a project on your resume and quantify the impact you delivered.',
        'If this job required you to learn a missing skill quickly, how would you ramp up in the first month?'
      ],
      coachingTips: [
        'Answer with outcome first, then architecture, then tradeoffs.',
        'Use metrics whenever possible.',
        'Keep examples specific and recent.'
      ]
    }
  });

export const evaluateInterviewAnswers = async ({ roleFocus, questions, answers }) => {
  const normalizedAnswers = questions.map((question, index) => ({
    question,
    answer: answers[index] || ''
  }));

  return createJsonCompletion({
    system:
      'You are a fair senior interviewer. Grade answers honestly, explain strengths and weaknesses, and return only JSON.',
    user: `Return JSON with keys: overallScore, answeredCount, results, summary. results must be an array with score, feedback, and question. Role: ${roleFocus}. Responses: ${JSON.stringify(
      normalizedAnswers
    )}`,
    fallback: {
      overallScore: Math.round(
        normalizedAnswers.reduce((total, item) => total + (item.answer.trim().length > 60 ? 8 : item.answer.trim().length > 20 ? 6 : item.answer.trim() ? 4 : 0), 0) /
          Math.max(normalizedAnswers.length, 1)
      ) * 10,
      answeredCount: normalizedAnswers.filter((item) => item.answer.trim()).length,
      results: normalizedAnswers.map((item) => ({
        question: item.question,
        score: item.answer.trim().length > 60 ? 8 : item.answer.trim().length > 20 ? 6 : item.answer.trim() ? 4 : 0,
        feedback: item.answer.trim()
          ? 'Good start. Add clearer structure, stronger technical reasoning, and measurable impact to raise the score.'
          : 'No answer provided. Add a concise example with context, action, and result.'
      })),
      summary: 'Stronger answers usually explain the problem, your decision-making, technical tradeoffs, and the business outcome.'
    }
  });
};

export const generateJobFitNarrative = async ({ resume, selectedJob, atsAnalysis }) =>
  createJsonCompletion({
    system:
      'You are a recruiting strategist. Assess how well a candidate fits a real job description and explain the fit honestly. Respond only as JSON.',
    user: `Return JSON with keys: fitSummary, strengths, risks.\nResume: ${JSON.stringify(resume)}\nSelected job: ${JSON.stringify(
      selectedJob
    )}\nATS analysis: ${JSON.stringify(atsAnalysis)}`,
    fallback: {
      fitSummary: 'The resume shows strong overlap with the selected role, especially across the core stack and execution ownership.',
      strengths: atsAnalysis.matchedKeywords?.slice(0, 6) || [],
      risks: atsAnalysis.missingSkills?.slice(0, 6) || []
    }
  });
