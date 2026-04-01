import { useEffect, useMemo, useState } from 'react';

const QuestionBlock = ({ label, questions = [], answers, onAnswerChange, startIndex }) => (
  <div className="space-y-4">
    <div className="liquid-glass rounded-[28px] p-5">
      <p className="text-xs uppercase tracking-[0.28em] text-white/42">{label}</p>
    </div>
    {questions.map((question, index) => {
      const answerIndex = startIndex + index;
      return (
        <div key={`${label}-${answerIndex}`} className="liquid-glass rounded-[28px] p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Question {answerIndex + 1}</p>
          <p className="mt-3 text-white/80">{question}</p>
          <textarea
            value={answers[answerIndex] || ''}
            onChange={(event) => onAnswerChange(answerIndex, event.target.value)}
            rows={5}
            placeholder="Write your answer here..."
            className="mt-4 w-full rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
          />
        </div>
      );
    })}
  </div>
);

export const InterviewPrepPanel = ({ interview, storageKey, onSubmit, submitting, evaluation }) => {
  const [answers, setAnswers] = useState({});

  const groupedQuestions = useMemo(() => {
    if (!interview) {
      return [];
    }

    return [
      { label: 'Basic questions', questions: interview.basicQuestions || [] },
      { label: 'Technical questions', questions: interview.technicalQuestions || [] },
      { label: 'Scenario questions', questions: interview.scenarioQuestions || [] }
    ];
  }, [interview]);

  useEffect(() => {
    setAnswers(interview?.answers || JSON.parse(localStorage.getItem(storageKey || '') || '{}'));
  }, [interview, storageKey]);

  const updateAnswer = (key, value) => {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(next));
      }
      return next;
    });
  };

  if (!interview) {
    return <div className="liquid-glass rounded-[28px] p-5 text-white/55">Generate interview prep to begin mock questions.</div>;
  }

  const orderedQuestions = groupedQuestions.flatMap((group) => group.questions);

  return (
    <div className="space-y-4">
      <div className="liquid-glass rounded-[28px] p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Role focus</p>
        <p className="mt-3 font-display text-3xl italic text-white">{interview.roleFocus}</p>
        <p className="mt-3 text-sm text-white/60">A complete interview set with at least 10 questions is generated for this role.</p>
      </div>

      {groupedQuestions.map((group, groupIndex) => (
        <QuestionBlock
          key={group.label}
          label={group.label}
          questions={group.questions}
          answers={answers}
          onAnswerChange={updateAnswer}
          startIndex={groupedQuestions.slice(0, groupIndex).reduce((total, item) => total + item.questions.length, 0)}
        />
      ))}

      <div className="liquid-glass rounded-[28px] p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Coaching tips</p>
        <ul className="mt-3 space-y-2 text-sm text-white/72">
          {interview.coachingTips?.map((tip) => (
            <li key={tip}>• {tip}</li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onSubmit(orderedQuestions, answers)}
          className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
        >
          {submitting ? 'Evaluating...' : 'Submit Answers'}
        </button>
      </div>

      {evaluation ? (
        <div className="space-y-4">
          <div className="liquid-glass rounded-[28px] p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-white/42">Overall score</p>
            <p className="mt-3 font-display text-5xl italic text-white">{evaluation.overallScore}/100</p>
            <p className="mt-3 text-sm text-white/72">{evaluation.summary}</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {evaluation.results?.map((result) => (
              <div key={result.question} className="liquid-glass rounded-[28px] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Score {result.score}/10</p>
                <p className="mt-3 text-white/80">{result.question}</p>
                <p className="mt-4 text-sm leading-7 text-white/68">{result.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
