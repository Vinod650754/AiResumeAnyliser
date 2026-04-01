import slugify from 'slugify';
import { Resume } from '../models/Resume.js';
import { analyzeResumeAgainstJD } from '../services/atsService.js';
import { generateAISuggestions } from '../services/aiService.js';
import { generateResumePdfBuffer } from '../services/pdfService.js';
import { sendResumeEmail } from '../services/emailService.js';

const buildShareSlug = (title, fullName) =>
  `${slugify(`${fullName || 'resume'}-${title || 'untitled'}`, { lower: true, strict: true })}-${Date.now()}`;

export const getResumes = async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id }).sort({ updatedAt: -1 });
  res.json({ resumes });
};

export const getResumeById = async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

  if (!resume) {
    const error = new Error('Resume not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({ resume });
};

export const getSharedResume = async (req, res) => {
  const resume = await Resume.findOne({ shareSlug: req.params.slug }).select('-history');

  if (!resume) {
    const error = new Error('Shared resume not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({ resume });
};

export const saveResume = async (req, res) => {
  const payload = req.body;
  const atsAnalysis = analyzeResumeAgainstJD(payload, payload.jobDescription);
  const aiSuggestions = await generateAISuggestions({
    resume: payload,
    jobDescription: payload.jobDescription,
    atsAnalysis
  });

  const data = {
    ...payload,
    user: req.user._id,
    atsAnalysis: {
      ...atsAnalysis,
      suggestions: aiSuggestions.improvements,
      grammarNotes: aiSuggestions.grammarFixes
    }
  };

  if (aiSuggestions.rewrittenSummary) {
    data.summary = aiSuggestions.rewrittenSummary;
  }

  let resume;
  if (payload.id) {
    resume = await Resume.findOne({ _id: payload.id, user: req.user._id });
    if (!resume) {
      const error = new Error('Resume not found');
      error.statusCode = 404;
      throw error;
    }

    resume.set({
      ...data,
      history: [
        ...(resume.history || []),
        {
          versionLabel: `v${(resume.history?.length || 0) + 1}`,
          content: resume.toObject(),
          atsAnalysis: resume.atsAnalysis,
          savedAt: new Date()
        }
      ]
    });
  } else {
    resume = new Resume({
      ...data,
      shareSlug: buildShareSlug(payload.title, payload.personal?.fullName)
    });
  }

  await resume.save();

  const pdfBuffer = await generateResumePdfBuffer(data);
  const emailResult = await sendResumeEmail({
    to: [req.user.email, payload.personal?.email],
    name: req.user.name,
    pdfBuffer,
    resumeTitle: payload.title
  });

  res.json({
    message: 'Resume saved, PDF generated, and email dispatched',
    resume,
    pdfBase64: pdfBuffer.toString('base64'),
    email: emailResult
  });
};

export const deleteResume = async (req, res) => {
  const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!resume) {
    const error = new Error('Resume not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({ message: 'Resume deleted' });
};
