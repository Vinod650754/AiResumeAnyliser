import { generateResumePdfBuffer } from './pdfService.js';
import { sendResumeEmail } from './emailService.js';

export const decodeClientPdf = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const normalized = value.includes(',') ? value.split(',').pop() : value;

  try {
    const buffer = Buffer.from(normalized, 'base64');
    return buffer.length ? buffer : null;
  } catch {
    return null;
  }
};

const createPendingDelivery = () => ({
  pdf: {
    status: 'pending',
    source: null,
    message: 'Preparing PDF'
  },
  email: {
    status: 'pending',
    attachedPdf: false,
    message: 'Preparing email'
  }
});

export const deliverResumeWithAttachment = async ({ resume, user, payload, clientPdfBase64 }) => {
  let pdfBuffer = decodeClientPdf(clientPdfBase64);
  const delivery = createPendingDelivery();

  if (pdfBuffer) {
    delivery.pdf = {
      status: 'generated',
      source: 'client',
      message: 'PDF prepared from the live preview'
    };
  } else {
    try {
      pdfBuffer = await generateResumePdfBuffer(resume.toObject());
      delivery.pdf = {
        status: 'generated',
        source: 'server',
        message: 'PDF generated on the server'
      };
    } catch (pdfError) {
      delivery.pdf = {
        status: 'failed',
        source: 'server',
        message: pdfError.message
      };
      delivery.email = {
        status: 'failed',
        attachedPdf: false,
        message: 'Email was not sent because the resume PDF could not be prepared'
      };
      return delivery;
    }
  }

  try {
    const result = await sendResumeEmail({
      to: [user.email, payload.personal?.email],
      name: user.name,
      pdfBuffer,
      resumeTitle: payload.title
    });

    if (result.skipped) {
      delivery.email = {
        status: 'failed',
        attachedPdf: false,
        message: result.reason
      };
      return delivery;
    }

    delivery.email = {
      status: 'sent',
      attachedPdf: true,
      message: 'Email sent with PDF attachment'
    };
  } catch (emailError) {
    delivery.email = {
      status: 'failed',
      attachedPdf: true,
      message: emailError.message
    };
  }

  return delivery;
};
