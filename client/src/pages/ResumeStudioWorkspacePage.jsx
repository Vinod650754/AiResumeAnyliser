import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, FileDown, LoaderCircle, Mail, Save, TriangleAlert } from 'lucide-react';
import { defaultResume } from '../data/defaultResume.js';
import { useAuth } from '../context/AuthContext.jsx';
import { api, withAuth } from '../lib/api.js';
import { buildResumePdfBlob, blobToBase64, downloadResumePdfBlob } from '../lib/resumePdf.js';
import { FormField } from '../components/ui/FormField.jsx';
import { SectionCard } from '../components/ui/SectionCard.jsx';
import { TemplateSelector } from '../components/builder/TemplateSelector.jsx';
import { PremiumResumePreview } from '../components/builder/PremiumResumePreview.jsx';

const initialStages = [
  { key: 'save', label: 'Save', status: 'idle', message: 'Ready to save your resume' },
  { key: 'pdf', label: 'PDF', status: 'idle', message: 'Preview PDF will be generated from the editor' },
  { key: 'email', label: 'Email', status: 'idle', message: 'Email delivery will run after save completes' }
];

const stageStyles = {
  idle: 'border-white/10 bg-white/[0.04] text-white/72',
  pending: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100',
  success: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
  warning: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
  error: 'border-rose-300/20 bg-rose-300/10 text-rose-100'
};

const StageIcon = ({ status }) => {
  if (status === 'pending') {
    return <LoaderCircle size={16} className="animate-spin" />;
  }

  if (status === 'success') {
    return <CheckCircle2 size={16} />;
  }

  if (status === 'warning' || status === 'error') {
    return <TriangleAlert size={16} />;
  }

  return <div className="h-2.5 w-2.5 rounded-full bg-current/70" />;
};

const buildStageList = ({ saveStage, pdfStage, emailStage }) => [saveStage, pdfStage, emailStage];

export const ResumeStudioWorkspacePage = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [resume, setResume] = useState(defaultResume);
  const [saving, setSaving] = useState(false);
  const [statusText, setStatusText] = useState('Everything you edit appears in the live preview instantly.');
  const [stages, setStages] = useState(initialStages);
  const previewRef = useRef(null);

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
    setStatusText('Generating a PDF from the live preview, then saving and emailing it.');
    setStages(
      buildStageList({
        saveStage: { key: 'save', label: 'Save', status: 'pending', message: 'Saving resume data to your workspace' },
        pdfStage: { key: 'pdf', label: 'PDF', status: 'pending', message: 'Rendering the current preview into a PDF' },
        emailStage: { key: 'email', label: 'Email', status: 'idle', message: 'Waiting for the save step to complete' }
      })
    );

    let pdfBundle = null;
    let clientPdfBase64 = null;
    let localPdfPrepared = false;

    try {
      try {
        pdfBundle = await buildResumePdfBlob(previewRef.current, resume);

        if (pdfBundle?.blob) {
          clientPdfBase64 = await blobToBase64(pdfBundle.blob);
          localPdfPrepared = true;
          setStages(
            buildStageList({
              saveStage: { key: 'save', label: 'Save', status: 'pending', message: 'Saving resume data to your workspace' },
              pdfStage: { key: 'pdf', label: 'PDF', status: 'success', message: 'Live preview PDF is ready for download and email' },
              emailStage: { key: 'email', label: 'Email', status: 'pending', message: 'Preparing secure delivery on the server' }
            })
          );
        }
      } catch {
        setStages(
          buildStageList({
            saveStage: { key: 'save', label: 'Save', status: 'pending', message: 'Saving resume data to your workspace' },
            pdfStage: { key: 'pdf', label: 'PDF', status: 'error', message: 'Live preview PDF could not be prepared, so email delivery was stopped' },
            emailStage: { key: 'email', label: 'Email', status: 'idle', message: 'Email requires a valid attached resume PDF' }
          })
        );
        throw new Error('Unable to generate the resume PDF from the live preview');
      }

      const response = await api.post(
        '/resumes/save',
        {
          ...resume,
          id: resume.id,
          clientPdfBase64
        },
        withAuth(token)
      );

      const savedResume = { ...response.data.resume, id: response.data.resume._id };
      const delivery = response.data.delivery || {};

      setResume((prev) => ({ ...prev, ...savedResume }));

      if (pdfBundle?.blob) {
        downloadResumePdfBlob(pdfBundle.blob, pdfBundle.filename);
      }

      setStages(
        buildStageList({
          saveStage: { key: 'save', label: 'Save', status: 'success', message: response.data.message || 'Resume saved successfully' },
          pdfStage: {
            key: 'pdf',
            label: 'PDF',
            status: delivery.pdf?.status === 'failed' ? 'warning' : 'success',
            message:
              delivery.pdf?.message ||
              (localPdfPrepared ? 'PDF prepared from the live preview' : 'PDF generated successfully')
          },
          emailStage: {
            key: 'email',
            label: 'Email',
            status:
              delivery.email?.status === 'sent'
                ? 'success'
                : delivery.email?.status === 'skipped'
                  ? 'warning'
                  : delivery.email?.status === 'failed'
                    ? 'error'
                    : 'idle',
            message: delivery.email?.message || 'Email delivery did not return a status'
          }
        })
      );

      setStatusText('Save complete. Your download is ready and the delivery result is shown below.');

      if (!resume.id) {
        navigate(`/app/builder/${response.data.resume._id}`, { replace: true });
      }
    } catch (error) {
      setStatusText(error.response?.data?.message || 'Failed to save resume');
      setStages(
        buildStageList({
          saveStage: {
            key: 'save',
            label: 'Save',
            status: 'error',
            message: error.response?.data?.message || 'Resume could not be saved'
          },
          pdfStage: {
            key: 'pdf',
            label: 'PDF',
            status: localPdfPrepared ? 'success' : 'error',
            message: localPdfPrepared ? 'Live preview PDF was prepared locally' : 'PDF generation must succeed before save and email can continue'
          },
          emailStage: {
            key: 'email',
            label: 'Email',
            status: 'idle',
            message: 'Email was not attempted because the save step did not finish'
          }
        })
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(360px,0.8fr),minmax(460px,1.2fr)]">
      <div className="space-y-5 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto xl:pr-2">
        <section className="liquid-glass-strong rounded-[32px] p-6 md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.32em] text-cyan-100/70">Resume Studio</p>
              <h1 className="mt-3 font-display text-5xl italic text-white">Edit left, preview right.</h1>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                This layout keeps the builder compact, keeps the preview visible, and reports save, PDF, and email delivery as separate steps.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:scale-[0.99] disabled:opacity-50"
            >
              {saving ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Resume'}
            </button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {stages.map((stage) => (
              <div key={stage.key} className={`rounded-[24px] border p-4 ${stageStyles[stage.status]}`}>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <StageIcon status={stage.status} />
                  {stage.label}
                </div>
                <p className="mt-3 text-sm leading-6">{stage.message}</p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-sm text-white/70">{statusText}</p>
        </section>

        <SectionCard title="Identity" description="Keep the essentials compact so the live document remains the main focus.">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Resume title" value={resume.title} onChange={(e) => setResume((prev) => ({ ...prev, title: e.target.value }))} />
            <FormField label="Role headline" value={resume.personal.role} onChange={(e) => updatePersonal('role', e.target.value)} />
            <FormField label="Full name" value={resume.personal.fullName} onChange={(e) => updatePersonal('fullName', e.target.value)} />
            <FormField label="Email" value={resume.personal.email} onChange={(e) => updatePersonal('email', e.target.value)} />
            <FormField label="Phone" value={resume.personal.phone} onChange={(e) => updatePersonal('phone', e.target.value)} />
            <FormField label="Location" value={resume.personal.location} onChange={(e) => updatePersonal('location', e.target.value)} />
          </div>
        </SectionCard>

        <SectionCard title="Story" description="Refine the summary and signal words without letting the editor become visually heavy.">
          <div className="space-y-4">
            <FormField
              label="Professional summary"
              as="textarea"
              rows="6"
              value={resume.summary}
              onChange={(e) => setResume((prev) => ({ ...prev, summary: e.target.value }))}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Skills" value={resume.skills.join(', ')} onChange={(e) => updateArrayField('skills', e.target.value)} />
              <FormField label="Strengths" value={resume.strengths.join(', ')} onChange={(e) => updateArrayField('strengths', e.target.value)} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Template Vault" description="Switch styles without leaving the page or losing the live composition on the right.">
          <TemplateSelector activeTemplate={resume.template} onSelect={(templateId) => setResume((prev) => ({ ...prev, template: templateId }))} />
        </SectionCard>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <div className="mb-3 flex items-center justify-between rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <FileDown size={16} />
            <span>Live preview</span>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <Mail size={16} />
            <span>Email-ready PDF</span>
          </div>
        </div>
        <PremiumResumePreview ref={previewRef} resume={resume} />
      </div>
    </div>
  );
};
