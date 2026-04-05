import { LogOut, Sparkles, FileText, LayoutDashboard, Wand2, BriefcaseBusiness, Mic, Target } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';

const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/builder', label: 'Builder', icon: FileText },
  { to: '/app/improver', label: 'AI Improver', icon: Wand2 },
  { to: '/app/ats', label: 'ATS Analyzer', icon: Target },
  { to: '/app/jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { to: '/app/interview', label: 'Interview Prep', icon: Mic }
];

export const AppShell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.name || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1540px] gap-5 lg:grid-cols-[92px,1fr]">
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          className="liquid-glass grid-bg flex flex-col justify-between rounded-[30px] p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]"
        >
          <div className="space-y-8">
            <Link to="/app" className="flex items-center gap-3 lg:justify-center" title="Dashboard home">
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100 shadow-neon">
                <Sparkles size={22} />
              </div>
              <div className="lg:hidden">
                <p className="font-display text-xl font-semibold">Orbital Resume AI</p>
                <p className="text-sm text-white/42">Premium career command center</p>
              </div>
            </Link>

            <nav className="space-y-3">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/app'}
                  title={label}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 transition lg:justify-center lg:px-0 ${
                      isActive ? 'bg-white/12 text-white shadow-[0_12px_40px_rgba(15,23,42,0.32)]' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span className="lg:hidden">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/5 p-3 lg:flex-col lg:justify-center">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-sm font-semibold text-white">
                {initials}
              </div>
              <div className="lg:hidden">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-white/45">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/auth');
              }}
              title="Sign out"
              aria-label="Sign out"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-slate-300 transition hover:bg-white/5 hover:text-white lg:px-0"
            >
              <LogOut size={18} />
              <span className="lg:hidden">Sign out</span>
            </button>
          </div>
        </motion.aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
