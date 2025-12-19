import Queue from 'bull';
import config from '../config/index.js';
import { mediaService } from '../services/media.js';

// Create media processing queue
const mediaQueue = new Queue('media-processing', config.redis.url, {
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

// Process image optimization jobs
mediaQueue.process('optimize-image', async (job) => {
  const { filepath, options } = job.data;
  console.log(`Processing image: ${filepath}`);

  // This would handle background image optimization
  // For now, images are processed synchronously during upload
  return { success: true, filepath };
});

// Process video transcoding jobs
mediaQueue.process('transcode-video', async (job) => {
  const { filepath, options } = job.data;
  console.log(`Transcoding video: ${filepath}`);

  // Video transcoding would be handled here
  // This is a placeholder for more complex video processing
  return { success: true, filepath };
});

// Generate thumbnail job
mediaQueue.process('generate-thumbnail', async (job) => {
  const { filepath, options } = job.data;
  console.log(`Generating thumbnail: ${filepath}`);

  // Thumbnail generation logic
  return { success: true, filepath };
});

// Queue event handlers
mediaQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

mediaQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

mediaQueue.on('error', (err) => {
  console.error('Queue error:', err);
});

// Helper functions to add jobs
export const addImageOptimizationJob = async (filepath, options = {}) => {
  return mediaQueue.add('optimize-image', { filepath, options });
};

export const addVideoTranscodingJob = async (filepath, options = {}) => {
  return mediaQueue.add('transcode-video', { filepath, options });
};

export const addThumbnailGenerationJob = async (filepath, options = {}) => {
  return mediaQueue.add('generate-thumbnail', { filepath, options });
};

// Get queue stats
export const getQueueStats = async () => {
  const [waiting, active, completed, failed] = await Promise.all([
    mediaQueue.getWaitingCount(),
    mediaQueue.getActiveCount(),
    mediaQueue.getCompletedCount(),
    mediaQueue.getFailedCount(),
  ]);

  return { waiting, active, completed, failed };
};

// Clean up old jobs
export const cleanupJobs = async () => {
  await mediaQueue.clean(24 * 60 * 60 * 1000, 'completed'); // 24 hours
  await mediaQueue.clean(7 * 24 * 60 * 60 * 1000, 'failed'); // 7 days
};

export default mediaQueue;
