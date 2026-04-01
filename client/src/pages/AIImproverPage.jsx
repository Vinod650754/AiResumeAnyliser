import { useEffect, useMemo, useState } from 'react';
import { RefreshCcw, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useResumeWorkspace } from '../hooks/useResumeWorkspace.js';
import { api, withAuth } from '../lib/api.js';
import { SectionCard } from '../components/ui/SectionCard.jsx';
import { ResumeSelectorBar } from '../components/workspace/ResumeSelectorBar.jsx';
import { PremiumATSInsights } from '../components/builder/PremiumATSInsights.jsx';

const ImprovementCard = ({ title, children, accent = 'text-white/42' }) => (
  <div className="liquid-glass rounded-[28px] p-5">
    <p className={`text-xs uppercase tracking-[0.28em] ${accent}`}>{title}</p>
    <div className="mt-4 text-sm leading-7 text-white/78">{children}</div>
  </div>
);

export const AIImproverPage = () => {
  const { token } = useAuth();
  const { resumes, selectedResume, selectedResumeId, setSelectedResumeId, loading } = useResumeWorkspace(token);
  const [improved, setImproved] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const originalHighlights = useMemo(
    () => (selectedResume?.experience || []).flatMap((item) => item.highlights || []).slice(0, 6),
    [selectedResume]
  );

  const runImprove = async () => {
    if (!selectedResume) return;
    setBusy(true);
    setMessage('');
    try {
      const [improveResponse, atsResponse] = await Promise.all([
        api.post(
          '/ai/improve',
          {
            resume: selectedResume,
            jobDescription: selectedResume.jobDescription
          },
          withAuth(token)
        ),
        api.post(
          '/ats/analyze',
          {
            resume: selectedResume,
            jobDescription: selectedResume.jobDescription
          },
          withAuth(token)
        )
      ]);

      setImproved(improveResponse.data.improved);
      setAnalysis(atsResponse.data.analysis);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to generate AI improvements right now.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    setImproved(null);
    setAnalysis(selectedResume?.atsAnalysis || null);
    if (selectedResume && token) {
      runImprove();
    }
  }, [selectedResumeId]);

  if (loading) {
    return <div className="liquid-glass rounded-[30px] p-6 text-white/55">Loading resumes...</div>;
  }

  if (!selectedResume) {
    return <div className="liquid-glass rounded-[30px] p-6 text-white/55">Create a resume first to use the AI improver.</div>;
  }

  return (
    <div className="space-y-6">
      <ResumeSelectorBar
        resumes={resumes}
        selectedResumeId={selectedResumeId}
        onChange={setSelectedResumeId}
        helperText="Choose a resume and the AI improver will automatically rewrite and polish it side by side."
      />

      <SectionCard
        title="AI Resume Improver"
        description="The left side shows your current resume language. The right side shows a stronger AI-polished version with better grammar, summary quality, and recruiter framing."
        actions={
          <button
            type="button"
            onClick={runImprove}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
          >
            <RefreshCcw size={16} className={busy ? 'animate-spin' : ''} />
            {busy ? 'Improving...' : 'Refresh Improvement'}
          </button>
        }
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <ImprovementCard title="Current Summary">
              <p>{selectedResume.summary}</p>
            </ImprovementCard>
            <ImprovementCard title="Current Skills">
              <div className="flex flex-wrap gap-2">
                {selectedResume.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/78">
                    {skill}
                  </span>
                ))}
              </div>
            </ImprovementCard>
            <ImprovementCard title="Current Experience Highlights">
              <ul className="space-y-2">
                {originalHighlights.map((highlight) => (
                  <li key={highlight}>• {highlight}</li>
                ))}
              </ul>
            </ImprovementCard>
          </div>

          <div className="space-y-4">
            <ImprovementCard title="AI Improved Summary" accent="text-cyan-200/80">
              <p>{improved?.improvedSummary || 'Generating a stronger summary...'}</p>
            </ImprovementCard>
            <ImprovementCard title="AI Improved Skills" accent="text-cyan-200/80">
              <div className="flex flex-wrap gap-2">
                {(improved?.improvedSkills || []).map((skill) => (
                  <span key={skill} className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                    {skill}
                  </span>
                ))}
              </div>
            </ImprovementCard>
            <ImprovementCard title="AI Improved Highlights" accent="text-cyan-200/80">
              <ul className="space-y-2">
                {(improved?.improvedHighlights || []).map((highlight) => (
                  <li key={highlight}>• {highlight}</li>
                ))}
              </ul>
            </ImprovementCard>
            <ImprovementCard title="Grammar And Recruiter Notes" accent="text-cyan-200/80">
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/40">Grammar fixes</p>
                  <ul className="mt-2 space-y-2">
                    {(improved?.grammarFixes || []).map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/40">Recruiter notes</p>
                  <ul className="mt-2 space-y-2">
                    {(improved?.recruiterNotes || []).map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </ImprovementCard>
          </div>
        </div>
        {message ? <p className="mt-4 text-sm text-rose-200">{message}</p> : null}
      </SectionCard>

      <SectionCard title="AI ATS Review" description="Updated ATS analysis for the currently selected resume and role benchmark.">
        {busy && !analysis ? (
          <div className="liquid-glass rounded-[26px] p-6 text-white/55">Running AI improvement and ATS analysis...</div>
        ) : (
          <PremiumATSInsights analysis={analysis} />
        )}
      </SectionCard>
    </div>
  );
};
