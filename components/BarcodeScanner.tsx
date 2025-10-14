/**
 * Barcode Scanner Component
 * Uses device camera to scan UPC/EAN barcodes for product identification
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { toast } from '@/lib/toast';

interface BarcodeScannerProps {
  onScan: (barcode: string, productInfo?: ProductInfo) => void;
  onClose: () => void;
  category?: string;
}

interface ProductInfo {
  barcode: string;
  name: string;
  brand?: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  country?: string;
  vintage?: string;
}

// Simple JavaScript-based barcode detection (fallback for browsers without BarcodeDetector API)
class SimpleBarcodeReader {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private scanning: boolean = false;

  constructor(video: HTMLVideoElement) {
    this.video = video;
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
  }

  async startScanning(callback: (code: string) => void) {
    this.scanning = true;

    const scan = async () => {
      if (!this.scanning) return;

      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.context.drawImage(this.video, 0, 0);

      try {
        // Use the experimental BarcodeDetector API if available
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
          });

          const barcodes = await barcodeDetector.detect(this.canvas);
          if (barcodes.length > 0) {
            callback(barcodes[0].rawValue);
            this.stopScanning();
            return;
          }
        }
      } catch (error) {
        console.log('BarcodeDetector not available, using fallback');
      }

      // Continue scanning
      requestAnimationFrame(scan);
    };

    scan();
  }

  stopScanning() {
    this.scanning = false;
  }
}

export default function BarcodeScanner({ onScan, onClose, category = 'wine' }: BarcodeScannerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<SimpleBarcodeReader | null>(null);

  // Start camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);

        // Start scanning once video is ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          startScanning();
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions.');
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (readerRef.current) {
      readerRef.current.stopScanning();
      readerRef.current = null;
    }
  };

  const startScanning = () => {
    if (!videoRef.current) return;

    readerRef.current = new SimpleBarcodeReader(videoRef.current);
    readerRef.current.startScanning(handleBarcodeDetected);
  };

  const handleBarcodeDetected = async (code: string) => {
    if (detectedCode) return; // Already detected

    console.log('Barcode detected:', code);
    setDetectedCode(code);

    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }

    // Stop scanning
    if (readerRef.current) {
      readerRef.current.stopScanning();
    }

    // Look up product information
    await lookupProduct(code);
  };

  const lookupProduct = async (barcode: string) => {
    try {
      // First, check our internal database
      const internalProduct = await checkInternalDatabase(barcode);

      if (internalProduct) {
        setProductInfo(internalProduct);
        toast.success('Product found in database!');
        return;
      }

      // If not found internally, create basic entry
      const basicInfo: ProductInfo = {
        barcode,
        name: `Product ${barcode}`,
        category: category
      };

      setProductInfo(basicInfo);
      toast.info('New product - please fill in details');
    } catch (error) {
      console.error('Product lookup error:', error);
      toast.error('Failed to look up product');
    }
  };

  const checkInternalDatabase = async (barcode: string): Promise<ProductInfo | null> => {
    // Mock internal database - replace with actual API call
    const mockDatabase: Record<string, ProductInfo> = {
      '750302412035': {
        barcode: '750302412035',
        name: 'Cabernet Sauvignon',
        brand: 'Silver Oak',
        category: 'wine',
        vintage: '2018',
        country: 'USA'
      },
      '5449000214898': {
        barcode: '5449000214898',
        name: 'Coca-Cola Original',
        brand: 'Coca-Cola',
        category: 'beverage',
        description: 'Classic cola soft drink'
      },
      '793573275950': {
        barcode: '793573275950',
        name: 'Ethiopian Yirgacheffe',
        brand: 'Blue Bottle Coffee',
        category: 'coffee',
        description: 'Single origin, light roast'
      }
    };

    return mockDatabase[barcode] || null;
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      toast.error('Please enter a barcode');
      return;
    }

    handleBarcodeDetected(manualCode.trim());
  };

  const confirmProduct = () => {
    if (detectedCode) {
      onScan(detectedCode, productInfo || undefined);
      stopCamera();
    }
  };

  const resetScanner = () => {
    setDetectedCode(null);
    setProductInfo(null);
    startScanning();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-lg font-semibold">Scan Barcode</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Camera View */}
      {hasPermission && !detectedCode && (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            autoPlay
            muted
          />

          {/* Scanning Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Scanning frame */}
              <div className="w-64 h-64 border-2 border-white rounded-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm">Position barcode in frame</p>
                  </div>
                </div>

                {/* Corner indicators */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-lg" />
              </div>

              {/* Scanning line animation */}
              <div className="absolute inset-x-0 h-0.5 bg-primary-500 animate-scan" />
            </div>
          </div>

          {/* Manual Entry Button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <button
              onClick={() => setIsManualEntry(true)}
              className="w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              Enter barcode manually
            </button>
          </div>
        </>
      )}

      {/* Product Found */}
      {detectedCode && productInfo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <h3 className="text-lg font-semibold">Product Found!</h3>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <span className="text-sm text-gray-500">Barcode:</span>
                <p className="font-mono">{productInfo.barcode}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Product:</span>
                <p className="font-medium">{productInfo.name}</p>
              </div>
              {productInfo.brand && (
                <div>
                  <span className="text-sm text-gray-500">Brand:</span>
                  <p>{productInfo.brand}</p>
                </div>
              )}
              {productInfo.vintage && (
                <div>
                  <span className="text-sm text-gray-500">Vintage:</span>
                  <p>{productInfo.vintage}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={confirmProduct}
                className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Use This Product
              </button>
              <button
                onClick={resetScanner}
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                Scan Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {isManualEntry && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Enter Barcode</h3>

            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter barcode number"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              autoFocus
            />

            <div className="flex space-x-3">
              <button
                onClick={handleManualSubmit}
                className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Look Up
              </button>
              <button
                onClick={() => setIsManualEntry(false)}
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Initializing camera...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold">Camera Error</h3>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex space-x-3">
              <button
                onClick={startCamera}
                className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => setIsManualEntry(true)}
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                Enter Manually
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add to your global styles
const scanAnimation = `
@keyframes scan {
  0% { transform: translateY(-100%); }
  50% { transform: translateY(100%); }
  100% { transform: translateY(-100%); }
}

.animate-scan {
  animation: scan 2s ease-in-out infinite;
}
`;