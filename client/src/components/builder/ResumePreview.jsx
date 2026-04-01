const templateStyles = {
  nova: 'bg-white text-slate-900',
  eclipse: 'bg-slate-950 text-white border border-slate-800',
  aurora: 'bg-gradient-to-br from-sky-50 via-white to-teal-50 text-slate-900'
};

export const ResumePreview = ({ resume }) => (
  <div className="glass-panel scrollbar-thin max-h-[calc(100vh-9rem)] overflow-y-auto p-8">
    <div className={`space-y-6 rounded-[28px] p-8 ${templateStyles[resume.template] || templateStyles.nova}`}>
      <div>
        <h1 className="font-display text-4xl font-bold">{resume.personal.fullName}</h1>
        <p className="mt-2 opacity-80">{resume.personal.role}</p>
        <p className="mt-2 text-sm opacity-70">
          {resume.personal.email} • {resume.personal.phone} • {resume.personal.location}
        </p>
      </div>

      <section>
        <h2 className="border-b border-current/15 pb-2 font-display text-xl font-semibold">Summary</h2>
        <p className="mt-3 text-sm leading-7 opacity-80">{resume.summary}</p>
      </section>

      <section>
        <h2 className="border-b border-current/15 pb-2 font-display text-xl font-semibold">Skills</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {resume.skills.map((skill) => (
            <span key={skill} className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold dark:bg-white/10">
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="border-b border-current/15 pb-2 font-display text-xl font-semibold">Experience</h2>
        <div className="mt-4 space-y-4">
          {resume.experience.map((item) => (
            <div key={`${item.company}-${item.role}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{item.role}</h3>
                  <p className="text-sm opacity-70">{item.company}</p>
                </div>
                <p className="text-xs uppercase tracking-[0.22em] opacity-60">
                  {item.startDate} - {item.current ? 'Present' : item.endDate}
                </p>
              </div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 opacity-80">
                {item.highlights.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="border-b border-current/15 pb-2 font-display text-xl font-semibold">Projects</h2>
        <div className="mt-4 space-y-4">
          {resume.projects.map((item) => (
            <div key={item.name}>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="mt-2 text-sm opacity-80">{item.summary}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
);
