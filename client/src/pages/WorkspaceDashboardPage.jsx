import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, CartesianGrid, LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Plus, ArrowUpRight, Mic, Sparkles, Target, BriefcaseBusiness, FileText } from 'lucide-react';
import { SectionCard } from '../components/ui/SectionCard.jsx';
import { MetricCard } from '../components/dashboard/MetricCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, withAuth } from '../lib/api.js';

export const WorkspaceDashboardPage = () => {
  const { token, user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    if (!token) return;

    Promise.all([api.get('/analytics/dashboard', withAuth(token)), api.get('/resumes', withAuth(token))]).then(
      ([analyticsResponse, resumesResponse]) => {
        setAnalytics(analyticsResponse.data);
        setResumes(resumesResponse.data.resumes);
      }
    );
  }, [token]);

  return (
    <div className="space-y-6">
      <SectionCard
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Builder'}`}
        description="Track ATS momentum, jump into workspace flows, and keep job matching and interview prep tied to each resume."
        actions={
          <Link to="/app/builder" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-black">
            <Plus size={18} />
            New Resume
          </Link>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Resumes" value={analytics?.totals.resumes || 0} hint="Versioned and shareable" />
          <MetricCard label="Average ATS" value={analytics?.totals.averageScore || 0} hint="Live optimization score" />
          <MetricCard label="Shared Links" value={analytics?.totals.sharedLinks || 0} hint="Published for recruiters" />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <MetricCard label="ATS Ready" value={analytics?.totals.atsReady || 0} hint="Saved benchmark analyses" />
          <MetricCard label="Jobs Ready" value={analytics?.totals.jobMatchesReady || 0} hint="Stored AI role matches" />
          <MetricCard label="Interview Ready" value={analytics?.totals.interviewReady || 0} hint="Prep kits generated" />
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-5">
        {[
          { icon: FileText, title: 'Resume Builder', copy: 'Maintain the master resume that powers the rest of the workspace.', to: '/app/builder' },
          { icon: Target, title: 'ATS Analyzer', copy: 'Compare role skills and target requirements against the selected resume.', to: '/app/ats' },
          { icon: Sparkles, title: 'AI Improver', copy: 'Polish summary, highlights, and recruiter-facing language without mixing in ATS logic.', to: '/app/improver' },
          { icon: BriefcaseBusiness, title: 'Job Matching', copy: 'Search roles, compare fit, and keep AI match suggestions on the resume record.', to: '/app/jobs' },
          { icon: Mic, title: 'Interview Prep', copy: 'Generate role-focused questions and store AI evaluation with the active resume.', to: '/app/interview' }
        ].map(({ icon: Icon, title, copy, to }) => (
          <Link key={title} to={to} className="liquid-glass rounded-[30px] p-6 transition hover:bg-white/[0.06]">
            <Icon className="text-cyan-200" />
            <h2 className="mt-4 font-display text-3xl italic text-white">{title}</h2>
            <p className="mt-3 text-white/60">{copy}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <SectionCard title="ATS Trend" description="Compare your resume performance trajectory.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.scoreTrend || []}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#67e8f9" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Weekly Saves" description="Measure execution consistency across the week.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.weeklyActivity || []}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="saves" fill="#38bdf8" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Resume Fleet" description="Open drafts, review ATS strength, and see which resumes already have job and interview intelligence attached.">
        <div className="space-y-3">
          {resumes.map((resume) => (
            <div
              key={resume._id}
              className="flex flex-col gap-4 rounded-[30px] border border-white/10 bg-white/[0.03] p-5 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold text-white">{resume.title}</p>
                <p className="text-sm text-white/55">ATS {resume.atsAnalysis?.score || 0} | Template {resume.template}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs ${resume.atsAnalysis?.score ? 'bg-cyan-300/10 text-cyan-100' : 'bg-white/5 text-white/55'}`}>
                    ATS {resume.atsAnalysis?.score ? 'Ready' : 'Pending'}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs ${(resume.jobMatches || []).length ? 'bg-emerald-400/10 text-emerald-200' : 'bg-white/5 text-white/55'}`}>
                    Jobs {(resume.jobMatches || []).length ? 'Ready' : 'Pending'}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs ${resume.interviewPrep?.roleFocus ? 'bg-amber-400/10 text-amber-100' : 'bg-white/5 text-white/55'}`}>
                    Interview {resume.interviewPrep?.roleFocus ? 'Ready' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`/share/${resume.shareSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
                >
                  Share
                </a>
                <Link
                  to="/app/ats"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
                >
                  ATS
                </Link>
                <Link
                  to={`/app/builder/${resume._id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15"
                >
                  Open
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          ))}
          {!resumes.length ? <p className="text-sm text-white/55">No resumes yet. Create your first builder flow.</p> : null}
        </div>
      </SectionCard>
    </div>
  );
};
