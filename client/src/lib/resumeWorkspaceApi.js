import { api, withAuth } from './api.js';

const mergeResumePayload = (resume, patch = {}) => ({
  ...resume,
  ...patch,
  personal: {
    ...(resume.personal || {}),
    ...(patch.personal || {})
  },
  id: resume.id || resume._id,
  skipDelivery: true
});

export const persistResumeWorkspace = async ({ token, resume, patch }) => {
  const response = await api.post('/resumes/save', mergeResumePayload(resume, patch), withAuth(token));
  return {
    response,
    resume: { ...response.data.resume, id: response.data.resume._id }
  };
};
