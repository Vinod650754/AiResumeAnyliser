import { forwardRef } from 'react';
import { getTemplateById } from '../../data/templateRegistry.js';

const toRgba = (hex, alpha) => {
  const normalized = hex.replace('#', '');
  const safe = normalized.length === 3 ? normalized.split('').map((char) => `${char}${char}`).join('') : normalized;
  const value = Number.parseInt(safe, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const createTheme = (template) => {
  const darkSurface = ['eclipse', 'zenith', 'forge', 'kernel'].includes(template.id);
  const surface = darkSurface ? '#07111f' : '#ffffff';
  const foreground = darkSurface ? '#f8fafc' : '#0f172a';

  return {
    surface,
    foreground,
    muted: darkSurface ? 'rgba(226,232,240,0.74)' : 'rgba(15,23,42,0.68)',
    border: toRgba(template.accent, darkSurface ? 0.32 : 0.2),
    panel: darkSurface ? toRgba(template.accent, 0.12) : toRgba(template.accent, 0.08),
    softPanel: darkSurface ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.035)'
  };
};

const SectionHeading = ({ children, theme }) => (
  <h2 className="pb-2 font-display text-2xl italic" style={{ borderBottom: `1px solid ${theme.border}` }}>
    {children}
  </h2>
);

const SkillPills = ({ resume, theme }) => (
  <div className="mt-3 flex flex-wrap gap-2">
    {resume.skills.map((skill) => (
      <span key={skill} className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: theme.panel }}>
        {skill}
      </span>
    ))}
  </div>
);

const ExperienceSection = ({ resume, theme }) => (
  <section>
    <SectionHeading theme={theme}>Experience</SectionHeading>
    <div className="mt-4 space-y-4">
      {resume.experience.map((item) => (
        <div key={`${item.company}-${item.role}`} className="rounded-[22px] p-4" style={{ background: theme.softPanel }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold">{item.role}</h3>
              <p className="text-sm" style={{ color: theme.muted }}>
                {item.company}
              </p>
            </div>
            <p className="text-xs uppercase tracking-[0.22em]" style={{ color: theme.muted }}>
              {item.startDate} - {item.current ? 'Present' : item.endDate}
            </p>
          </div>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6" style={{ color: theme.muted }}>
            {item.highlights.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </section>
);

const ProjectsSection = ({ resume, theme }) => (
  <section>
    <SectionHeading theme={theme}>Projects</SectionHeading>
    <div className="mt-4 space-y-4">
      {resume.projects.map((item) => (
        <div key={item.name} className="rounded-[22px] p-4" style={{ background: theme.softPanel }}>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="mt-2 text-sm leading-7" style={{ color: theme.muted }}>
            {item.summary}
          </p>
        </div>
      ))}
    </div>
  </section>
);

const SummarySection = ({ resume, theme }) => (
  <section>
    <SectionHeading theme={theme}>Summary</SectionHeading>
    <p className="mt-3 text-sm leading-7" style={{ color: theme.muted }}>
      {resume.summary}
    </p>
  </section>
);

const CredentialsSection = ({ resume, theme }) => (
  <section className="grid gap-4 md:grid-cols-2">
    <div className="rounded-[22px] p-4" style={{ background: theme.softPanel }}>
      <SectionHeading theme={theme}>Certifications</SectionHeading>
      <ul className="mt-3 space-y-2 text-sm" style={{ color: theme.muted }}>
        {resume.certifications?.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
    <div className="rounded-[22px] p-4" style={{ background: theme.softPanel }}>
      <SectionHeading theme={theme}>Strengths</SectionHeading>
      <ul className="mt-3 space-y-2 text-sm" style={{ color: theme.muted }}>
        {resume.strengths?.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  </section>
);

const SplitTemplate = ({ resume, template, theme, forwardedRef }) => (
  <div
    ref={forwardedRef}
    className="grid overflow-hidden rounded-[28px] shadow-2xl lg:grid-cols-[0.38fr,0.62fr]"
    style={{ background: theme.surface, color: theme.foreground }}
  >
    <aside
      className="space-y-6 p-8"
      style={{ background: `linear-gradient(180deg, ${toRgba(template.accent, 0.28)} 0%, ${toRgba(template.accent, 0.08)} 100%)` }}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.32em]" style={{ color: template.accent }}>
          {template.name}
        </p>
        <h1 className="mt-3 font-display text-5xl italic">{resume.personal.fullName}</h1>
        <p className="mt-3 text-lg" style={{ color: theme.muted }}>
          {resume.personal.role}
        </p>
      </div>
      <div className="space-y-2 text-sm" style={{ color: theme.muted }}>
        <p>{resume.personal.email}</p>
        <p>{resume.personal.phone}</p>
        <p>{resume.personal.location}</p>
        <p>{resume.personal.linkedin}</p>
        <p>{resume.personal.github}</p>
      </div>
      <SummarySection resume={resume} theme={theme} />
      <section>
        <SectionHeading theme={theme}>Skills</SectionHeading>
        <SkillPills resume={resume} theme={theme} />
      </section>
    </aside>
    <div className="space-y-6 p-8">
      <ExperienceSection resume={resume} theme={theme} />
      <ProjectsSection resume={resume} theme={theme} />
      <CredentialsSection resume={resume} theme={theme} />
    </div>
  </div>
);

const StackedTemplate = ({ resume, template, theme, forwardedRef }) => (
  <div ref={forwardedRef} className="overflow-hidden rounded-[28px] shadow-2xl" style={{ background: theme.surface, color: theme.foreground }}>
    <header className="p-8" style={{ background: `linear-gradient(135deg, ${toRgba(template.accent, 0.2)} 0%, ${theme.surface} 65%)` }}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.32em]" style={{ color: template.accent }}>
            {template.name}
          </p>
          <h1 className="mt-3 font-display text-5xl italic">{resume.personal.fullName}</h1>
          <p className="mt-3 text-lg" style={{ color: theme.muted }}>
            {resume.personal.role}
          </p>
        </div>
        <div className="text-right text-sm" style={{ color: theme.muted }}>
          <p>{resume.personal.email}</p>
          <p>{resume.personal.phone}</p>
          <p>{resume.personal.location}</p>
        </div>
      </div>
    </header>
    <div className="space-y-6 p-8">
      <SummarySection resume={resume} theme={theme} />
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] p-5" style={{ background: theme.softPanel }}>
          <SectionHeading theme={theme}>Skills</SectionHeading>
          <SkillPills resume={resume} theme={theme} />
        </div>
        <div className="rounded-[24px] p-5" style={{ background: theme.softPanel }}>
          <SectionHeading theme={theme}>Highlights</SectionHeading>
          <ul className="mt-3 space-y-2 text-sm" style={{ color: theme.muted }}>
            {resume.strengths?.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </section>
      <ExperienceSection resume={resume} theme={theme} />
      <ProjectsSection resume={resume} theme={theme} />
      <CredentialsSection resume={resume} theme={theme} />
    </div>
  </div>
);

const HeroTemplate = ({ resume, template, theme, forwardedRef }) => (
  <div ref={forwardedRef} className="overflow-hidden rounded-[28px] shadow-2xl" style={{ background: theme.surface, color: theme.foreground }}>
    <section className="p-8" style={{ background: `radial-gradient(circle at top left, ${toRgba(template.accent, 0.28)} 0%, ${theme.surface} 56%)` }}>
      <p className="text-xs uppercase tracking-[0.32em]" style={{ color: template.accent }}>
        {template.name}
      </p>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div>
          <h1 className="font-display text-6xl italic">{resume.personal.fullName}</h1>
          <p className="mt-4 text-xl" style={{ color: theme.muted }}>
            {resume.personal.role}
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-7" style={{ color: theme.muted }}>
            {resume.summary}
          </p>
        </div>
        <div className="rounded-[24px] p-5" style={{ background: theme.panel }}>
          <p className="text-xs uppercase tracking-[0.28em]" style={{ color: template.accent }}>
            Contact
          </p>
          <div className="mt-4 space-y-2 text-sm" style={{ color: theme.muted }}>
            <p>{resume.personal.email}</p>
            <p>{resume.personal.phone}</p>
            <p>{resume.personal.location}</p>
            <p>{resume.personal.linkedin}</p>
            <p>{resume.personal.github}</p>
          </div>
          <div className="mt-5">
            <p className="text-xs uppercase tracking-[0.28em]" style={{ color: template.accent }}>
              Skills
            </p>
            <SkillPills resume={resume} theme={theme} />
          </div>
        </div>
      </div>
    </section>
    <div className="grid gap-6 p-8 lg:grid-cols-[1fr,1fr]">
      <ExperienceSection resume={resume} theme={theme} />
      <div className="space-y-6">
        <ProjectsSection resume={resume} theme={theme} />
        <CredentialsSection resume={resume} theme={theme} />
      </div>
    </div>
  </div>
);

export const PremiumResumePreview = forwardRef(({ resume }, ref) => {
  const template = getTemplateById(resume.template);
  const theme = createTheme(template);

  return (
    <div className="liquid-glass scrollbar-thin max-h-[calc(100vh-8rem)] overflow-y-auto rounded-[34px] p-5 md:p-8">
      {template.layout === 'split' ? <SplitTemplate resume={resume} template={template} theme={theme} forwardedRef={ref} /> : null}
      {template.layout === 'stacked' ? <StackedTemplate resume={resume} template={template} theme={theme} forwardedRef={ref} /> : null}
      {template.layout === 'hero' ? <HeroTemplate resume={resume} template={template} theme={theme} forwardedRef={ref} /> : null}
    </div>
  );
});
