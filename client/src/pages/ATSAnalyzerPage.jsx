import { useEffect, useState } from 'react';
import { Target, Wand2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useResumeWorkspace } from '../hooks/useResumeWorkspace.js';
import { api, withAuth } from '../lib/api.js';
import { persistResumeWorkspace } from '../lib/resumeWorkspaceApi.js';
import { SectionCard } from '../components/ui/SectionCard.jsx';
import { ResumeSelectorBar } from '../components/workspace/ResumeSelectorBar.jsx';
import { FormField } from '../components/ui/FormField.jsx';
import { ATSInsightsPanel } from '../components/builder/ATSInsightsPanel.jsx';

export const ATSAnalyzerPage = () => {
  const { token } = useAuth();
  const { resumes, selectedResume, selectedResumeId, setSelectedResumeId, loading, refreshResumes } = useResumeWorkspace(token);
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!selectedResume) {
      setAnalysis(null);
      return;
    }

    setTargetRole(selectedResume.atsAnalysis?.targetRole || selectedResume.personal?.role || selectedResume.title || '');
    setJobDescription(selectedResume.jobDescription || '');
    setAnalysis(selectedResume.atsAnalysis || null);
  }, [selectedResume]);

  const runAnalysis = async () => {
    if (!selectedResume) return;

    setBusy(true);
    setMessage('');

    try {
      const response = await api.post(
        '/ats/analyze',
        {
          resume: selectedResume,
          targetRole,
          jobDescription
        },
        withAuth(token)
      );

      const nextAnalysis = response.data.analysis;
      setAnalysis(nextAnalysis);

      await persistResumeWorkspace({
        token,
        resume: selectedResume,
        patch: {
          jobDescription,
          atsAnalysis: nextAnalysis
        }
      });

      await refreshResumes?.();
      setMessage('ATS analysis saved to the workspace and synced with the dashboard.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to run ATS analysis right now.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="liquid-glass rounded-[30px] p-6 text-white/55">Loading resumes...</div>;
  }

  if (!selectedResume) {
    return <div className="liquid-glass rounded-[30px] p-6 text-white/55">Create a resume first to analyze ATS fit.</div>;
  }

  return (
    <div className="space-y-6">
      <ResumeSelectorBar
        resumes={resumes}
        selectedResumeId={selectedResumeId}
        onChange={setSelectedResumeId}
        helperText="Choose a resume, enter the target role, and compare the resume against that role with saved ATS insights."
      />

      <SectionCard
        title="ATS Analyzer"
        description="Enter the target job role and target description. The analyzer compares role skills against the selected resume and saves the result for the dashboard."
        actions={
          <button
            type="button"
            onClick={runAnalysis}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
          >
            <Target size={16} />
            {busy ? 'Analyzing...' : 'Run ATS Analysis'}
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Target job role"
            value={targetRole}
            onChange={(event) => setTargetRole(event.target.value)}
            placeholder="Senior MERN Developer, Frontend Engineer, Backend Engineer"
          />
          <div className="liquid-glass rounded-[24px] p-4 text-sm text-white/70">
            <p className="text-xs uppercase tracking-[0.22em] text-white/42">Resume skills detected</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(selectedResume.skills || []).map((skill) => (
                <span key={skill} className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/78">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <FormField
            label="Target job description"
            as="textarea"
            rows="10"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the target role requirements, responsibilities, and skills here."
          />
        </div>
        {message ? <p className="mt-4 text-sm text-cyan-200">{message}</p> : null}
      </SectionCard>

      <SectionCard
        title="Skill Match"
        description="This compares the role skills extracted from your target role and description against the selected resume."
        actions={
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/60">
            <Wand2 size={14} />
            AI-assisted
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="liquid-glass rounded-[26px] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/42">Skill match score</p>
            <p className="mt-3 font-display text-5xl italic text-white">{analysis?.skillMatchScore || 0}</p>
          </div>
          <div className="liquid-glass rounded-[26px] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/42">Matched target skills</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {analysis?.matchedSkills?.length ? (
                analysis.matchedSkills.map((skill) => (
                  <span key={skill} className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-white/55">Run the analysis to see matched skills.</span>
              )}
            </div>
          </div>
          <div className="liquid-glass rounded-[26px] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/42">Missing target skills</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {analysis?.missingSkills?.length ? (
                analysis.missingSkills.map((skill) => (
                  <span key={skill} className="rounded-full bg-rose-400/10 px-3 py-1 text-xs text-rose-200">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-white/55">No critical skill gaps detected.</span>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      <ATSInsightsPanel analysis={analysis} />
    </div>
  );
};
