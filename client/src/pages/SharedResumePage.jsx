import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ResumePreview } from '../components/builder/ResumePreview.jsx';
import { api } from '../lib/api.js';

export const SharedResumePage = () => {
  const { slug } = useParams();
  const [resume, setResume] = useState(null);

  useEffect(() => {
    api.get(`/resumes/shared/${slug}`).then((response) => setResume(response.data.resume));
  }, [slug]);

  if (!resume) {
    return <div className="grid min-h-screen place-items-center text-slate-400">Loading shared resume...</div>;
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <ResumePreview resume={resume} />
      </div>
    </div>
  );
};

