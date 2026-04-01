import { analyzeResumeAgainstJD } from '../services/atsService.js';
import { generateJobFitNarrative, generateJobMatches } from '../services/aiService.js';
import { searchLiveJobs } from '../services/jobSearchService.js';

export const searchJobs = async (req, res) => {
  const { query, location } = req.body;

  if (!query?.trim()) {
    const error = new Error('Search query is required');
    error.statusCode = 400;
    throw error;
  }

  const jobs = await searchLiveJobs({ query, location });
  res.json({ jobs });
};

export const getJobMatches = async (req, res) => {
  const { resume, jobDescription } = req.body;

  if (!resume) {
    const error = new Error('Resume payload is required');
    error.statusCode = 400;
    throw error;
  }

  const atsAnalysis = analyzeResumeAgainstJD(resume, jobDescription || resume.jobDescription);
  const matches = await generateJobMatches({ resume, atsAnalysis });

  res.json({
    atsAnalysis,
    matches: matches.matches || []
  });
};

export const compareJobToResume = async (req, res) => {
  const { resume, selectedJob } = req.body;

  if (!resume || !selectedJob) {
    const error = new Error('Resume payload and selected job description are required');
    error.statusCode = 400;
    throw error;
  }

  const synthesizedDescription = [
    selectedJob.title,
    selectedJob.company,
    selectedJob.location,
    ...(selectedJob.tags || []),
    selectedJob.description
  ]
    .filter(Boolean)
    .join(' ');
  const plainDescription = synthesizedDescription.replace(/<[^>]+>/g, ' ').trim();

  if (!plainDescription) {
    const error = new Error('Selected job does not include enough detail to compare');
    error.statusCode = 400;
    throw error;
  }

  const normalizedJob = {
    ...selectedJob,
    description: plainDescription
  };
  const atsAnalysis = analyzeResumeAgainstJD(resume, plainDescription);
  const fit = await generateJobFitNarrative({ resume, selectedJob: normalizedJob, atsAnalysis });

  res.json({
    fitPercent: atsAnalysis.score,
    selectedJob: normalizedJob,
    atsAnalysis,
    fit
  });
};
