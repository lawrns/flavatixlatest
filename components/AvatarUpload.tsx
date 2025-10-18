'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { AvatarService, AvatarUploadResult } from '../lib/avatarService';
// Using project's custom styling instead of external UI components
import * as LucideIcons from 'lucide-react';
const { Upload, X, User, AlertCircle, CheckCircle } = LucideIcons;

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string;
  onUploadSuccess?: (avatarUrl: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

export default function AvatarUpload({
  userId,
  currentAvatarUrl,
  onUploadSuccess,
  onUploadError,
  className = ''
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Using static methods from AvatarService

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
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
  }, [userId, currentAvatarUrl, onUploadSuccess, onUploadError]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: uploading
  });

  const removeAvatar = async () => {
    if (!currentAvatarUrl) return;

    setUploading(true);
    setError(null);

    try {
      const result = await AvatarService.deleteAvatar(userId, currentAvatarUrl);
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
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Avatar preview"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-gray-400" />
            )}
          </div>
          
          {previewUrl && !uploading && (
            <button
              className="absolute -top-xs -right-xs rounded-full w-8 h-8 p-0 bg-error hover:bg-error/90 text-white transition-colors flex items-center justify-center"
              onClick={removeAvatar}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-xs">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#1F5D4C] to-[#2E7D32] h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-small font-body text-center text-gray-600">
            {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
          </p>
        </div>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-md text-center cursor-pointer transition-colors relative z-[70]
          ${isDragActive && !isDragReject ? 'border-blue-400 bg-blue-50' : ''}
          ${isDragReject ? 'border-red-400 bg-red-50' : ''}
          ${!isDragActive && !isDragReject ? 'border-gray-300 hover:border-gray-400' : ''}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <Upload className="w-8 h-8 mx-auto mb-xs text-gray-400" />
        
        {isDragActive ? (
          isDragReject ? (
            <p className="text-red-600">Invalid file type</p>
          ) : (
            <p className="text-blue-600">Drop the image here...</p>
          )
        ) : (
          <div>
            <p className="text-gray-600 mb-xs">
              Drag & drop an image here, or click to select
            </p>
            <p className="text-small font-body text-gray-500">
              Supports: JPEG, PNG, WebP (max 5MB)
            </p>
          </div>
        )}
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
      <div className="text-caption font-body text-gray-500 space-y-xs">
        <p>• Images will be automatically resized to 400x400 pixels</p>
        <p>• Supported formats: JPEG, PNG, WebP</p>
        <p>• Maximum file size: 5MB</p>
        <p>• Images are compressed for optimal performance</p>
      </div>
    </div>
  );
}