import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AvatarUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface AvatarValidationResult {
  isValid: boolean;
  error?: string;
}

export class AvatarService {
  private static readonly BUCKET_NAME = 'avatars';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private static readonly MAX_DIMENSION = 2048; // Max width/height in pixels

  /**
   * Validates an avatar file before upload
   */
  static validateFile(file: File): AvatarValidationResult {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size must be less than ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
      };
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'File must be a JPEG, PNG, WebP, or GIF image'
      };
    }

    return { isValid: true };
  }

  /**
   * Validates image dimensions
   */
  static async validateImageDimensions(file: File): Promise<AvatarValidationResult> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        
        if (img.width > this.MAX_DIMENSION || img.height > this.MAX_DIMENSION) {
          resolve({
            isValid: false,
            error: `Image dimensions must be ${this.MAX_DIMENSION}x${this.MAX_DIMENSION} pixels or smaller`
          });
        } else {
          resolve({ isValid: true });
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          isValid: false,
          error: 'Invalid image file'
        });
      };

      img.src = url;
    });
  }

  /**
   * Generates a unique filename for the avatar
   */
  private static generateFileName(userId: string, originalName: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `${userId}/avatar_${timestamp}.${extension}`;
  }

  /**
   * Uploads an avatar file to Supabase Storage
   */
  static async uploadAvatar(file: File, userId: string): Promise<AvatarUploadResult> {
    try {
      // Validate file
      const fileValidation = this.validateFile(file);
      if (!fileValidation.isValid) {
        return {
          success: false,
          error: fileValidation.error
        };
      }

      // Validate image dimensions
      const dimensionValidation = await this.validateImageDimensions(file);
      if (!dimensionValidation.isValid) {
        return {
          success: false,
          error: dimensionValidation.error
        };
      }

      // Generate unique filename
      const fileName = this.generateFileName(userId, file.name);

      // Delete existing avatar if it exists
      await this.deleteExistingAvatar(userId);

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return {
          success: false,
          error: 'Failed to upload avatar. Please try again.'
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      return {
        success: true,
        url: urlData.publicUrl
      };

    } catch (error) {
      console.error('Avatar upload error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during upload'
      };
    }
  }

  /**
   * Deletes existing avatar files for a user
   */
  private static async deleteExistingAvatar(userId: string): Promise<void> {
    try {
      // List all files in the user's folder
      const { data: files, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(userId);

      if (error || !files || files.length === 0) {
        return; // No existing files or error listing
      }

      // Delete all existing avatar files
      const filePaths = files.map(file => `${userId}/${file.name}`);
      await supabase.storage
        .from(this.BUCKET_NAME)
        .remove(filePaths);

    } catch (error) {
      console.error('Error deleting existing avatar:', error);
      // Don't throw error - this is cleanup, not critical
    }
  }

  /**
   * Deletes a specific avatar file
   */
  static async deleteAvatar(avatarUrl: string, userId: string): Promise<boolean> {
    try {
      // Extract filename from URL
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `avatars/${fileName}`;

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Avatar deletion error:', error);
      return false;
    }
  }

  /**
   * Gets the public URL for an avatar
   */
  static getAvatarUrl(fileName: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  }

  /**
   * Compresses an image file before upload
   */
  static async compressImage(file: File, maxWidth: number = 512, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (blob: Blob | null) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }
}