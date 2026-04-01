import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Save } from 'lucide-react';
import { defaultResume } from '../data/defaultResume.js';
import { useAuth } from '../context/AuthContext.jsx';
import { api, withAuth } from '../lib/api.js';
import { FormField } from '../components/ui/FormField.jsx';
import { SectionCard } from '../components/ui/SectionCard.jsx';
import { TemplateSelector } from '../components/builder/TemplateSelector.jsx';
import { PremiumResumePreview } from '../components/builder/PremiumResumePreview.jsx';

const downloadPdf = (base64, title) => {
  const link = document.createElement('a');
  link.href = `data:application/pdf;base64,${base64}`;
  link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  link.click();
};

export const ResumeStudioPage = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [resume, setResume] = useState(defaultResume);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!resumeId || !token) return;

    api.get(`/resumes/${resumeId}`, withAuth(token)).then((response) => {
      setResume({ ...response.data.resume, id: response.data.resume._id });
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

  const updateArrayField = (key, value, delimiter = ',') =>
    setResume((prev) => ({
      ...prev,
      [key]: value
        .split(delimiter)
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
      setResume((prev) => ({ ...prev, ...response.data.resume, id: response.data.resume._id }));
      downloadPdf(response.data.pdfBase64, resume.title);
      setMessage('Resume saved. PDF downloaded and email flow triggered.');
      if (!resume.id) {
        navigate(`/app/builder/${response.data.resume._id}`, { replace: true });
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
      <div className="space-y-6">
        <SectionCard
          title="Resume Studio"
          description="Edit core resume content and switch across premium templates with a live preview."
          actions={
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-black disabled:opacity-50"
            >
              {saving ? <Download size={18} className="animate-pulse" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Resume'}
            </button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Resume title" value={resume.title} onChange={(e) => setResume((prev) => ({ ...prev, title: e.target.value }))} />
            <FormField label="Role headline" value={resume.personal.role} onChange={(e) => updatePersonal('role', e.target.value)} />
            <FormField label="Full name" value={resume.personal.fullName} onChange={(e) => updatePersonal('fullName', e.target.value)} />
            <FormField label="Email" value={resume.personal.email} onChange={(e) => updatePersonal('email', e.target.value)} />
            <FormField label="Phone" value={resume.personal.phone} onChange={(e) => updatePersonal('phone', e.target.value)} />
            <FormField label="Location" value={resume.personal.location} onChange={(e) => updatePersonal('location', e.target.value)} />
          </div>
          <div className="mt-4">
            <FormField label="Professional summary" as="textarea" rows="6" value={resume.summary} onChange={(e) => setResume((prev) => ({ ...prev, summary: e.target.value }))} />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <FormField label="Skills" value={resume.skills.join(', ')} onChange={(e) => updateArrayField('skills', e.target.value)} />
            <FormField label="Strengths" value={resume.strengths.join(', ')} onChange={(e) => updateArrayField('strengths', e.target.value)} />
          </div>
          {message ? <p className="mt-4 text-sm text-cyan-200">{message}</p> : null}
        </SectionCard>

        <SectionCard title="Template Vault" description="Switch between 24 premium templates without leaving the builder.">
          <TemplateSelector activeTemplate={resume.template} onSelect={(templateId) => setResume((prev) => ({ ...prev, template: templateId }))} />
        </SectionCard>
      </div>

      <PremiumResumePreview resume={resume} />
    </div>
  );
};
