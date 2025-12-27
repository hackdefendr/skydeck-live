import sharp from 'sharp';
import { createWriteStream, promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/index.js';
import { authService } from './auth.js';
import { blueskyService } from './bluesky.js';

class MediaService {
  constructor() {
    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    this.allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    this.maxImageSize = 1000000; // 1MB for Bluesky (after compression)
    this.maxImageUploadSize = 10000000; // 10MB max upload (before compression)
    this.maxVideoSize = 50000000; // 50MB
  }

  // Ensure upload directory exists
  async ensureUploadDir() {
    try {
      await fs.mkdir(config.upload.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
  }

  // Process and upload image to Bluesky
  async uploadImage(user, file) {
    console.log(`[MediaService] uploadImage: Starting, original size: ${file.size} bytes (${(file.size / 1024 / 1024).toFixed(2)} MB), type: ${file.mimetype}`);

    if (!this.allowedImageTypes.includes(file.mimetype)) {
      return { success: false, error: 'Invalid image type' };
    }

    try {
      // Process image with sharp
      let processedBuffer = file.buffer;
      let mimeType = file.mimetype;

      // Convert to JPEG if needed and optimize
      if (file.mimetype !== 'image/gif') {
        const image = sharp(file.buffer);
        const metadata = await image.metadata();
        console.log(`[MediaService] Image metadata: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

        // Resize if too large
        if (metadata.width > 2000 || metadata.height > 2000) {
          console.log(`[MediaService] Resizing image from ${metadata.width}x${metadata.height} to fit within 2000x2000`);
          image.resize(2000, 2000, { fit: 'inside', withoutEnlargement: true });
        }

        // Convert to JPEG for better compression (unless PNG with transparency)
        if (file.mimetype !== 'image/png' || !metadata.hasAlpha) {
          processedBuffer = await image.jpeg({ quality: 85 }).toBuffer();
          mimeType = 'image/jpeg';
          console.log(`[MediaService] Converted to JPEG (q85), size: ${processedBuffer.length} bytes (${(processedBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
        } else {
          processedBuffer = await image.png({ compressionLevel: 9 }).toBuffer();
          console.log(`[MediaService] Compressed PNG, size: ${processedBuffer.length} bytes (${(processedBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
        }
      } else {
        console.log(`[MediaService] GIF detected, skipping compression. Size: ${processedBuffer.length} bytes`);
      }

      // Check size after processing - need to get under 1MB for Bluesky
      if (processedBuffer.length > this.maxImageSize) {
        console.log(`[MediaService] Still over 1MB (${processedBuffer.length} bytes), applying aggressive compression...`);

        // Progressive compression for JPEG
        if (mimeType === 'image/jpeg') {
          let quality = 70;
          while (processedBuffer.length > this.maxImageSize && quality >= 20) {
            console.log(`[MediaService] Trying JPEG quality ${quality}...`);
            processedBuffer = await sharp(file.buffer)
              .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality })
              .toBuffer();
            console.log(`[MediaService] Result: ${processedBuffer.length} bytes (${(processedBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
            quality -= 10;
          }
        }

        // If still too large, resize more aggressively
        if (processedBuffer.length > this.maxImageSize) {
          console.log(`[MediaService] Still too large, resizing to 1500x1500...`);
          processedBuffer = await sharp(file.buffer)
            .resize(1500, 1500, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 60 })
            .toBuffer();
          console.log(`[MediaService] After resize: ${processedBuffer.length} bytes (${(processedBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
        }

        if (processedBuffer.length > this.maxImageSize) {
          console.log(`[MediaService] Still too large, resizing to 1000x1000...`);
          processedBuffer = await sharp(file.buffer)
            .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 50 })
            .toBuffer();
          console.log(`[MediaService] After resize: ${processedBuffer.length} bytes (${(processedBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
        }
      }

      console.log(`[MediaService] Final image size: ${processedBuffer.length} bytes (${(processedBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

      // Upload to Bluesky
      const agent = await authService.getBlueskyAgent(user);
      const result = await blueskyService.uploadBlob(agent, processedBuffer, mimeType);

      if (!result.success) {
        return result;
      }

      return {
        success: true,
        blob: result.blob,
        mimeType,
        size: processedBuffer.length,
      };
    } catch (error) {
      console.error('Image upload error:', error);
      return { success: false, error: error.message };
    }
  }

  // Upload video to Bluesky
  async uploadVideo(user, file) {
    console.log(`[MediaService] uploadVideo: Starting, size: ${file.size} bytes (${(file.size / 1024 / 1024).toFixed(2)} MB), type: ${file.mimetype}`);

    if (!this.allowedVideoTypes.includes(file.mimetype)) {
      return { success: false, error: 'Invalid video type' };
    }

    if (file.size > this.maxVideoSize) {
      return { success: false, error: 'Video too large (max 50MB)' };
    }

    try {
      const agent = await authService.getBlueskyAgent(user);
      console.log(`[MediaService] uploadVideo: Calling uploadVideo API...`);

      // Videos need to use the video upload API, not uploadBlob
      // Bluesky uses a different endpoint for video uploads
      const result = await blueskyService.uploadVideo(agent, file.buffer, file.mimetype, user.did);

      if (!result.success) {
        console.error(`[MediaService] uploadVideo: Failed - ${result.error}`);
        return result;
      }

      console.log(`[MediaService] uploadVideo: Success!`);
      return {
        success: true,
        blob: result.blob,
        mimeType: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      console.error('[MediaService] Video upload error:', error);
      return { success: false, error: error.message };
    }
  }

  // Save file locally (for temporary storage)
  async saveLocally(file) {
    await this.ensureUploadDir();

    const ext = path.extname(file.originalname) || this.getExtension(file.mimetype);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(config.upload.uploadDir, filename);

    await fs.writeFile(filepath, file.buffer);

    return {
      filename,
      filepath,
      url: `/uploads/${filename}`,
    };
  }

  // Delete local file
  async deleteLocal(filename) {
    try {
      const filepath = path.join(config.upload.uploadDir, filename);
      await fs.unlink(filepath);
      return { success: true };
    } catch (error) {
      console.error('Delete file error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get image dimensions
  async getImageDimensions(buffer) {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
      };
    } catch (error) {
      return null;
    }
  }

  // Create image embed for post
  async createImageEmbed(user, images) {
    const uploadedImages = [];

    for (const image of images) {
      const result = await this.uploadImage(user, image);
      if (!result.success) {
        return { success: false, error: result.error };
      }

      const dimensions = await this.getImageDimensions(image.buffer);

      uploadedImages.push({
        alt: image.alt || '',
        image: result.blob,
        aspectRatio: dimensions ? {
          width: dimensions.width,
          height: dimensions.height,
        } : undefined,
      });
    }

    return {
      success: true,
      embed: {
        $type: 'app.bsky.embed.images',
        images: uploadedImages,
      },
    };
  }

  // Create video embed for post
  async createVideoEmbed(user, video) {
    const result = await this.uploadVideo(user, video);
    if (!result.success) {
      return result;
    }

    return {
      success: true,
      embed: {
        $type: 'app.bsky.embed.video',
        video: result.blob,
        alt: video.alt || '',
      },
    };
  }

  // Create external embed (link card)
  async createExternalEmbed(url, title, description, thumbBlob) {
    return {
      $type: 'app.bsky.embed.external',
      external: {
        uri: url,
        title: title || url,
        description: description || '',
        thumb: thumbBlob,
      },
    };
  }

  // Get file extension from mime type
  getExtension(mimeType) {
    const extensions = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'video/quicktime': '.mov',
    };
    return extensions[mimeType] || '';
  }

  // Validate file
  validateFile(file, type = 'image') {
    const allowedTypes = type === 'image' ? this.allowedImageTypes : this.allowedVideoTypes;
    const maxSize = type === 'image' ? this.maxImageUploadSize : this.maxVideoSize;

    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: `Invalid ${type} type` };
    }

    if (file.size > maxSize) {
      return { valid: false, error: `File too large (max ${Math.round(maxSize / 1000000)}MB)` };
    }

    return { valid: true };
  }
}

export const mediaService = new MediaService();
export default mediaService;
