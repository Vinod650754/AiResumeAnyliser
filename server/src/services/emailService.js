import nodemailer from 'nodemailer';
import validator from 'validator';

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

export const sendResumeEmail = async ({ to, name, pdfBuffer, resumeTitle }) => {
  const transporter = getTransporter();

  if (!transporter) {
    return { skipped: true, reason: 'transporter_not_configured' };
  }

  const recipients = [...new Set((Array.isArray(to) ? to : [to]).filter((email) => email && validator.isEmail(email)))];

  if (!recipients.length) {
    return { skipped: true, reason: 'no_valid_recipient' };
  }

  const safeResumeTitle = resumeTitle?.trim() || 'resume';
  const hasAttachment = Buffer.isBuffer(pdfBuffer) && pdfBuffer.length > 0;

  if (!hasAttachment) {
    return { skipped: true, reason: 'pdf_attachment_required' };
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: recipients.join(', '),
    subject: `Your resume is ready: ${safeResumeTitle}`,
    html: `<p>Hi ${name},</p><p>Your latest resume PDF is attached and ready to use.</p>`,
    attachments: [
      {
        filename: `${safeResumeTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`,
        content: pdfBuffer
      }
    ]
  });

  return {
    skipped: false,
    attachedPdf: true,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response
  };
};
