import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, CartesianGrid, LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Plus, ArrowUpRight } from 'lucide-react';
import { SectionCard } from '../components/ui/SectionCard.jsx';
import { MetricCard } from '../components/dashboard/MetricCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, withAuth } from '../lib/api.js';

export const DashboardPage = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    if (!token) return;

    Promise.all([
      api.get('/analytics/dashboard', withAuth(token)),
      api.get('/resumes', withAuth(token))
    ]).then(([analyticsResponse, resumesResponse]) => {
      setAnalytics(analyticsResponse.data);
      setResumes(resumesResponse.data.resumes);
    });
  }, [token]);

  return (
    <div className="space-y-6">
      <SectionCard
        title="Mission Control"
        description="Track resume quality, delivery readiness, and optimization momentum."
        actions={
          <Link
            to="/builder"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-glow to-accent px-4 py-3 font-semibold text-slate-950"
          >
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
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <SectionCard title="ATS Trend" description="Compare your resume performance trajectory.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.scoreTrend || []}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#5eead4" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Weekly Saves" description="Measure execution consistency across the week.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.weeklyActivity || []}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="saves" fill="#60a5fa" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Resume Fleet" description="Open drafts, review scores, and publish recruiter-safe links.">
        <div className="space-y-3">
          {resumes.map((resume) => (
            <div
              key={resume._id}
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold text-white">{resume.title}</p>
                <p className="text-sm text-slate-400">ATS {resume.atsAnalysis?.score || 0} | Template {resume.template}</p>
              </div>
              <div className="flex gap-3">
                <a
                  href={`/share/${resume.shareSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
                >
                  Share
                </a>
                <Link
                  to={`/builder/${resume._id}`}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15"
                >
                  Open
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          ))}
          {!resumes.length ? <p className="text-sm text-slate-400">No resumes yet. Create your first builder flow.</p> : null}
        </div>
      </SectionCard>
    </div>
  );
};
