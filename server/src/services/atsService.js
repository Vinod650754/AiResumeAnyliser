const normalizeTokens = (text = '') =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9+\s#.-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);

export const analyzeResumeAgainstJD = (resume, jobDescription = '') => {
  const jdTokens = [...new Set(normalizeTokens(jobDescription))];
  const resumeBlob = [
    resume.summary,
    resume.personal?.role,
    ...(resume.skills || []),
    ...(resume.experience || []).flatMap((item) => [item.role, item.company, ...(item.highlights || [])]),
    ...(resume.projects || []).flatMap((item) => [item.name, item.summary, ...(item.highlights || [])])
  ]
    .filter(Boolean)
    .join(' ');

  const resumeTokens = normalizeTokens(resumeBlob);
  const matchedKeywords = jdTokens.filter((token) => resumeTokens.includes(token));
  const missingSkills = jdTokens.filter((token) => !resumeTokens.includes(token)).slice(0, 15);

  const keywordCoverage = jdTokens.length ? Math.round((matchedKeywords.length / jdTokens.length) * 100) : 0;
  const contentDepth =
    (resume.summary ? 10 : 0) +
    Math.min((resume.skills?.length || 0) * 4, 20) +
    Math.min((resume.experience?.length || 0) * 10, 25) +
    Math.min((resume.projects?.length || 0) * 7, 15) +
    Math.min((resume.education?.length || 0) * 5, 10);

  const score = Math.max(35, Math.min(100, Math.round(keywordCoverage * 0.55 + contentDepth)));

  const suggestions = [
    keywordCoverage < 70 ? 'Increase role-specific keyword coverage in the summary and experience bullets.' : null,
    (resume.experience || []).some((item) => !(item.highlights || []).some((bullet) => /\d/.test(bullet)))
      ? 'Add measurable impact metrics to work experience bullets.'
      : null,
    !resume.projects?.length ? 'Include at least one project to strengthen technical credibility.' : null,
    !resume.personal?.linkedin ? 'Add a LinkedIn profile for stronger recruiter trust.' : null
  ].filter(Boolean);

  return {
    score,
    keywordCoverage,
    matchedKeywords: matchedKeywords.slice(0, 20),
    missingSkills,
    suggestions,
    grammarNotes: ['Run AI polish to tighten phrasing, remove weak verbs, and improve readability.']
  };
};

