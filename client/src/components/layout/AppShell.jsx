import { LogOut, Sparkles, FileText, LayoutDashboard, Wand2, BriefcaseBusiness, Mic } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';

const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/builder', label: 'Builder', icon: FileText },
  { to: '/app/improver', label: 'AI Improver', icon: Wand2 },
  { to: '/app/jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { to: '/app/interview', label: 'Interview Prep', icon: Mic }
];

export const AppShell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[280px,1fr]">
        <motion.aside initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} className="liquid-glass grid-bg flex flex-col justify-between rounded-[34px] p-6">
          <div className="space-y-8">
            <Link to="/app" className="flex items-center gap-3">
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
                <Sparkles size={22} />
              </div>
              <div>
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
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                      isActive ? 'bg-white/12 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-white/45">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/auth');
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-3 text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </motion.aside>

        <main className="overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
