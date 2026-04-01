import { useEffect, useState } from 'react';

const QuestionBlock = ({ label, questions = [], answers, onAnswerChange }) => (
  <div className="space-y-4">
    <div className="liquid-glass rounded-[28px] p-5">
      <p className="text-xs uppercase tracking-[0.28em] text-white/42">{label}</p>
    </div>
    {questions.map((question, index) => {
      const key = `${label}-${index}`;
      return (
        <div key={key} className="liquid-glass rounded-[28px] p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Question {index + 1}</p>
          <p className="mt-3 text-white/80">{question}</p>
          <textarea
            value={answers[key] || ''}
            onChange={(event) => onAnswerChange(key, event.target.value)}
            rows={5}
            placeholder="Write your answer here..."
            className="mt-4 w-full rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
          />
        </div>
      );
    })}
  </div>
);

export const InterviewPrepPanel = ({ interview, storageKey }) => {
  const [answers, setAnswers] = useState({});

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

  return (
    <div className="space-y-4">
      <div className="liquid-glass rounded-[28px] p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Role focus</p>
        <p className="mt-3 font-display text-3xl italic text-white">{interview.roleFocus}</p>
      </div>
      <QuestionBlock label="Technical" questions={interview.technicalQuestions} answers={answers} onAnswerChange={updateAnswer} />
      <QuestionBlock label="Behavioral" questions={interview.behavioralQuestions} answers={answers} onAnswerChange={updateAnswer} />
      <QuestionBlock label="Project deep dive" questions={interview.projectQuestions} answers={answers} onAnswerChange={updateAnswer} />
      <div className="liquid-glass rounded-[28px] p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Coaching tips</p>
        <ul className="mt-3 space-y-2 text-sm text-white/72">
          {interview.coachingTips?.map((tip) => (
            <li key={tip}>• {tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
