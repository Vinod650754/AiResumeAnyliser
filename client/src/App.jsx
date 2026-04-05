import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext.jsx';
import { AppShell } from './components/layout/AppShell.jsx';

const AuthPage = lazy(() =>
  import('./pages/AuthExperiencePage.jsx').then((module) => ({ default: module.AuthExperiencePage }))
);
const LandingPage = lazy(() =>
  import('./pages/LandingPage.jsx').then((module) => ({ default: module.LandingPage }))
);
const DashboardPage = lazy(() =>
  import('./pages/WorkspaceDashboardPage.jsx').then((module) => ({ default: module.WorkspaceDashboardPage }))
);
const AIImproverPage = lazy(() =>
  import('./pages/AIImproverPage.jsx').then((module) => ({ default: module.AIImproverPage }))
);
const ATSAnalyzerPage = lazy(() =>
  import('./pages/ATSAnalyzerPage.jsx').then((module) => ({ default: module.ATSAnalyzerPage }))
);
const JobsPage = lazy(() =>
  import('./pages/JobsPage.jsx').then((module) => ({ default: module.JobsPage }))
);
const InterviewPrepPage = lazy(() =>
  import('./pages/InterviewPrepWorkspacePage.jsx').then((module) => ({ default: module.InterviewPrepWorkspacePage }))
);
const ResumeBuilderPage = lazy(() =>
  import('./pages/ResumeStudioWorkspacePage.jsx').then((module) => ({ default: module.ResumeStudioWorkspacePage }))
);
const SharedResumePage = lazy(() =>
  import('./pages/SharedResumePage.jsx').then((module) => ({ default: module.SharedResumePage }))
);

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/auth" replace />;
};

const RouteLoader = () => (
  <div className="grid min-h-screen place-items-center px-4">
    <div className="glass-panel w-full max-w-md p-8 text-center">
      <p className="text-sm uppercase tracking-[0.28em] text-glow">Loading</p>
      <h1 className="mt-4 font-display text-3xl font-semibold">Staging your workspace</h1>
      <p className="mt-3 text-sm text-slate-400">Preparing dashboards, resume data, and AI insights.</p>
    </div>
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/share/:slug" element={<SharedResumePage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="builder/:resumeId?" element={<ResumeBuilderPage />} />
            <Route path="improver" element={<AIImproverPage />} />
            <Route path="ats" element={<ATSAnalyzerPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="interview" element={<InterviewPrepPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
