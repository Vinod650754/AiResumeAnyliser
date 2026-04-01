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
  const [jobTitle, setJobTitle] = useState('');
  const [interview, setInterview] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const storageKey = useMemo(() => `interview_answers_${selectedResumeId}`, [selectedResumeId]);

  useEffect(() => {
    if (!selectedResume) {
      setInterview(null);
      setEvaluation(null);
      return;
    }

    setJobTitle(selectedResume.personal?.role || selectedResume.title || '');
    setInterview(selectedResume.interviewPrep || null);
    setEvaluation(null);
  }, [selectedResume]);

  const generateInterview = async () => {
    if (!selectedResume) return;
    setBusy(true);
    setEvaluation(null);
    try {
      const response = await api.post(
        '/interview/generate',
        {
          resume: selectedResume,
          jobTitle,
          jobDescription: selectedResume.jobDescription
        },
        withAuth(token)
      );
      const savedAnswers = JSON.parse(localStorage.getItem(storageKey) || '{}');
      setInterview({ ...response.data.interview, answers: savedAnswers });
    } finally {
      setBusy(false);
    }
  };

  const submitAnswers = async (questions, answers) => {
    setSubmitting(true);
    try {
      const orderedAnswers = questions.map((_, index) => answers[index] || '');
      const response = await api.post(
        '/interview/evaluate',
        {
          roleFocus: interview?.roleFocus || jobTitle,
          questions,
          answers: orderedAnswers
        },
        withAuth(token)
      );
      setEvaluation(response.data.evaluation);
    } finally {
      setSubmitting(false);
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
        helperText="Generate at least 10 interview questions for the selected role, answer them, and get AI scoring afterward."
      />

      <SectionCard
        title="Interview Prep"
        description="Generate a balanced interview set with basic, technical, and scenario questions for the job title you want."
        actions={
          <button type="button" onClick={generateInterview} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
            <Mic size={16} />
            {busy ? 'Generating...' : 'Generate Questions'}
          </button>
        }
      >
        <FormField
          label="Target job title"
          value={jobTitle}
          onChange={(event) => setJobTitle(event.target.value)}
          placeholder="Senior MERN Developer, Frontend Engineer, Backend Engineer"
        />
      </SectionCard>

      <InterviewPrepPanel
        interview={interview}
        storageKey={storageKey}
        onSubmit={submitAnswers}
        submitting={submitting}
        evaluation={evaluation}
      />
    </div>
  );
};
