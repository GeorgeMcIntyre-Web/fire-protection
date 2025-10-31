/**
 * Camera Capture Component
 * Provides camera access for capturing photos on mobile devices
 */

import { useRef, useState, useEffect } from 'react';
import {
  CameraIcon,
  XMarkIcon,
  ArrowPathIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { hapticButton, hapticSuccess } from '../lib/haptics';

interface CameraCaptureProps {
  onCapture: (imageData: Blob, imageUrl: string) => void;
  onCancel: () => void;
  facingMode?: 'user' | 'environment';
}

export function CameraCapture({
  onCapture,
  onCancel,
  facingMode: initialFacingMode = 'environment',
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState(initialFacingMode);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Check for multiple cameras
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);
    });
  }, []);

  // Start camera
  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (mounted && videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setError('Unable to access camera. Please check permissions.');
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Capture photo
  const handleCapture = () => {
    hapticButton();

    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
      }
    }, 'image/jpeg', 0.9);
  };

  // Confirm capture
  const handleConfirm = () => {
    hapticSuccess();

    if (!capturedImage || !canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        onCapture(blob, capturedImage);
        cleanup();
      }
    }, 'image/jpeg', 0.9);
  };

  // Retake photo
  const handleRetake = () => {
    hapticButton();
    setCapturedImage(null);
  };

  // Switch camera
  const handleSwitchCamera = () => {
    hapticButton();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Cancel and cleanup
  const handleCancel = () => {
    hapticButton();
    cleanup();
    onCancel();
  };

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
          <h3 className="text-lg font-semibold mb-2">Camera Error</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleCancel}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full touch-target"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <span className="font-medium">
          {capturedImage ? 'Review Photo' : 'Take Photo'}
        </span>
        <div className="w-10" />
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {!capturedImage ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <img
            src={capturedImage}
            alt="Captured"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Grid overlay */}
        {!capturedImage && (
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-white border-opacity-20" />
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black bg-opacity-50">
        <div className="flex items-center justify-around">
          {!capturedImage ? (
            <>
              {/* Switch Camera */}
              {hasMultipleCameras && (
                <button
                  onClick={handleSwitchCamera}
                  className="p-3 text-white hover:bg-white hover:bg-opacity-10 rounded-full touch-target"
                >
                  <ArrowPathIcon className="h-6 w-6" />
                </button>
              )}

              {/* Capture Button */}
              <button
                onClick={handleCapture}
                className="h-16 w-16 bg-white rounded-full border-4 border-gray-300 hover:bg-gray-100 touch-target flex items-center justify-center"
              >
                <CameraIcon className="h-8 w-8 text-gray-700" />
              </button>

              {/* Spacer */}
              <div className="w-12" />
            </>
          ) : (
            <>
              {/* Retake */}
              <button
                onClick={handleRetake}
                className="px-6 py-3 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 touch-target"
              >
                Retake
              </button>

              {/* Confirm */}
              <button
                onClick={handleConfirm}
                className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 touch-target flex items-center gap-2"
              >
                <CheckIcon className="h-5 w-5" />
                <span>Use Photo</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Camera Button Component
 */
export function CameraButton({
  onCapture,
  className = '',
}: {
  onCapture: (imageData: Blob, imageUrl: string) => void;
  className?: string;
}) {
  const [showCamera, setShowCamera] = useState(false);

  const handleCapture = (imageData: Blob, imageUrl: string) => {
    onCapture(imageData, imageUrl);
    setShowCamera(false);
  };

  return (
    <>
      <button
        onClick={() => {
          hapticButton();
          setShowCamera(true);
        }}
        className={`flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 touch-target ${className}`}
      >
        <CameraIcon className="h-5 w-5" />
        <span>Take Photo</span>
      </button>

      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}
    </>
  );
}
