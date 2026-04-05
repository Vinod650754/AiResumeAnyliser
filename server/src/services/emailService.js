import nodemailer from 'nodemailer';
import validator from 'validator';

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    },
    connectionTimeout: 60000,
    socketTimeout: 60000,
    greetingTimeout: 30000,
    pool: {
      maxConnections: 1,
      maxMessages: 100,
      rateDelta: 100,
      rateLimit: 3
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    logger: true,
    debug: true
  });
};

const sendEmailWithRetry = async (transporter, mailOptions, maxRetries = 5, delay = 3000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting email send ${attempt}/${maxRetries} to:`, mailOptions.to);
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected
      });
      return { success: true, info };
    } catch (error) {
      console.error(`Email send attempt ${attempt}/${maxRetries} failed:`, error.message, error.code);
      if (attempt === maxRetries) {
        throw error;
      }
      const backoffDelay = delay * attempt; // Exponential backoff
      console.log(`Retrying in ${backoffDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
};

export const sendResumeEmail = async ({ to, name, pdfBuffer, resumeTitle }) => {
  console.log('Email service called with:', {
    to: to,
    name: name,
    hasPdfBuffer: !!pdfBuffer,
    pdfBufferSize: pdfBuffer?.length || 0,
    resumeTitle: resumeTitle
  });

  const transporter = getTransporter();

  if (!transporter) {
    console.error('Email transporter not configured. Check EMAIL_USER and EMAIL_APP_PASSWORD env vars');
    return { skipped: true, reason: 'transporter_not_configured' };
  }

  console.log('Email transporter configured successfully');

  const recipients = [...new Set((Array.isArray(to) ? to : [to]).filter((email) => email && validator.isEmail(email)))];

  if (!recipients.length) {
    console.error('No valid recipients found');
    return { skipped: true, reason: 'no_valid_recipient' };
  }

  console.log('Valid recipients:', recipients);

  const safeResumeTitle = resumeTitle?.trim() || 'resume';
  const hasAttachment = Buffer.isBuffer(pdfBuffer) && pdfBuffer.length > 0;

  if (!hasAttachment) {
    return { skipped: true, reason: 'pdf_attachment_required' };
  }

  const mailOptions = {
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
  };

  const result = await sendEmailWithRetry(transporter, mailOptions);

  return {
    skipped: false,
    attachedPdf: true,
    accepted: result.info.accepted,
    rejected: result.info.rejected,
    response: result.info.response
  };
};
