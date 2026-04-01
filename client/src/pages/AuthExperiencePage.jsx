import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { FormField } from '../components/ui/FormField.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const AuthExperiencePage = () => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/app', { replace: true });
    }
  }, [navigate, token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(formData, mode);
      navigate('/app');
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center overflow-hidden px-4">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="liquid-glass-strong relative w-full max-w-md rounded-[34px] p-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Orbital Access</p>
            <h1 className="mt-4 font-display text-5xl italic text-white">Enter the career cockpit.</h1>
          </div>
          <Sparkles className="text-cyan-200" />
        </div>
        <p className="mt-4 text-white/60">Sign in to generate ATS analysis, AI rewrites, job matching, and interview prep.</p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <FormField
              label="Full name"
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Your name"
            />
          ) : null}
          <FormField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="you@example.com"
          />
          <FormField
            label="Password"
            type="password"
            value={formData.password}
            onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="********"
          />
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white px-4 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setMode((prev) => (prev === 'login' ? 'register' : 'login'))}
          className="mt-5 text-sm text-white/55 transition hover:text-white"
        >
          {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}
        </button>
        <Link to="/" className="mt-3 block text-sm text-white/40 transition hover:text-white/70">
          Back to landing page
        </Link>
      </motion.div>
    </div>
  );
};
