import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, BriefcaseBusiness, FileSearch, Mic, Sparkles } from 'lucide-react';
import { BlurRevealText } from '../components/ui/BlurRevealText.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const features = [
  {
    title: 'AI resume improver',
    copy: 'Generate stronger summaries, sharper bullets, and role-specific rewrites with before-and-after comparison.'
  },
  {
    title: 'ATS and job matching',
    copy: 'Score against any job description, surface missing skills, and map your fit to realistic roles.'
  },
  {
    title: 'Interview prep engine',
    copy: 'Turn your resume into focused mock interview questions and coaching prompts in one click.'
  }
];

const testimonials = [
  '“The product feels like a premium operating system for job search.”',
  '“The ATS and interview workflows are finally in one place.”',
  '“Template switching and preview quality are far ahead of typical builders.”'
];

export const LandingPage = () => {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="relative overflow-hidden px-4 py-5 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <nav className="liquid-glass sticky top-4 z-20 flex items-center justify-between rounded-full px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-cyan-300/30 bg-cyan-300/10 p-2">
              <Sparkles size={18} className="text-cyan-200" />
            </div>
            <div>
              <p className="text-base font-medium text-white">Orbital Resume AI</p>
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Career intelligence platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="rounded-full px-4 py-2 text-sm text-white/70 transition hover:text-white">
              Sign in
            </Link>
            <Link
              to="/auth"
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15"
            >
              Start building
            </Link>
          </div>
        </nav>

        <section className="liquid-glass-strong relative min-h-[78vh] overflow-hidden rounded-[36px] px-6 py-8 md:px-10 md:py-10">
          <div className="hero-video-shell">
            <video
              className="hero-video opacity-55"
              autoPlay
              muted
              loop
              playsInline
              poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80"
            >
              <source
                src="https://cdn.coverr.co/videos/coverr-working-on-two-monitors-1561398059067?download=1080p"
                type="video/mp4"
              />
            </video>
          </div>
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="max-w-3xl pt-8 md:pt-14">
              <p className="mb-4 text-xs uppercase tracking-[0.42em] text-cyan-200/80">Resume intelligence for modern careers</p>
              <BlurRevealText
                text="Build the resume system that recruiters notice and AI filters cannot ignore."
                className="font-display text-5xl italic leading-[0.92] text-white md:text-7xl"
              />
              <p className="mt-6 max-w-2xl text-lg text-white/68">
                Premium AI resume building, ATS diagnostics, job matching, interview prep, cinematic templates, and polished export workflows in one platform.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
                >
                  Launch workspace
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-6 py-3 text-sm text-white/80 transition hover:bg-white/12 hover:text-white"
                >
                  Explore features
                </a>
              </div>
            </div>

            <div className="grid gap-4 self-end">
              {[
                { label: 'ATS coverage', value: '96', icon: FileSearch },
                { label: 'Role match signal', value: '18', icon: BriefcaseBusiness },
                { label: 'Interview prompts', value: '24', icon: Mic }
              ].map(({ label, value, icon: Icon }) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -4 }}
                  className="liquid-glass rounded-[30px] p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-white/38">{label}</p>
                      <p className="mt-3 font-display text-5xl italic text-white">{value}</p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 p-3">
                      <Icon size={20} className="text-cyan-200" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="liquid-glass rounded-[32px] p-6">
              <BadgeCheck size={20} className="text-cyan-200" />
              <h2 className="mt-4 font-display text-3xl italic text-white">{feature.title}</h2>
              <p className="mt-4 text-white/62">{feature.copy}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
          <div className="liquid-glass rounded-[36px] p-8">
            <p className="text-xs uppercase tracking-[0.32em] text-white/38">Why teams choose it</p>
            <h2 className="mt-4 font-display text-5xl italic text-white">Built with the feel of a premium AI product, not a template marketplace.</h2>
            <p className="mt-4 max-w-xl text-white/62">
              Liquid glass surfaces, cinematic motion, deeply structured resume data, and AI workflows designed for actual hiring outcomes.
            </p>
          </div>
          <div className="grid gap-4">
            {testimonials.map((quote) => (
              <div key={quote} className="liquid-glass rounded-[30px] p-6 text-lg text-white/72">
                {quote}
              </div>
            ))}
          </div>
        </section>

        <footer className="liquid-glass mb-6 rounded-[34px] px-8 py-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-white/40">Ready to upgrade your job search</p>
              <h2 className="mt-3 font-display text-4xl italic text-white">Step into your AI-powered resume workspace.</h2>
            </div>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black"
            >
              Get started
              <ArrowRight size={16} />
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};
