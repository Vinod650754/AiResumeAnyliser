import { useEffect, useState } from 'react';
import { api, withAuth } from '../lib/api.js';

export const useResumeWorkspace = (token, preferredResumeId) => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(preferredResumeId || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    api
      .get('/resumes', withAuth(token))
      .then((response) => {
        const resumeList = response.data.resumes || [];
        setResumes(resumeList);

        if (preferredResumeId) {
          setSelectedResumeId(preferredResumeId);
        } else if (resumeList.length) {
          setSelectedResumeId((current) => current || resumeList[0]._id);
        }
      })
      .finally(() => setLoading(false));
  }, [token, preferredResumeId]);

  const selectedResume =
    resumes.find((resume) => resume._id === selectedResumeId || resume.id === selectedResumeId) || resumes[0] || null;

  return {
    resumes,
    selectedResume,
    selectedResumeId,
    setSelectedResumeId,
    loading
  };
};

