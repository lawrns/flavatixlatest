import React, { useState } from 'react';
import Image from 'next/image';
import { Share2, Copy, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface ShareButtonProps {
  disabled?: boolean;
  onShare: () => Promise<{ imageUrl?: string; text: string; url: string }>;
  className?: string;
}

export default function ShareButton({ disabled, onShare, className = '' }: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState<{
    imageUrl?: string;
    text: string;
    url: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShareClick = async () => {
    setLoading(true);
    try {
      const data = await onShare();
      setShareData(data);

      // Try native share first (mobile)
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'My Flavatix Taste Profile',
            text: data.text,
            url: data.url,
          });
          toast.success('Shared successfully!');
          return;
        } catch (err) {
          // User cancelled or share failed, show modal instead
          if ((err as Error).name !== 'AbortError') {
            console.error('Share failed:', err);
          }
        }
      }

      // Fallback to modal
      setShowModal(true);
    } catch (error) {
      console.error('Share preparation failed:', error);
      toast.error('Failed to prepare share content');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareData) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareToSocial = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    if (!shareData) {
      return;
    }

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <>
      <button
        onClick={handleShareClick}
        disabled={disabled || loading}
        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        <Share2 className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
        Share
      </button>

      {/* Share Modal */}
      {showModal && shareData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Share Your Taste Profile</h2>

            {/* Preview Image */}
            {shareData.imageUrl && (
              <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={shareData.imageUrl}
                  alt="Flavor Wheel Preview"
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-full"
                />
              </div>
            )}

            {/* Share Text */}
            <p className="text-gray-700 mb-4 text-sm bg-gray-50 p-3 rounded-md">{shareData.text}</p>

            {/* Social Share Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => shareToSocial('twitter')}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-md hover:bg-[#1a8cd8] transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
                Twitter
              </button>

              <button
                onClick={() => shareToSocial('facebook')}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#4267B2] text-white rounded-md hover:bg-[#365899] transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>

              <button
                onClick={() => shareToSocial('linkedin')}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-md hover:bg-[#006399] transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </button>
            </div>

            {/* Copy Link */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareData.url}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Made with Flavatix - Where Tasters Connect
            </p>
          </div>
        </div>
      )}
    </>
  );
}
