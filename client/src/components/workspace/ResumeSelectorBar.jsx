export const ResumeSelectorBar = ({ resumes, selectedResumeId, onChange, helperText }) => (
  <div className="liquid-glass rounded-[28px] p-4">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Active resume</p>
        <p className="mt-1 text-sm text-white/60">{helperText}</p>
      </div>
      <select
        value={selectedResumeId}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
      >
        {resumes.map((resume) => (
          <option key={resume._id} value={resume._id} className="bg-slate-950">
            {resume.title}
          </option>
        ))}
      </select>
    </div>
  </div>
);
