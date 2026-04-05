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

  for (let attempt = 1; attempt <= 3; attempt++) {
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
        message: 'Email sent with PDF attachment',
        attempts: attempt
      };
      return delivery;
    } catch (emailError) {
      console.log(`Email delivery attempt ${attempt}/3 failed:`, emailError.message);
      if (attempt === 3) {
        delivery.email = {
          status: 'failed',
          attachedPdf: true,
          message: `Email failed after 3 attempts: ${emailError.message}`
        };
        return delivery;
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  return delivery;
};

export const deliverResumeAsync = async ({ resume, user, payload, clientPdfBase64 }) => {
  // Send email in background with persistent retry until success
  const startDelivery = async () => {
    let retryCount = 0;
    const maxRetries = 10;
    const baseDelay = 5000; // 5 seconds

    while (retryCount < maxRetries) {
      try {
        let pdfBuffer = decodeClientPdf(clientPdfBase64);

        if (!pdfBuffer) {
          try {
            pdfBuffer = await generateResumePdfBuffer(resume.toObject());
          } catch (pdfError) {
            console.error('Failed to generate PDF:', pdfError.message);
            return;
          }
        }

        const result = await sendResumeEmail({
          to: [user.email, payload.personal?.email],
          name: user.name,
          pdfBuffer,
          resumeTitle: payload.title
        });

        if (!result.skipped) {
          console.log(`✓ Email successfully sent for resume "${payload.title}" (attempt ${retryCount + 1}/${maxRetries})`);
          return;
        }

        console.log(`Email skipped: ${result.reason}`);
        return;
      } catch (error) {
        retryCount++;
        console.log(`Email delivery attempt ${retryCount}/${maxRetries} failed: ${error.message}`);

        if (retryCount < maxRetries) {
          const delayMs = baseDelay * retryCount;
          console.log(`Retrying in ${delayMs / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    console.error(`✗ Email delivery failed after ${maxRetries} attempts for resume "${payload.title}"`);
  };

  // Fire and forget - run in background
  setImmediate(() => startDelivery());
};
