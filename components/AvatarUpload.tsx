'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { AvatarService, AvatarUploadResult } from '../lib/avatarService';
import { AvatarWithFallback } from '@/components/ui/AvatarWithFallback';
// Using project's custom styling instead of external UI components
import * as LucideIcons from 'lucide-react';
const { Upload, X, AlertCircle, CheckCircle, Pencil } = LucideIcons;

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string;
  /** Display name or email for fallback initials */
  displayName?: string;
  onUploadSuccess?: (avatarUrl: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

export default function AvatarUpload({
  userId,
  currentAvatarUrl,
  displayName,
  onUploadSuccess,
  onUploadError,
  className = '',
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const editInputRef = React.useRef<HTMLInputElement>(null);

  // Sync previewUrl with currentAvatarUrl when it changes externally
  useEffect(() => {
    setPreviewUrl(currentAvatarUrl || null);
  }, [currentAvatarUrl]);

  // Using static methods from AvatarService

  const handleFileUpload = async (file: File | null) => {
    if (!file) {
      return;
    }

    setError(null);
    setSuccess(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      logger.debug('AvatarUpload', 'Starting upload', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        userId,
      });

      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file
      const result: AvatarUploadResult = await AvatarService.uploadAvatar(file, userId);

      clearInterval(progressInterval);
      setUploadProgress(100);

      logger.debug('AvatarUpload', 'Upload successful', { url: result.url });

      if (result.success && result.url) {
        setSuccess('Avatar uploaded successfully!');
        onUploadSuccess?.(result.url);

        // Clean up old preview
        if (preview !== currentAvatarUrl) {
          URL.revokeObjectURL(preview);
        }
        setPreviewUrl(result.url);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      console.error('[AvatarUpload] Upload error:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        userId,
      });

      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onUploadError?.(errorMessage);

      // Reset preview on error
      setPreviewUrl(currentAvatarUrl || null);
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
        setSuccess(null);
      }, 3000);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      await handleFileUpload(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, currentAvatarUrl, onUploadSuccess, onUploadError]
  );

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    await handleFileUpload(file || null);
    // Reset input so same file can be selected again
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handleEditCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    await handleFileUpload(file || null);
    // Reset input so same file can be selected again
    if (editInputRef.current) {
      editInputRef.current.value = '';
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: uploading,
  });

  const removeAvatar = async () => {
    if (!currentAvatarUrl) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await AvatarService.deleteAvatar(currentAvatarUrl, userId);
      if (result) {
        setPreviewUrl(null);
        setSuccess('Avatar removed successfully!');
        onUploadSuccess?.('');
      } else {
        throw new Error('Failed to remove avatar');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove avatar';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  return (
    <div className={`space-y-sm ${className}`}>
      {/* Avatar Preview */}
      <div className="flex justify-center">
        <div className="relative">
          {/* Clickable avatar for editing */}
          <button
            type="button"
            onClick={() => editInputRef.current?.click()}
            disabled={uploading}
            className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-zinc-600 cursor-pointer hover:opacity-80 transition-opacity disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={previewUrl ? 'Change profile picture' : 'Add profile picture'}
          >
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Avatar preview"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <AvatarWithFallback
                src={null}
                alt={displayName || 'User'}
                fallback={(displayName || '?')[0].toUpperCase()}
                size={128}
              />
            )}
          </button>

          {/* Hidden input for edit/change avatar */}
          <input
            ref={editInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleEditCapture}
            className="hidden"
            disabled={uploading}
          />

          {/* Edit button overlay */}
          {!uploading && (
            <button
              type="button"
              className="absolute bottom-0 right-0 rounded-full w-9 h-9 p-0 bg-primary hover:bg-primary/90 text-white transition-colors flex items-center justify-center shadow-lg"
              onClick={() => editInputRef.current?.click()}
              aria-label="Edit profile picture"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}

          {/* Remove button */}
          {previewUrl && !uploading && (
            <button
              type="button"
              className="absolute -top-xs -right-xs rounded-full w-8 h-8 p-0 bg-error hover:bg-error/90 text-white transition-colors flex items-center justify-center"
              onClick={removeAvatar}
              aria-label="Remove profile picture"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-xs">
          <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#1F5D4C] to-[#2E7D32] h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-small font-body text-center text-gray-600 dark:text-zinc-300">
            {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
          </p>
        </div>
      )}

      {/* Upload Options */}
      <div className="grid grid-cols-1 gap-xs">
        {/* Take Photo Button (Mobile Camera) */}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          <LucideIcons.Camera className="w-5 h-5" />
          <span>Take Photo</span>
        </button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleCameraCapture}
          className="hidden"
          disabled={uploading}
        />

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-md text-center cursor-pointer transition-colors relative z-10
            ${isDragActive && !isDragReject ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''}
            ${isDragReject ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''}
            ${!isDragActive && !isDragReject ? 'border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500' : ''}
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />

          <Upload className="w-8 h-8 mx-auto mb-xs text-gray-400 dark:text-zinc-500" />

          {isDragActive ? (
            isDragReject ? (
              <p className="text-red-600">Invalid file type</p>
            ) : (
              <p className="text-blue-600">Drop the image here...</p>
            )
          ) : (
            <div>
              <p className="text-gray-600 dark:text-zinc-300 mb-xs">
                Drag & drop an image here, or click to select
              </p>
              <p className="text-small font-body text-gray-500 dark:text-zinc-400">
                Supports: JPEG, PNG, WebP (max 5MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-xs p-sm bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-small font-body">{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center space-x-xs p-sm bg-green-50 border border-green-200 rounded-lg text-green-800">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-small font-body">{success}</span>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="text-caption font-body text-gray-500 dark:text-zinc-400 space-y-xs">
        <p>• Images will be automatically resized to 400x400 pixels</p>
        <p>• Supported formats: JPEG, PNG, WebP</p>
        <p>• Maximum file size: 5MB</p>
        <p>• Images are compressed for optimal performance</p>
      </div>
    </div>
  );
}
