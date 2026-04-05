import mongoose from 'mongoose';

const emailQueueSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    email: String,
    name: String,
    resumeTitle: String,
    pdfBuffer: Buffer,
    status: {
      type: String,
      enum: ['pending', 'processing', 'sent', 'failed', 'failed_permanently'],
      default: 'pending'
    },
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 15
    },
    lastError: String,
    lastAttemptAt: Date,
    sentAt: Date,
    nextRetryAt: Date,
    metadata: {
      messageId: String,
      accepted: [String],
      rejected: [String],
      errorCode: String,
      errorType: String // 'network', 'auth', 'timeout', 'other'
    }
  },
  { timestamps: true }
);

// Index for efficient queue processing
emailQueueSchema.index({ status: 1, nextRetryAt: 1 });
emailQueueSchema.index({ resumeId: 1 });
emailQueueSchema.index({ userId: 1 });

export const EmailQueue = mongoose.model('EmailQueue', emailQueueSchema);
