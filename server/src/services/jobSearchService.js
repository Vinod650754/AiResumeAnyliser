const REMOTE_OK_API_URL = 'https://remoteok.com/api';
const REMOTIVE_API_URL = 'https://remotive.com/api/remote-jobs';
const ARBEITNOW_API_URL = 'https://www.arbeitnow.com/api/job-board-api';

const withTimeout = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
};

const normalizeText = (value = '') => value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const sanitizeRemoteOkJob = (job) => ({
  id: `remoteok-${job.id}`,
  title: job.position || job.title || 'Untitled role',
  company: job.company || 'Unknown company',
  location: job.location || 'Remote',
  tags: job.tags || [],
  salaryMin: job.salary_min || null,
  salaryMax: job.salary_max || null,
  description: normalizeText(job.description || ''),
  applyUrl: job.apply_url || job.url || `https://remoteok.com/remote-jobs/${job.id}`,
  logo: job.company_logo || null,
  source: 'Remote OK',
  date: job.date || null
});

const sanitizeRemotiveJob = (job) => ({
  id: `remotive-${job.id}`,
  title: job.title || 'Untitled role',
  company: job.company_name || 'Unknown company',
  location: job.candidate_required_location || 'Remote',
  tags: job.tags || [],
  salaryMin: null,
  salaryMax: null,
  description: normalizeText(job.description || ''),
  applyUrl: job.url,
  logo: job.company_logo || null,
  source: 'Remotive',
  date: job.publication_date || null
});

const sanitizeArbeitnowJob = (job) => ({
  id: `arbeitnow-${job.slug || job.job_id || job.title}`,
  title: job.title || 'Untitled role',
  company: job.company_name || 'Unknown company',
  location: Array.isArray(job.location) ? job.location.join(', ') : job.location || 'Remote',
  tags: job.tags || [],
  salaryMin: null,
  salaryMax: null,
  description: normalizeText(job.description || ''),
  applyUrl: job.url,
  logo: job.company_logo || null,
  source: 'Arbeitnow',
  date: job.created_at || null
});

const matchesSearch = (job, normalizedQuery, normalizedLocation) => {
  const haystack = [job.title, job.company, job.location, ...(job.tags || []), job.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const queryScore = queryTokens.length ? queryTokens.filter((token) => haystack.includes(token)).length / queryTokens.length : 1;
  const locationMatch = normalizedLocation ? haystack.includes(normalizedLocation) : true;

  return queryScore >= 0.4 && locationMatch;
};

const dedupeJobs = (jobs) => {
  const map = new Map();
  for (const job of jobs) {
    const key = `${job.title}-${job.company}`.toLowerCase();
    if (!map.has(key)) {
      map.set(key, job);
    }
  }
  return [...map.values()];
};

const fetchRemoteOkJobs = async () => {
  const response = await withTimeout(REMOTE_OK_API_URL);
  if (!response.ok) return [];
  const payload = await response.json();
  return (Array.isArray(payload) ? payload.slice(1) : []).map(sanitizeRemoteOkJob);
};

const fetchRemotiveJobs = async () => {
  const response = await withTimeout(REMOTIVE_API_URL);
  if (!response.ok) return [];
  const payload = await response.json();
  return (payload.jobs || []).map(sanitizeRemotiveJob);
};

const fetchArbeitnowJobs = async () => {
  const response = await withTimeout(ARBEITNOW_API_URL);
  if (!response.ok) return [];
  const payload = await response.json();
  return (payload.data || []).map(sanitizeArbeitnowJob);
};

export const searchLiveJobs = async ({ query = '', location = '', limit = 12 }) => {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedLocation = location.trim().toLowerCase();

  const providerResults = await Promise.allSettled([fetchRemoteOkJobs(), fetchRemotiveJobs(), fetchArbeitnowJobs()]);
  const jobs = providerResults.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));

  const filtered = dedupeJobs(jobs).filter((job) => matchesSearch(job, normalizedQuery, normalizedLocation));

  return filtered
    .sort((left, right) => (right.tags?.length || 0) - (left.tags?.length || 0))
    .slice(0, limit);
};
