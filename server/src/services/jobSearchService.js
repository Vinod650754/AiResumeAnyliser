const REMOTE_OK_API_URL = 'https://remoteok.com/api';

const sanitizeJob = (job) => ({
  id: String(job.id),
  title: job.position || job.title || 'Untitled role',
  company: job.company || 'Unknown company',
  location: job.location || 'Remote',
  tags: job.tags || [],
  salaryMin: job.salary_min || null,
  salaryMax: job.salary_max || null,
  description: (job.description || '').replace(/<[^>]+>/g, ' '),
  applyUrl: job.apply_url || job.url || `https://remoteok.com/remote-jobs/${job.id}`,
  logo: job.company_logo || null,
  source: 'Remote OK',
  date: job.date || null
});

export const searchLiveJobs = async ({ query = '', location = '', limit = 12 }) => {
  const response = await fetch(REMOTE_OK_API_URL, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Unable to fetch live jobs right now');
  }

  const payload = await response.json();
  const jobs = Array.isArray(payload) ? payload.slice(1) : [];

  const normalizedQuery = query.trim().toLowerCase();
  const normalizedLocation = location.trim().toLowerCase();

  return jobs
    .filter((job) => {
      const haystack = [job.position, job.company, ...(job.tags || []), job.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesQuery = normalizedQuery ? haystack.includes(normalizedQuery) : true;
      const matchesLocation = normalizedLocation
        ? `${job.location || ''}`.toLowerCase().includes(normalizedLocation)
        : true;
      return matchesQuery && matchesLocation;
    })
    .slice(0, limit)
    .map(sanitizeJob);
};
