import { useEffect, useMemo, useState } from 'react';
import { Search, Target, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useResumeWorkspace } from '../hooks/useResumeWorkspace.js';
import { api, withAuth } from '../lib/api.js';
import { persistResumeWorkspace } from '../lib/resumeWorkspaceApi.js';
import { SectionCard } from '../components/ui/SectionCard.jsx';
import { ResumeSelectorBar } from '../components/workspace/ResumeSelectorBar.jsx';
import { FormField } from '../components/ui/FormField.jsx';
import { ATSInsightsPanel } from '../components/builder/ATSInsightsPanel.jsx';

export const JobsPage = () => {
  const { token } = useAuth();
  const { resumes, selectedResume, selectedResumeId, setSelectedResumeId, loading, refreshResumes } = useResumeWorkspace(token);
  const [searchQuery, setSearchQuery] = useState('MERN stack developer');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [jobMatches, setJobMatches] = useState([]);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  const selectedJobDescription = useMemo(() => selectedJob?.description || '', [selectedJob]);

  useEffect(() => {
    setJobMatches(selectedResume?.jobMatches || []);
    setComparison(null);
  }, [selectedResume]);

  const searchJobs = async () => {
    setBusy('search');
    setMessage('');
    try {
      const response = await api.post('/jobs/search', { query: searchQuery, location }, withAuth(token));
      setJobs(response.data.jobs || []);
      setSelectedJob(response.data.jobs?.[0] || null);
      setComparison(null);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to search jobs right now.');
    } finally {
      setBusy('');
    }
  };

  const generateAIMatches = async () => {
    if (!selectedResume) return;

    setBusy('match');
    setMessage('');
    try {
      const response = await api.post(
        '/jobs/match',
        {
          resume: selectedResume,
          jobDescription: selectedJobDescription || selectedResume.jobDescription
        },
        withAuth(token)
      );

      const nextMatches = response.data.matches || [];
      setJobMatches(nextMatches);

      await persistResumeWorkspace({
        token,
        resume: selectedResume,
        patch: {
          jobDescription: selectedJobDescription || selectedResume.jobDescription || '',
          atsAnalysis: response.data.atsAnalysis,
          jobMatches: nextMatches
        }
      });

      await refreshResumes?.();
      setMessage('AI role matches saved to the workspace and synced with the dashboard.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to generate AI job matches right now.');
    } finally {
      setBusy('');
    }
  };

  const compareJob = async () => {
    if (!selectedResume || !selectedJob) return;
    setBusy('compare');
    setMessage('');
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

      const savedComparison = {
        title: response.data.selectedJob?.title,
        company: response.data.selectedJob?.company,
        matchScore: response.data.fitPercent,
        reason: response.data.fit?.fitSummary,
        missingSkills: response.data.atsAnalysis?.missingSkills || []
      };
      const nextMatches = [
        savedComparison,
        ...(jobMatches || []).filter((item) => `${item.title}-${item.company}` !== `${savedComparison.title}-${savedComparison.company}`)
      ];
      setJobMatches(nextMatches);

      await persistResumeWorkspace({
        token,
        resume: selectedResume,
        patch: {
          jobDescription: response.data.selectedJob?.description || selectedResume.jobDescription || '',
          atsAnalysis: response.data.atsAnalysis,
          jobMatches: nextMatches
        }
      });

      await refreshResumes?.();
      setMessage('The selected job comparison is now saved into the dashboard workspace.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to compare this job with the resume right now.');
    } finally {
      setBusy('');
    }
  };

  useEffect(() => {
    if (token) {
      searchJobs();
    }
  }, []);

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
        helperText="Search a live job, review its description, compare it against the selected resume, and save the AI fit back to the dashboard."
      />

      <SectionCard title="Job Matching" description="Search real jobs, pick one, and use AI to compare or suggest strong-fit roles for the active resume.">
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
        {message ? <p className="mt-4 text-sm text-cyan-200">{message}</p> : null}
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
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-cyan-200/70">{job.source}</p>
                <p className="mt-3 text-sm text-white/65">{job.tags?.slice(0, 5).join(', ')}</p>
              </button>
            ))}
            {!jobs.length ? <p className="text-white/55">No matching live jobs were found yet. Try a broader search like react developer, frontend engineer, or node developer.</p> : null}
          </div>
        </SectionCard>

        <SectionCard
          title="Job Description Compare"
          description="Keep the selected job description separate, compare it against your resume, and save the fit into your dashboard."
          actions={
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={generateAIMatches}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              >
                <Sparkles size={16} />
                {busy === 'match' ? 'Generating...' : 'AI Role Matches'}
              </button>
              <button
                type="button"
                onClick={compareJob}
                disabled={!selectedJob}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white disabled:opacity-50"
              >
                <Target size={16} />
                {busy === 'compare' ? 'Comparing...' : 'Compare With Resume'}
              </button>
            </div>
          }
        >
          {selectedJob ? (
            <div className="space-y-5">
              <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                <p className="font-medium text-white">{selectedJob.title}</p>
                <p className="mt-1 text-sm text-white/55">{selectedJob.company} | {selectedJob.location}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-cyan-200/70">{selectedJob.source}</p>
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

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <SectionCard
          title="AI Job Match Suggestions"
          description="These AI-generated role matches are stored with the active resume so the dashboard can track matching momentum."
        >
          <div className="space-y-3">
            {jobMatches.length ? (
              jobMatches.map((match) => (
                <div key={`${match.title}-${match.company}`} className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{match.title}</p>
                      <p className="mt-1 text-sm text-white/55">{match.company}</p>
                    </div>
                    <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">{match.matchScore}% match</span>
                  </div>
                  <p className="mt-3 text-sm text-white/70">{match.reason}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(match.missingSkills || []).map((skill) => (
                      <span key={`${match.title}-${skill}`} className="rounded-full bg-rose-400/10 px-3 py-1 text-xs text-rose-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white/55">Generate AI role matches to store role-fit suggestions for this resume.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="ATS View For Selected Job" description="The ATS analyzer for the selected or saved job target is shown here.">
          <ATSInsightsPanel analysis={comparison?.atsAnalysis || selectedResume.atsAnalysis} />
        </SectionCard>
      </div>
    </div>
  );
};
