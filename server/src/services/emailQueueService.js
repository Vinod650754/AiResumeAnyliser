import { EmailQueue } from '../models/EmailQueue.js';
import { sendResumeEmail } from './emailService.js';

// Categorize errors for better retry strategy
const categorizeError = (error) => {
  if (!error) return 'unknown';
  
  const message = error.message?.toLowerCase() || '';
  const code = error.code?.toLowerCase() || '';
  
  if (message.includes('timeout') || code === 'etimedout' || code === 'econnaborted') {
    return 'timeout';
  }
  if (message.includes('rfused') || code === 'econnrefused') {
    return 'network';
  }
  if (message.includes('auth') || code === 'eauthmechanism') {
    return 'auth';
  }
  if (message.includes('dns') || code === 'enotfound') {
    return 'dns';
  }
  return 'other';
};

// Calculate next retry time based on error type and attempt count
const calculateNextRetry = (errorType, attempts) => {
  let baseDelay = 60000; // 1 minute
  
  switch (errorType) {
    case 'timeout':
    case 'network':
      // Network issues - longer delay, exponential backoff
      baseDelay = Math.min(300000 + attempts * 120000, 3600000); // 5min to 1hour
      break;
    case 'auth':
      // Auth issues - don't retry quickly
      baseDelay = 600000; // 10 minutes
      break;
    case 'dns':
      // DNS issues - medium retry
      baseDelay = 180000 + attempts * 60000; // 3min to longer
      break;
    default:
      // Other errors - standard backoff
      baseDelay = 60000 + attempts * 30000;
  }
  
  return new Date(Date.now() + baseDelay);
};

// Queue an email for delivery
export const queueEmail = async ({
  resumeId,
  userId,
  email,
  name,
  resumeTitle,
  pdfBuffer
}) => {
  try {
    const queueEntry = new EmailQueue({
      resumeId,
      userId,
      email,
      name,
      resumeTitle,
      pdfBuffer,
      status: 'pending',
      nextRetryAt: new Date()
    });
    
    await queueEntry.save();
    console.log(`✓ Email queued for delivery to ${email}`);
    return queueEntry;
  } catch (error) {
    console.error('Error queuing email:', error.message);
    throw error;
  }
};

// Process a single email from queue
export const processQueuedEmail = async (queueEntry) => {
  try {
    console.log(`Processing queued email (attempt ${queueEntry.attempts + 1}/${queueEntry.maxAttempts})`);
    
    // Update to processing
    queueEntry.status = 'processing';
    queueEntry.lastAttemptAt = new Date();
    await queueEntry.save();
    
    // Attempt to send
    const result = await sendResumeEmail({
      to: queueEntry.email,
      name: queueEntry.name,
      pdfBuffer: queueEntry.pdfBuffer,
      resumeTitle: queueEntry.resumeTitle
    });
    
    if (result.skipped) {
      console.error(`Email skipped: ${result.reason}`);
      queueEntry.status = 'failed';
      queueEntry.lastError = result.reason;
      queueEntry.metadata.errorType = 'configuration';
      
      // Don't retry configuration errors
      if (result.reason === 'transporter_not_configured') {
        queueEntry.status = 'failed_permanently';
        console.error('Transporter not configured - marking as permanent failure');
      }
    } else {
      // Success
      queueEntry.status = 'sent';
      queueEntry.sentAt = new Date();
      queueEntry.metadata.messageId = result.info?.messageId;
      queueEntry.metadata.accepted = result.accepted;
      queueEntry.metadata.rejected = result.rejected;
      console.log(`✓ Email sent successfully to ${queueEntry.email}`);
    }
    
    queueEntry.attempts += 1;
    await queueEntry.save();
    return queueEntry;
    
  } catch (error) {
    console.error(`Email send failed: ${error.message}`);
    
    queueEntry.attempts += 1;
    queueEntry.lastError = error.message;
    
    const errorType = categorizeError(error);
    queueEntry.metadata.errorType = errorType;
    queueEntry.metadata.errorCode = error.code;
    
    if (queueEntry.attempts >= queueEntry.maxAttempts) {
      console.error(`Max retry attempts (${queueEntry.maxAttempts}) reached for ${queueEntry.email}`);
      queueEntry.status = 'failed_permanently';
    } else {
      queueEntry.status = 'failed';
      queueEntry.nextRetryAt = calculateNextRetry(errorType, queueEntry.attempts);
      console.log(`Next retry at: ${queueEntry.nextRetryAt.toISOString()}`);
    }
    
    await queueEntry.save();
    return queueEntry;
  }
};

// Process all pending emails
export const processPendingEmails = async () => {
  try {
    const now = new Date();
    const pendingEmails = await EmailQueue.find({
      $or: [
        { status: 'pending', nextRetryAt: { $lte: now } },
        { status: 'failed', nextRetryAt: { $lte: now } }
      ]
    }).limit(5); // Process 5 at a time to avoid overload
    
    if (pendingEmails.length > 0) {
      console.log(`Processing ${pendingEmails.length} pending emails...`);
      
      for (const queueEntry of pendingEmails) {
        await processQueuedEmail(queueEntry);
      }
    }
    
    return pendingEmails;
  } catch (error) {
    console.error('Error processing pending emails:', error.message);
    throw error;
  }
};

// Get email delivery status
export const getEmailStatus = async (resumeId) => {
  try {
    const status = await EmailQueue.findOne({ resumeId }).sort({ createdAt: -1 });
    return status;
  } catch (error) {
    console.error('Error getting email status:', error.message);
    return null;
  }
};

// Start background email processor
export const startEmailProcessor = (intervalMs = 30000) => {
  console.log(`Starting email processor (every ${intervalMs}ms)`);
  
  const processEmails = async () => {
    try {
      await processPendingEmails();
    } catch (error) {
      console.error('Email processor error:', error.message);
    }
  };
  
  // Run immediately
  processEmails();
  
  // Run periodically
  const interval = setInterval(processEmails, intervalMs);
  
  return interval;
};
