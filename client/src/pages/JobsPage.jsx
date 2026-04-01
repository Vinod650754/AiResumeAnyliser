import { useMemo, useState } from 'react';
import { Search, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useResumeWorkspace } from '../hooks/useResumeWorkspace.js';
import { api, withAuth } from '../lib/api.js';
import { SectionCard } from '../components/ui/SectionCard.jsx';
import { ResumeSelectorBar } from '../components/workspace/ResumeSelectorBar.jsx';
import { FormField } from '../components/ui/FormField.jsx';

export const JobsPage = () => {
  const { token } = useAuth();
  const { resumes, selectedResume, selectedResumeId, setSelectedResumeId, loading } = useResumeWorkspace(token);
  const [searchQuery, setSearchQuery] = useState('MERN stack developer');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [busy, setBusy] = useState('');

  const selectedJobDescription = useMemo(() => selectedJob?.description || '', [selectedJob]);

  const searchJobs = async () => {
    setBusy('search');
    try {
      const response = await api.post('/jobs/search', { query: searchQuery, location }, withAuth(token));
      setJobs(response.data.jobs || []);
      setSelectedJob(response.data.jobs?.[0] || null);
      setComparison(null);
    } finally {
      setBusy('');
    }
  };

  const compareJob = async () => {
    if (!selectedResume || !selectedJob) return;
    setBusy('compare');
    try {
      const response = await api.post(
        '/jobs/compare',
        {
          resume: selectedResume,
          selectedJob
        },
        withAuth(token)
      );
      setComparison(response.data);
    } finally {
      setBusy('');
    }
  };

  if (loading) {
    return <div className="liquid-glass rounded-[30px] p-6 text-white/55">Loading resumes...</div>;
  }

  if (!selectedResume) {
    return <div className="liquid-glass rounded-[30px] p-6 text-white/55">Create a resume first to compare it against jobs.</div>;
  }

  return (
    <div className="space-y-6">
      <ResumeSelectorBar
        resumes={resumes}
        selectedResumeId={selectedResumeId}
        onChange={setSelectedResumeId}
        helperText="Search a live job, review its description separately, and compare it with your chosen resume."
      />

      <SectionCard title="Job Matching" description="Search real jobs, pick one, then compare its description against your resume for a fit score.">
        <div className="grid gap-4 lg:grid-cols-[1fr,1fr,auto]">
          <FormField label="Job search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="MERN stack developer" />
          <FormField label="Location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Remote, India, Bengaluru" />
          <button
            type="button"
            onClick={searchJobs}
            className="inline-flex items-center justify-center gap-2 self-end rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
          >
            <Search size={16} />
            {busy === 'search' ? 'Searching...' : 'Search Jobs'}
          </button>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <SectionCard title="Live Results" description="Select a real job listing to inspect and compare.">
          <div className="space-y-3">
            {jobs.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => {
                  setSelectedJob(job);
                  setComparison(null);
                }}
                className={`w-full rounded-[26px] border p-4 text-left transition ${
                  selectedJob?.id === job.id ? 'border-cyan-300/40 bg-white/10' : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <p className="font-medium text-white">{job.title}</p>
                <p className="mt-1 text-sm text-white/55">{job.company} | {job.location}</p>
                <p className="mt-3 text-sm text-white/65">{job.tags?.slice(0, 5).join(', ')}</p>
              </button>
            ))}
            {!jobs.length ? <p className="text-white/55">Search for a job to load live listings.</p> : null}
          </div>
        </SectionCard>

        <SectionCard
          title="Job Description Compare"
          description="Keep the selected job description separate and compare it against your resume when ready."
          actions={
            <button
              type="button"
              onClick={compareJob}
              disabled={!selectedJob}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white disabled:opacity-50"
            >
              <Target size={16} />
              {busy === 'compare' ? 'Comparing...' : 'Compare With Resume'}
            </button>
          }
        >
          {selectedJob ? (
            <div className="space-y-5">
              <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                <p className="font-medium text-white">{selectedJob.title}</p>
                <p className="mt-1 text-sm text-white/55">{selectedJob.company} | {selectedJob.location}</p>
                <a href={selectedJob.applyUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-cyan-200">
                  View job listing
                </a>
              </div>
              <FormField label="Selected job description" as="textarea" rows="14" value={selectedJobDescription} readOnly />
              {comparison ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="liquid-glass rounded-[26px] p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/42">Fit score</p>
                    <p className="mt-3 font-display text-5xl italic text-white">{comparison.fitPercent}%</p>
                    <p className="mt-3 text-sm text-white/65">{comparison.fit?.fitSummary}</p>
                  </div>
                  <div className="liquid-glass rounded-[26px] p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/42">Missing skills</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {comparison.atsAnalysis.missingSkills?.map((skill) => (
                        <span key={skill} className="rounded-full bg-rose-400/10 px-3 py-1 text-xs text-rose-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-white/55">Select a searched job to inspect its description and compare it.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

