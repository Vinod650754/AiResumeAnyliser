import html2pdf from 'html2pdf.js';

const createFilename = (resume) => {
  const username = (resume.personal?.fullName || resume.title || 'user')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return `resume-${username || 'user'}.pdf`;
};

const createWorker = (element, resume) =>
  html2pdf()
    .set({
      margin: 0.35,
      filename: createFilename(resume),
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    })
    .from(element)
    .toPdf();

export const buildResumePdfBlob = async (element, resume) => {
  if (!element) {
    return null;
  }

  const worker = createWorker(element, resume);
  const pdf = await worker.get('pdf');

  return {
    blob: pdf.output('blob'),
    filename: createFilename(resume)
  };
};

export const downloadResumePdfBlob = (blob, filename) => {
  if (!blob) {
    return;
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Failed to encode PDF'));
    reader.readAsDataURL(blob);
  });
