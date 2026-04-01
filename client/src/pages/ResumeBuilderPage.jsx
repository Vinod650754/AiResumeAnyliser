import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Save, Sparkles } from 'lucide-react';
import { defaultResume } from '../data/defaultResume.js';
import { useAuth } from '../context/AuthContext.jsx';
import { api, withAuth } from '../lib/api.js';
import { FormField } from '../components/ui/FormField.jsx';
import { ResumePreview } from '../components/builder/ResumePreview.jsx';
import { ATSInsights } from '../components/builder/ATSInsights.jsx';
import { SectionCard } from '../components/ui/SectionCard.jsx';

const downloadPdf = (base64, title) => {
  const link = document.createElement('a');
  link.href = `data:application/pdf;base64,${base64}`;
  link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  link.click();
};

export const ResumeBuilderPage = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [resume, setResume] = useState(defaultResume);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (!resumeId || !token) return;

    api.get(`/resumes/${resumeId}`, withAuth(token)).then((response) => {
      setResume({ ...response.data.resume, id: response.data.resume._id });
      setAnalysis(response.data.resume.atsAnalysis);
    });
  }, [resumeId, token]);

  const updatePersonal = (key, value) =>
    setResume((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [key]: value
      }
    }));

  const handleArrayTextChange = (key, value) =>
    setResume((prev) => ({
      ...prev,
      [key]: value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    }));

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await api.post(
        '/resumes/save',
        {
          ...resume,
          id: resume.id
        },
        withAuth(token)
      );

      setResume((prev) => ({ ...prev, id: response.data.resume._id, summary: response.data.resume.summary }));
      setAnalysis(response.data.resume.atsAnalysis);
      downloadPdf(response.data.pdfBase64, resume.title);
      setMessage('Saved successfully. PDF downloaded and emailed.');
      if (!resume.id) {
        navigate(`/builder/${response.data.resume._id}`, { replace: true });
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
      <div className="space-y-6">
        <SectionCard
          title="Resume Forge"
          description="Shape the narrative, align it to the role, and trigger PDF + email delivery in one flow."
          actions={
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-glow to-accent px-4 py-3 font-semibold text-slate-950 disabled:opacity-50"
            >
              {saving ? <Download size={18} className="animate-pulse" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Resume'}
            </button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Resume title" value={resume.title} onChange={(e) => setResume((prev) => ({ ...prev, title: e.target.value }))} />
            <FormField
              label="Template"
              as="select"
              value={resume.template}
              onChange={(e) => setResume((prev) => ({ ...prev, template: e.target.value }))}
            >
              <option value="nova">Nova</option>
              <option value="eclipse">Eclipse</option>
              <option value="aurora">Aurora</option>
            </FormField>
            <FormField label="Role headline" value={resume.personal.role} onChange={(e) => updatePersonal('role', e.target.value)} />
            <FormField label="Full name" value={resume.personal.fullName} onChange={(e) => updatePersonal('fullName', e.target.value)} />
            <FormField label="Email" value={resume.personal.email} onChange={(e) => updatePersonal('email', e.target.value)} />
            <FormField label="Phone" value={resume.personal.phone} onChange={(e) => updatePersonal('phone', e.target.value)} />
            <FormField label="Location" value={resume.personal.location} onChange={(e) => updatePersonal('location', e.target.value)} />
          </div>
          <div className="mt-4">
            <FormField label="Professional summary" as="textarea" rows="5" value={resume.summary} onChange={(e) => setResume((prev) => ({ ...prev, summary: e.target.value }))} />
          </div>
          <div className="mt-4">
            <FormField
              label="Skills"
              value={resume.skills.join(', ')}
              onChange={(e) => handleArrayTextChange('skills', e.target.value)}
              placeholder="React, Node.js, MongoDB"
            />
          </div>
          <div className="mt-4">
            <FormField
              label="Job description"
              as="textarea"
              rows="7"
              value={resume.jobDescription}
              onChange={(e) => setResume((prev) => ({ ...prev, jobDescription: e.target.value }))}
            />
          </div>
          {message ? <p className="mt-4 text-sm text-glow">{message}</p> : null}
        </SectionCard>

        <SectionCard
          title="Experience Signals"
          description="High-impact bullets with metrics drive ATS strength and recruiter confidence."
          actions={
            <div className="rounded-2xl border border-glow/20 bg-glow/10 px-3 py-2 text-xs uppercase tracking-[0.22em] text-glow">
              <Sparkles size={14} className="inline-block" /> AI tuned
            </div>
          }
        >
          <div className="space-y-4">
            {resume.experience.map((item, index) => (
              <motion.div key={`${item.company}-${index}`} layout className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Company"
                    value={item.company}
                    onChange={(e) =>
                      setResume((prev) => ({
                        ...prev,
                        experience: prev.experience.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, company: e.target.value } : entry
                        )
                      }))
                    }
                  />
                  <FormField
                    label="Role"
                    value={item.role}
                    onChange={(e) =>
                      setResume((prev) => ({
                        ...prev,
                        experience: prev.experience.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, role: e.target.value } : entry
                        )
                      }))
                    }
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    label="Highlights"
                    as="textarea"
                    rows="4"
                    value={item.highlights.join('\n')}
                    onChange={(e) =>
                      setResume((prev) => ({
                        ...prev,
                        experience: prev.experience.map((entry, entryIndex) =>
                          entryIndex === index
                            ? {
                                ...entry,
                                highlights: e.target.value
                                  .split('\n')
                                  .map((bullet) => bullet.trim())
                                  .filter(Boolean)
                              }
                            : entry
                        )
                      }))
                    }
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Projects And Credentials" description="Capture supporting proof points that strengthen recruiter confidence.">
          <div className="space-y-4">
            {resume.projects.map((project, index) => (
              <div key={`${project.name}-${index}`} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Project name"
                    value={project.name}
                    onChange={(e) =>
                      setResume((prev) => ({
                        ...prev,
                        projects: prev.projects.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, name: e.target.value } : entry
                        )
                      }))
                    }
                  />
                  <FormField
                    label="Project link"
                    value={project.link}
                    onChange={(e) =>
                      setResume((prev) => ({
                        ...prev,
                        projects: prev.projects.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, link: e.target.value } : entry
                        )
                      }))
                    }
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    label="Project summary"
                    as="textarea"
                    rows="4"
                    value={project.summary}
                    onChange={(e) =>
                      setResume((prev) => ({
                        ...prev,
                        projects: prev.projects.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, summary: e.target.value } : entry
                        )
                      }))
                    }
                  />
                </div>
              </div>
            ))}
            <FormField
              label="Certifications"
              value={resume.certifications.join(', ')}
              onChange={(e) => handleArrayTextChange('certifications', e.target.value)}
              placeholder="AWS Certified Developer, Scrum Master"
            />
          </div>
        </SectionCard>

        <ATSInsights analysis={analysis} />
      </div>

      <ResumePreview resume={resume} />
    </div>
  );
};
