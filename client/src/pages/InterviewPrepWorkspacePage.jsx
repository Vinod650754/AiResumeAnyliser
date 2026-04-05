import { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useResumeWorkspace } from '../hooks/useResumeWorkspace.js';
import { api, withAuth } from '../lib/api.js';
import { persistResumeWorkspace } from '../lib/resumeWorkspaceApi.js';
import { SectionCard } from '../components/ui/SectionCard.jsx';
import { ResumeSelectorBar } from '../components/workspace/ResumeSelectorBar.jsx';
import { FormField } from '../components/ui/FormField.jsx';
import { InterviewPrepPanel } from '../components/builder/InterviewPrepPanel.jsx';

export const InterviewPrepWorkspacePage = () => {
  const { token } = useAuth();
  const { resumes, selectedResume, selectedResumeId, setSelectedResumeId, loading, refreshResumes } = useResumeWorkspace(token);
  const [jobTitle, setJobTitle] = useState('');
  const [interview, setInterview] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const storageKey = useMemo(() => `interview_answers_${selectedResumeId}`, [selectedResumeId]);

  useEffect(() => {
    if (!selectedResume) {
      setInterview(null);
      setEvaluation(null);
      return;
    }

    setJobTitle(selectedResume.personal?.role || selectedResume.title || '');
    setInterview(selectedResume.interviewPrep || null);
    setEvaluation(selectedResume.interviewPrep?.evaluation || null);
  }, [selectedResume]);

  const generateInterview = async () => {
    if (!selectedResume) return;
    setBusy(true);
    setEvaluation(null);
    setMessage('');
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
      const nextInterview = { ...response.data.interview, answers: savedAnswers };
      setInterview(nextInterview);

      await persistResumeWorkspace({
        token,
        resume: selectedResume,
        patch: {
          interviewPrep: nextInterview
        }
      });

      await refreshResumes?.();
      setMessage('Interview kit saved to the workspace and ready on the dashboard.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to generate interview prep right now.');
    } finally {
      setBusy(false);
    }
  };

  const submitAnswers = async (questions, answers) => {
    setSubmitting(true);
    setMessage('');
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

      const nextEvaluation = response.data.evaluation;
      const nextInterview = {
        ...(interview || {}),
        answers,
        evaluation: nextEvaluation
      };

      setInterview(nextInterview);
      setEvaluation(nextEvaluation);

      await persistResumeWorkspace({
        token,
        resume: selectedResume,
        patch: {
          interviewPrep: nextInterview
        }
      });

      await refreshResumes?.();
      setMessage('Interview answers and AI scoring were saved to the workspace.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to evaluate interview answers right now.');
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
        helperText="Generate interview questions for the active resume, save the question set, and keep the AI evaluation synced into the dashboard."
      />

      <SectionCard
        title="Interview Prep"
        description="Generate a balanced AI interview set with basic, technical, and scenario questions for the target role you want."
        actions={
          <button type="button" onClick={generateInterview} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
            <Sparkles size={16} />
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
        {message ? <p className="mt-4 text-sm text-cyan-200">{message}</p> : null}
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
