import htmlToPdf from 'html-pdf-node';

const buildResumeHtml = (resume) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; color: #111827; }
      h1, h2 { margin-bottom: 8px; }
      .section { margin-top: 24px; }
      .muted { color: #4b5563; }
      ul { padding-left: 20px; }
    </style>
  </head>
  <body>
    <h1>${resume.personal?.fullName || resume.title}</h1>
    <p class="muted">${resume.personal?.role || ''} | ${resume.personal?.email || ''} | ${resume.personal?.phone || ''}</p>
    <div class="section">
      <h2>Summary</h2>
      <p>${resume.summary || ''}</p>
    </div>
    <div class="section">
      <h2>Skills</h2>
      <p>${(resume.skills || []).join(', ')}</p>
    </div>
    <div class="section">
      <h2>Experience</h2>
      ${(resume.experience || [])
        .map(
          (item) => `
            <div>
              <strong>${item.role || ''} - ${item.company || ''}</strong>
              <div class="muted">${item.startDate || ''} - ${item.current ? 'Present' : item.endDate || ''}</div>
              <ul>${(item.highlights || []).map((bullet) => `<li>${bullet}</li>`).join('')}</ul>
            </div>
          `
        )
        .join('')}
    </div>
    <div class="section">
      <h2>Projects</h2>
      ${(resume.projects || [])
        .map(
          (item) => `
            <div>
              <strong>${item.name || ''}</strong>
              <p>${item.summary || ''}</p>
              <ul>${(item.highlights || []).map((bullet) => `<li>${bullet}</li>`).join('')}</ul>
            </div>
          `
        )
        .join('')}
    </div>
  </body>
</html>
`;

export const generateResumePdfBuffer = async (resume) => {
  const file = { content: buildResumeHtml(resume) };
  const options = {
    format: 'A4',
    printBackground: true
  };

  return htmlToPdf.generatePdf(file, options);
};

