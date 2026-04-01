import { forwardRef } from 'react';
import { getTemplateById } from '../../data/templateRegistry.js';

const layoutStyles = {
  split: 'grid gap-8 lg:grid-cols-[0.78fr,1.22fr]',
  stacked: 'space-y-6',
  hero: 'space-y-6'
};

export const PremiumResumePreview = forwardRef(({ resume }, ref) => {
  const template = getTemplateById(resume.template);

  return (
    <div className="liquid-glass scrollbar-thin max-h-[calc(100vh-8rem)] overflow-y-auto rounded-[34px] p-5 md:p-8">
      <div ref={ref} className={`${template.surface} ${template.text} rounded-[28px] p-8 shadow-2xl`}>
        <div className={layoutStyles[template.layout]}>
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.32em]" style={{ color: template.accent }}>
                {template.name}
              </p>
              <h1 className="mt-3 font-display text-5xl italic">{resume.personal.fullName}</h1>
              <p className="mt-3 text-lg opacity-80">{resume.personal.role}</p>
              <p className="mt-3 text-sm opacity-65">
                {resume.personal.email} | {resume.personal.phone} | {resume.personal.location}
              </p>
            </div>

            <section>
              <h2 className="border-b border-current/15 pb-2 font-display text-2xl italic">Summary</h2>
              <p className="mt-3 text-sm leading-7 opacity-80">{resume.summary}</p>
            </section>

            <section>
              <h2 className="border-b border-current/15 pb-2 font-display text-2xl italic">Skills</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {resume.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold dark:bg-white/10">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="border-b border-current/15 pb-2 font-display text-2xl italic">Experience</h2>
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
              <h2 className="border-b border-current/15 pb-2 font-display text-2xl italic">Projects</h2>
              <div className="mt-4 space-y-4">
                {resume.projects.map((item) => (
                  <div key={item.name}>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="mt-2 text-sm opacity-80">{item.summary}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div>
                <h2 className="border-b border-current/15 pb-2 font-display text-2xl italic">Certifications</h2>
                <ul className="mt-3 space-y-2 text-sm opacity-80">
                  {resume.certifications?.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="border-b border-current/15 pb-2 font-display text-2xl italic">Strengths</h2>
                <ul className="mt-3 space-y-2 text-sm opacity-80">
                  {resume.strengths?.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
});
