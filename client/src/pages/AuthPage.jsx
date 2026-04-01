import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FormField } from '../components/ui/FormField.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(formData, mode);
      navigate('/');
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
        className="glass-panel relative w-full max-w-md p-8"
      >
        <p className="text-sm uppercase tracking-[0.3em] text-glow">Orbital Access</p>
        <h1 className="mt-4 font-display text-4xl font-bold">Build resumes that pass the machine and impress the human.</h1>
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
            placeholder="••••••••"
          />
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-glow to-accent px-4 py-3 font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setMode((prev) => (prev === 'login' ? 'register' : 'login'))}
          className="mt-5 text-sm text-slate-400 transition hover:text-white"
        >
          {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}
        </button>
      </motion.div>
    </div>
  );
};

