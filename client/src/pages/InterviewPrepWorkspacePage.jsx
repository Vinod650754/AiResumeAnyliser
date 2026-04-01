import { useEffect, useMemo, useState } from 'react';
import { Mic } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useResumeWorkspace } from '../hooks/useResumeWorkspace.js';
import { api, withAuth } from '../lib/api.js';
import { SectionCard } from '../components/ui/SectionCard.jsx';
import { ResumeSelectorBar } from '../components/workspace/ResumeSelectorBar.jsx';
import { FormField } from '../components/ui/FormField.jsx';
import { InterviewPrepPanel } from '../components/builder/InterviewPrepPanel.jsx';

export const InterviewPrepWorkspacePage = () => {
  const { token } = useAuth();
  const { resumes, selectedResume, selectedResumeId, setSelectedResumeId, loading } = useResumeWorkspace(token);
  const [targetContext, setTargetContext] = useState('');
  const [interview, setInterview] = useState(null);
  const [busy, setBusy] = useState(false);
  const storageKey = useMemo(() => `interview_answers_${selectedResumeId}`, [selectedResumeId]);

  useEffect(() => {
    if (!selectedResume) {
      setInterview(null);
      return;
    }
    setInterview(selectedResume.interviewPrep || null);
  }, [selectedResume]);

  const generateInterview = async () => {
    if (!selectedResume) return;
    setBusy(true);
    try {
      const response = await api.post(
        '/interview/generate',
        {
          resume: selectedResume,
          jobDescription: targetContext || selectedResume.jobDescription
        },
        withAuth(token)
      );
      const savedAnswers = JSON.parse(localStorage.getItem(storageKey) || '{}');
      setInterview({ ...response.data.interview, answers: savedAnswers });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="liquid-glass rounded-[30px] p-6 text-white/55">Loading resumes...</div>;
  }

  if (!selectedResume) {
    return <div className="liquid-glass rounded-[30px] p-6 text-white/55">Create a resume first to generate interview prep.</div>;
  }

  return (
    <div className="space-y-6">
      <ResumeSelectorBar
        resumes={resumes}
        selectedResumeId={selectedResumeId}
        onChange={setSelectedResumeId}
        helperText="Generate technical and experience-based interview questions for your selected resume."
      />

      <SectionCard
        title="Interview Prep"
        description="Generate technical, behavioral, and project-based questions, then write your answers directly in the workspace."
        actions={
          <button type="button" onClick={generateInterview} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
            <Mic size={16} />
            {busy ? 'Generating...' : 'Generate Questions'}
          </button>
        }
      >
        <FormField
          label="Target interview context"
          as="textarea"
          rows="5"
          value={targetContext}
          onChange={(event) => setTargetContext(event.target.value)}
          placeholder="Paste a role summary, expected responsibilities, or technical stack for more focused questions."
        />
      </SectionCard>

      <InterviewPrepPanel interview={interview} storageKey={storageKey} />
    </div>
  );
};
