import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    company: String,
    role: String,
    location: String,
    startDate: String,
    endDate: String,
    current: Boolean,
    highlights: [String]
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    school: String,
    degree: String,
    field: String,
    startDate: String,
    endDate: String,
    score: String
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: String,
    summary: String,
    link: String,
    highlights: [String]
  },
  { _id: false }
);

const resumeVersionSchema = new mongoose.Schema(
  {
    versionLabel: String,
    content: mongoose.Schema.Types.Mixed,
    atsAnalysis: mongoose.Schema.Types.Mixed,
    savedAt: Date
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    template: {
      type: String,
      default: 'nova'
    },
    summary: String,
    personal: {
      fullName: String,
      role: String,
      email: String,
      phone: String,
      location: String,
      website: String,
      linkedin: String,
      github: String
    },
    skills: [String],
    experience: [experienceSchema],
    education: [educationSchema],
    projects: [projectSchema],
    certifications: [String],
    languages: [String],
    strengths: [String],
    jobDescription: String,
    aiGeneratedContent: {
      improvedSummary: String,
      tailoredHighlights: [String],
      jobMatchNarrative: String
    },
    atsAnalysis: {
      score: Number,
      keywordCoverage: Number,
      missingSkills: [String],
      matchedKeywords: [String],
      suggestions: [String],
      grammarNotes: [String]
    },
    jobMatches: [
      {
        title: String,
        company: String,
        matchScore: Number,
        reason: String,
        missingSkills: [String]
      }
    ],
    interviewPrep: {
      roleFocus: String,
      technicalQuestions: [String],
      behavioralQuestions: [String],
      projectQuestions: [String],
      answers: mongoose.Schema.Types.Mixed,
      coachingTips: [String]
    },
    shareSlug: {
      type: String,
      unique: true
    },
    history: [resumeVersionSchema],
    latestPdfUrl: String
  },
  { timestamps: true }
);

export const Resume = mongoose.model('Resume', resumeSchema);
