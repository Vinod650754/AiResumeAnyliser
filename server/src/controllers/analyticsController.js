import dayjs from 'dayjs';
import { Resume } from '../models/Resume.js';

export const getDashboardAnalytics = async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id }).sort({ updatedAt: 1 });

  const scoreTrend = resumes.map((resume) => ({
    name: resume.title,
    score: resume.atsAnalysis?.score || 0
  }));

  const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
    const date = dayjs().subtract(6 - index, 'day').format('YYYY-MM-DD');
    const count = resumes.filter((resume) => dayjs(resume.updatedAt).format('YYYY-MM-DD') === date).length;
    return {
      date: dayjs(date).format('ddd'),
      saves: count
    };
  });

  res.json({
    totals: {
      resumes: resumes.length,
      averageScore: resumes.length
        ? Math.round(resumes.reduce((sum, item) => sum + (item.atsAnalysis?.score || 0), 0) / resumes.length)
        : 0,
      sharedLinks: resumes.filter((item) => item.shareSlug).length
    },
    scoreTrend,
    weeklyActivity
  });
};

