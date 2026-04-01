const ROLE_BENCHMARKS = [
  {
    name: 'Full-Stack Engineer',
    patterns: ['full stack', 'mern', 'mean', 'react', 'node', 'express', 'mongodb'],
    requiredSkills: ['react', 'node', 'express', 'mongodb', 'javascript', 'rest', 'api', 'html', 'css', 'git'],
    bonusSkills: ['typescript', 'redux', 'aws', 'docker', 'testing', 'ci', 'tailwind']
  },
  {
    name: 'Frontend Engineer',
    patterns: ['frontend', 'front end', 'ui', 'ux', 'react', 'angular', 'vue'],
    requiredSkills: ['react', 'javascript', 'html', 'css', 'responsive', 'accessibility', 'api'],
    bonusSkills: ['typescript', 'next', 'redux', 'performance', 'testing', 'figma', 'animation']
  },
  {
    name: 'Backend Engineer',
    patterns: ['backend', 'back end', 'node', 'java', 'spring', 'python', 'api'],
    requiredSkills: ['api', 'database', 'sql', 'authentication', 'node', 'express', 'security'],
    bonusSkills: ['mongodb', 'redis', 'docker', 'aws', 'microservices', 'kafka', 'testing']
  },
  {
    name: 'Data Scientist',
    patterns: ['data scientist', 'machine learning', 'ml engineer', 'ai engineer'],
    requiredSkills: ['python', 'sql', 'machine', 'learning', 'statistics', 'pandas', 'model'],
    bonusSkills: ['tensorflow', 'pytorch', 'nlp', 'deployment', 'feature', 'evaluation', 'experimentation']
  },
  {
    name: 'DevOps Engineer',
    patterns: ['devops', 'platform engineer', 'site reliability', 'sre', 'cloud engineer'],
    requiredSkills: ['aws', 'docker', 'kubernetes', 'ci', 'cd', 'linux', 'monitoring'],
    bonusSkills: ['terraform', 'ansible', 'grafana', 'prometheus', 'security', 'scripting']
  },
  {
    name: 'Product Manager',
    patterns: ['product manager', 'product owner', 'growth manager'],
    requiredSkills: ['roadmap', 'stakeholder', 'analytics', 'research', 'prioritization', 'metrics'],
    bonusSkills: ['experimentation', 'sql', 'agile', 'go to market', 'user stories', 'funnel']
  }
];

const STOP_WORDS = new Set([
  'with', 'that', 'this', 'from', 'your', 'have', 'will', 'into', 'about', 'than', 'they', 'them', 'their', 'also', 'only', 'very', 'more',
  'role', 'team', 'work', 'must', 'able', 'good', 'need', 'using', 'used', 'high', 'strong', 'build', 'built', 'looking', 'engineer', 'developer'
]);

const normalizeTokens = (text = '') =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

const tokenizeSet = (text = '') => new Set(normalizeTokens(text));

const buildResumeBlob = (resume) =>
  [
    resume.title,
    resume.summary,
    resume.personal?.role,
    resume.personal?.location,
    ...(resume.skills || []),
    ...(resume.experience || []).flatMap((item) => [item.role, item.company, item.location, ...(item.highlights || [])]),
    ...(resume.projects || []).flatMap((item) => [item.name, item.summary, ...(item.highlights || [])]),
    ...(resume.education || []).flatMap((item) => [item.school, item.degree, item.field]),
    ...(resume.certifications || []),
    ...(resume.languages || []),
    ...(resume.strengths || [])
  ]
    .filter(Boolean)
    .join(' ');

const detectBenchmark = (resume, jobDescription = '') => {
  const haystack = `${resume.personal?.role || ''} ${resume.title || ''} ${jobDescription}`.toLowerCase();
  return ROLE_BENCHMARKS.find((benchmark) => benchmark.patterns.some((pattern) => haystack.includes(pattern))) || ROLE_BENCHMARKS[0];
};

const calculateStructureScore = (resume) => {
  const summaryScore = resume.summary ? 12 : 0;
  const skillsScore = Math.min((resume.skills?.length || 0) * 2, 16);
  const experienceScore = Math.min((resume.experience?.length || 0) * 9, 27);
  const projectScore = Math.min((resume.projects?.length || 0) * 6, 12);
  const educationScore = Math.min((resume.education?.length || 0) * 4, 8);
  const contactScore = resume.personal?.email && resume.personal?.phone ? 8 : 3;
  const impactScore = Math.min(
    ((resume.experience || []).flatMap((item) => item.highlights || []).filter((bullet) => /\d/.test(bullet)).length || 0) * 4,
    17
  );

  return summaryScore + skillsScore + experienceScore + projectScore + educationScore + contactScore + impactScore;
};

const getKeywordMatches = (jobTokens, resumeTokens) => {
  const matched = [];
  const missing = [];

  for (const token of jobTokens) {
    if (resumeTokens.has(token)) {
      matched.push(token);
    } else {
      missing.push(token);
    }
  }

  return { matched, missing };
};

export const analyzeResumeAgainstJD = (resume, jobDescription = '') => {
  const benchmark = detectBenchmark(resume, jobDescription);
  const resumeBlob = buildResumeBlob(resume);
  const resumeTokens = tokenizeSet(resumeBlob);
  const jdTokens = [...new Set(normalizeTokens(jobDescription))].slice(0, 40);
  const benchmarkTokens = [...new Set([...benchmark.requiredSkills, ...benchmark.bonusSkills])];

  const { matched: matchedJobKeywords, missing: missingJobKeywords } = getKeywordMatches(jdTokens, resumeTokens);
  const { matched: matchedBenchmarkKeywords, missing: missingBenchmarkKeywords } = getKeywordMatches(benchmarkTokens, resumeTokens);

  const keywordCoverage = jdTokens.length ? Math.round((matchedJobKeywords.length / jdTokens.length) * 100) : 72;
  const benchmarkCoverage = benchmarkTokens.length ? Math.round((matchedBenchmarkKeywords.length / benchmarkTokens.length) * 100) : 70;
  const structureScore = calculateStructureScore(resume);
  const score = Math.max(28, Math.min(98, Math.round(keywordCoverage * 0.42 + benchmarkCoverage * 0.33 + structureScore * 0.25)));

  const missingSkills = [...new Set([...missingJobKeywords, ...missingBenchmarkKeywords])].slice(0, 12);
  const matchedKeywords = [...new Set([...matchedJobKeywords, ...matchedBenchmarkKeywords])].slice(0, 18);
  const suggestions = [
    keywordCoverage < 70 ? `Add more ${benchmark.name.toLowerCase()} keywords from the target job into your summary and recent experience.` : null,
    benchmarkCoverage < 65 ? `Strengthen benchmark skills such as ${missingBenchmarkKeywords.slice(0, 4).join(', ')}.` : null,
    (resume.experience || []).some((item) => !(item.highlights || []).some((bullet) => /\d/.test(bullet)))
      ? 'Add measurable impact metrics to your experience bullets.'
      : null,
    !resume.projects?.length ? 'Include at least one relevant project that proves role-specific execution.' : null,
    !resume.personal?.linkedin ? 'Add a LinkedIn profile to improve recruiter confidence and completeness.' : null
  ].filter(Boolean);

  return {
    score,
    keywordCoverage,
    benchmarkCoverage,
    benchmarkRole: benchmark.name,
    matchedKeywords,
    missingSkills,
    suggestions,
    grammarNotes: ['Use stronger action verbs, reduce repetition, and keep summaries tight and role-specific.']
  };
};
