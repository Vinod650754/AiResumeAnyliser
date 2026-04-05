import slugify from 'slugify';
import { Resume } from '../models/Resume.js';
import { deliverResumeWithAttachment } from '../services/resumeDeliveryService.js';

const buildShareSlug = (title, fullName) =>
  `${slugify(`${fullName || 'resume'}-${title || 'untitled'}`, { lower: true, strict: true })}-${Date.now()}`;

const buildResumePayload = (payload, userId) => ({
  user: userId,
  title: payload.title,
  template: payload.template || 'nova',
  summary: payload.summary || '',
  personal: payload.personal,
  skills: payload.skills || [],
  experience: payload.experience || [],
  education: payload.education || [],
  projects: payload.projects || [],
  certifications: payload.certifications || [],
  languages: payload.languages || [],
  strengths: payload.strengths || [],
  jobDescription: payload.jobDescription || '',
  atsAnalysis: payload.atsAnalysis || undefined,
  jobMatches: payload.jobMatches || [],
  interviewPrep: payload.interviewPrep || undefined
});

const buildSkippedDelivery = () => ({
  pdf: {
    status: 'skipped',
    source: null,
    message: 'Delivery skipped for an internal workspace update'
  },
  email: {
    status: 'skipped',
    attachedPdf: false,
    message: 'Email skipped for an internal workspace update'
  }
});

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
  try {
    const payload = req.body;

    if (!payload?.title?.trim()) {
      const error = new Error('Resume title is required');
      error.statusCode = 400;
      throw error;
    }

    if (!payload?.personal?.fullName?.trim()) {
      const error = new Error('Full name is required');
      error.statusCode = 400;
      throw error;
    }

    const data = buildResumePayload(payload, req.user._id);

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

    const savedResume = await resume.save();
    
    // Deliver asynchronously to avoid blocking save
    deliverResumeWithAttachment({
      resume: savedResume,
      user: req.user,
      payload,
      clientPdfBase64: payload.clientPdfBase64
    }).catch((error) => {
      console.error('Delivery failed:', error.message);
    });

    res.status(200).json({
      success: true,
      message: 'Resume saved successfully',
      resume: savedResume,
      delivery: { status: 'processing', message: 'Email and PDF delivery in progress' }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
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
