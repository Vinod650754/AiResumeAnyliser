import { useState } from 'react';
import { useEffect } from 'react';
import { Wand2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useResumeWorkspace } from '../hooks/useResumeWorkspace.js';
import { api, withAuth } from '../lib/api.js';
import { SectionCard } from '../components/ui/SectionCard.jsx';
import { ResumeSelectorBar } from '../components/workspace/ResumeSelectorBar.jsx';
import { FormField } from '../components/ui/FormField.jsx';
import { AIComparePanel } from '../components/builder/AIComparePanel.jsx';
import { PremiumATSInsights } from '../components/builder/PremiumATSInsights.jsx';

export const AIImproverPage = () => {
  const { token } = useAuth();
  const { resumes, selectedResume, selectedResumeId, setSelectedResumeId, loading } = useResumeWorkspace(token);
  const [targetNotes, setTargetNotes] = useState('');
  const [improved, setImproved] = useState(null);
  const [analysis, setAnalysis] = useState(selectedResume?.atsAnalysis || null);
  const [busy, setBusy] = useState('');

  useEffect(() => {
    setImproved(null);
    setAnalysis(selectedResume?.atsAnalysis || null);
  }, [selectedResumeId, selectedResume]);

  const runImprove = async () => {
    if (!selectedResume) return;
    setBusy('improve');
    try {
      const response = await api.post(
        '/ats/improve',
        {
          resume: selectedResume,
          jobDescription: targetNotes
        },
        withAuth(token)
      );
      setImproved(response.data.improved);
    } finally {
      setBusy('');
    }
  };

  const runATS = async () => {
    if (!selectedResume) return;
    setBusy('ats');
    try {
      const response = await api.post(
        '/ats/analyze',
        {
          resume: selectedResume,
          jobDescription: targetNotes || selectedResume.jobDescription
        },
        withAuth(token)
      );
      setAnalysis(response.data.analysis);
    } finally {
      setBusy('');
    }
  };

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
        helperText="Choose which resume you want to improve and score."
      />

      <SectionCard title="AI Improver" description="Refine the resume with AI and analyze its ATS strength against a specific target.">
        <div className="grid gap-4 lg:grid-cols-[1fr,auto]">
          <FormField
            label="Target role or notes"
            as="textarea"
            rows="5"
            value={targetNotes}
            onChange={(event) => setTargetNotes(event.target.value)}
            placeholder="Paste a target role, responsibilities, or a short job summary."
          />
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={runImprove}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white"
            >
              <Wand2 size={16} />
              {busy === 'improve' ? 'Improving...' : 'Improve with AI'}
            </button>
            <button
              type="button"
              onClick={runATS}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
            >
              <Sparkles size={16} />
              {busy === 'ats' ? 'Analyzing...' : 'Analyze ATS'}
            </button>
          </div>
        </div>
      </SectionCard>

      {improved?.improvedSummary ? (
        <SectionCard title="Before And After" description="Compare the original summary with the AI-improved version.">
          <AIComparePanel original={selectedResume.summary} improved={improved.improvedSummary} />
        </SectionCard>
      ) : null}

      <PremiumATSInsights analysis={analysis} />
    </div>
  );
};
