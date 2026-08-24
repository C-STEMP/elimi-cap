"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCamera, FiRefreshCw, FiCheck, FiX, FiAlertCircle } from "react-icons/fi";
import { Button } from "./button";

export interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  title?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = "Take Passport Photograph",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopStream();
    setIsInitializing(true);
    setCameraError(null);
    setCapturedDataUrl(null);
    setCapturedFile(null);

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Camera is not supported on this browser or device.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera access was denied. Please allow camera permissions in your browser settings.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError(err?.message || "Unable to access camera. Please try uploading a photo instead.");
      }
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopStream();
      setCapturedDataUrl(null);
      setCapturedFile(null);
      setCameraError(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const size = Math.min(video.videoWidth || 640, video.videoHeight || 640);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Center square crop
    const startX = ((video.videoWidth || size) - size) / 2;
    const startY = ((video.videoHeight || size) - size) / 2;

    // Flip horizontal if front camera for natural mirror view
    if (facingMode === "user") {
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `passport_capture_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        setCapturedDataUrl(dataUrl);
        setCapturedFile(file);
      },
      "image/jpeg",
      0.92
    );
  };

  const handleRetake = () => {
    setCapturedDataUrl(null);
    setCapturedFile(null);
    if (videoRef.current && streamRef.current) {
      videoRef.current.play().catch(() => {});
    } else {
      startCamera();
    }
  };

  const handleConfirm = () => {
    if (capturedFile) {
      onCapture(capturedFile);
      stopStream();
      onClose();
    }
  };

  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleClose = () => {
    stopStream();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md flex flex-col relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <FiCamera className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-neutral-primary">{title}</h3>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-colors cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Viewport & Controls */}
          <div className="p-5 flex flex-col items-center gap-4">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 bg-black rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
              {capturedDataUrl ? (
                <img
                  src={capturedDataUrl}
                  alt="Captured Portrait"
                  className="w-full h-full object-cover"
                />
              ) : cameraError ? (
                <div className="p-6 text-center text-white flex flex-col items-center gap-3">
                  <FiAlertCircle className="w-10 h-10 text-rose-400" />
                  <p className="text-xs sm:text-sm font-medium leading-relaxed">
                    {cameraError}
                  </p>
                  <Button
                    type="button"
                    onClick={startCamera}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className={`w-full h-full object-cover ${
                      facingMode === "user" ? "scale-x-[-1]" : ""
                    }`}
                  />

                  {/* Face outline guide overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-52 h-64 border-2 border-dashed border-white/70 rounded-full shadow-xs" />
                  </div>

                  {isInitializing && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-2">
                      <div className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Starting camera...</span>
                    </div>
                  )}

                  {/* Switch camera button */}
                  <button
                    type="button"
                    onClick={handleToggleFacingMode}
                    className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-xs transition-colors cursor-pointer"
                    title="Switch camera"
                    aria-label="Switch camera"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Action Bar */}
            <div className="w-full flex items-center justify-center gap-3 pt-2">
              {capturedDataUrl ? (
                <>
                  <Button
                    type="button"
                    onClick={handleRetake}
                    variant="outline"
                    className="flex-1 border-gray-200 text-gray-700 font-semibold"
                    leftIcon={<FiRefreshCw className="w-4 h-4" />}
                  >
                    Retake
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirm}
                    className="flex-1 bg-primary hover:bg-[#721328] text-white font-bold"
                    leftIcon={<FiCheck className="w-4 h-4" />}
                  >
                    Use Photo
                  </Button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={Boolean(cameraError) || isInitializing}
                  onClick={handleSnap}
                  className="w-16 h-16 rounded-full bg-primary hover:bg-[#721328] active:scale-95 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-4 border-white ring-4 ring-primary/30"
                  aria-label="Capture photo"
                  title="Snap Photo"
                >
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-primary">
                    <FiCamera className="w-4 h-4" />
                  </div>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
