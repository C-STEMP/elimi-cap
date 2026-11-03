"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  FiX,
  FiUpload,
  FiCheckCircle,
  FiEdit3,
  FiTrash2,
  FiCheck,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useUploadFile, useResolveAssets } from "@/src/features/shared/storage/hooks";
import {
  useAssessorProfileSignature,
  useSetAssessorProfileSignature,
} from "@/src/features/shared/assessor/hooks";

export interface AssessorSignatureData {
  assetId: string;
  name: string;
  signedAt: string;
  url?: string;
}

interface AssessorSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signature: AssessorSignatureData) => void;
  signerName?: string;
  title?: string;
  subtitle?: string;
}

export const AssessorSignatureModal: React.FC<AssessorSignatureModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  signerName = "Assessor",
  title = "Append Assessor Signature",
  subtitle = "Choose to use your saved digital signature, draw a new one, or upload an image.",
}) => {
  const { toast } = useToast();
  const uploadMutation = useUploadFile();
  const setProfileSignatureMutation = useSetAssessorProfileSignature();
  const { data: profileSig, isLoading: isProfileSigLoading } =
    useAssessorProfileSignature(isOpen);

  const [activeTab, setActiveTab] = useState<"saved" | "draw" | "upload">(
    "saved",
  );

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Resolve saved profile signature URL if only assetId is present
  const assetsToResolve = React.useMemo(() => {
    return profileSig?.assetId && !profileSig.url ? [profileSig.assetId] : [];
  }, [profileSig?.assetId, profileSig?.url]);

  const { data: resolvedProfileAssets } = useResolveAssets(assetsToResolve);

  const savedProfileUrl =
    profileSig?.url ||
    (profileSig?.assetId && Array.isArray(resolvedProfileAssets)
      ? resolvedProfileAssets.find((a) => a.assetId === profileSig.assetId)?.url
      : null);

  const hasSavedSignature = Boolean(profileSig?.assetId || savedProfileUrl);

  // Set default tab on open
  useEffect(() => {
    if (isOpen) {
      if (hasSavedSignature) {
        setActiveTab("saved");
      } else {
        setActiveTab("draw");
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setHasDrawn(false);
      setIsSubmitting(false);
    }
  }, [isOpen, hasSavedSignature]);

  // Setup drawing canvas
  useEffect(() => {
    if (activeTab === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#1A1A1A";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const handleStartDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const handleDrawMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleEndDraw = () => {
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        type: "error",
        title: "Invalid File Type",
        description: "Please upload an image file (PNG, JPG, or JPEG).",
      });
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        type: "error",
        title: "File Too Large",
        description: "Signature file size must be less than 5MB.",
      });
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUseSavedSignature = () => {
    if (!profileSig?.assetId) {
      toast({
        type: "error",
        title: "No Saved Signature",
        description: "Please draw or upload a signature first.",
      });
      return;
    }

    const now = new Date().toISOString();
    onConfirm({
      assetId: profileSig.assetId,
      name: signerName,
      signedAt: now,
      url: savedProfileUrl || undefined,
    });
    onClose();
  };

  const handleConfirmDraw = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      toast({
        type: "error",
        title: "Signature Required",
        description: "Please draw your signature before submitting.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png"),
      );

      if (!blob) {
        throw new Error("Could not process canvas signature.");
      }

      const file = new File([blob], `signature_${Date.now()}.png`, {
        type: "image/png",
      });

      const asset = await uploadMutation.mutateAsync({
        file,
        purpose: "signature",
      });

      if (!asset?.assetId) {
        throw new Error("Upload did not return an asset ID.");
      }

      // Save to profile in background so it's persisted for subsequent forms
      try {
        await setProfileSignatureMutation.mutateAsync({
          assetId: asset.assetId,
          url: asset.url || undefined,
        });
      } catch {
        // Non-blocking
      }

      const now = new Date().toISOString();
      onConfirm({
        assetId: asset.assetId,
        name: signerName,
        signedAt: now,
        url: asset.url || URL.createObjectURL(blob),
      });

      toast({
        type: "success",
        title: "Signature Appended",
        description: "Your drawn signature has been appended.",
      });

      onClose();
    } catch (err: any) {
      toast({
        type: "error",
        title: "Signature Failed",
        description: err?.message || "Failed to save drawn signature.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) {
      toast({
        type: "error",
        title: "File Required",
        description: "Please select a signature image file.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const asset = await uploadMutation.mutateAsync({
        file: selectedFile,
        purpose: "signature",
      });

      if (!asset?.assetId) {
        throw new Error("Upload did not return an asset ID.");
      }

      // Save to profile in background
      try {
        await setProfileSignatureMutation.mutateAsync({
          assetId: asset.assetId,
          url: asset.url || undefined,
        });
      } catch {
        // Non-blocking
      }

      const now = new Date().toISOString();
      onConfirm({
        assetId: asset.assetId,
        name: signerName,
        signedAt: now,
        url: asset.url || previewUrl || undefined,
      });

      toast({
        type: "success",
        title: "Signature Appended",
        description: "Your signature image has been uploaded and appended.",
      });

      onClose();
    } catch (err: any) {
      toast({
        type: "error",
        title: "Upload Failed",
        description: err?.message || "Failed to upload signature file.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-text">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full relative shadow-2xl flex flex-col border border-gray-100 max-h-[92vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="flex flex-col items-center text-center mt-1 mb-5 pr-6">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-[#FBAB2A] flex items-center justify-center mb-2.5 border border-amber-200/60 shadow-2xs">
              <FiEdit3 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mt-1 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="w-full bg-[#f4f5f7] p-1 rounded-2xl flex items-center gap-1 border border-gray-200/80 mb-5">
            {hasSavedSignature && (
              <button
                type="button"
                onClick={() => setActiveTab("saved")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "saved"
                    ? "bg-white text-gray-900 shadow-2xs border border-gray-200/60"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Saved Signature
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab("draw")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "draw"
                  ? "bg-white text-gray-900 shadow-2xs border border-gray-200/60"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Draw
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "upload"
                  ? "bg-white text-gray-900 shadow-2xs border border-gray-200/60"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Upload Image
            </button>
          </div>

          {/* TAB 1: SAVED SIGNATURE */}
          {activeTab === "saved" && hasSavedSignature && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-dashed border-gray-300 flex flex-col items-center justify-center min-h-[140px]">
                {savedProfileUrl ? (
                  <img
                    src={savedProfileUrl}
                    alt="Saved Assessor Signature"
                    className="max-h-24 max-w-full object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <FiCheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>Saved Profile Signature Available</span>
                  </div>
                )}
                <span className="text-[11px] text-gray-400 mt-2 font-medium">
                  Configured in Assessor Profile Settings
                </span>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-xl text-xs font-bold border-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUseSavedSignature}
                  className="flex-1 h-11 rounded-xl text-xs font-bold bg-[#FBAB2A] hover:bg-[#E89B1F] text-white"
                >
                  Append Saved Signature
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: DRAW SIGNATURE */}
          {activeTab === "draw" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-primary">
                  Draw your signature below:
                </span>
                <button
                  type="button"
                  onClick={handleClearCanvas}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <FiTrash2 className="w-3.5 h-3.5" /> Clear
                </button>
              </div>

              <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden touch-none relative shadow-2xs">
                <canvas
                  ref={canvasRef}
                  width={440}
                  height={160}
                  onMouseDown={handleStartDraw}
                  onMouseMove={handleDrawMove}
                  onMouseUp={handleEndDraw}
                  onMouseLeave={handleEndDraw}
                  onTouchStart={handleStartDraw}
                  onTouchMove={handleDrawMove}
                  onTouchEnd={handleEndDraw}
                  className="w-full h-40 bg-white cursor-crosshair block"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-gray-300 text-xs font-medium">
                    Sign with mouse or stylus here
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-xl text-xs font-bold border-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDraw}
                  disabled={!hasDrawn || isSubmitting}
                  className="flex-1 h-11 rounded-xl text-xs font-bold bg-[#FBAB2A] hover:bg-[#E89B1F] text-white disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Append Signature"}
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD IMAGE */}
          {activeTab === "upload" && (
            <div className="flex flex-col gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                onChange={handleFileChange}
              />

              {previewUrl ? (
                <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-dashed border-gray-300 flex flex-col items-center justify-center min-h-[140px] relative">
                  <img
                    src={previewUrl}
                    alt="Signature Preview"
                    className="max-h-24 max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 text-xs text-rose-600 hover:text-rose-700 font-semibold p-1.5 rounded-lg bg-white border border-gray-200 cursor-pointer shadow-2xs"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#F8F9FA] hover:bg-gray-100/80 rounded-2xl p-6 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-colors min-h-[140px]"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-[#FBAB2A] flex items-center justify-center border border-amber-200">
                    <FiUpload className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">
                      Click to upload signature image
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5">
                      PNG, JPG, or JPEG up to 5MB
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 mt-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-xl text-xs font-bold border-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmUpload}
                  disabled={!selectedFile || isSubmitting}
                  className="flex-1 h-11 rounded-xl text-xs font-bold bg-[#FBAB2A] hover:bg-[#E89B1F] text-white disabled:opacity-50"
                >
                  {isSubmitting ? "Uploading..." : "Append Signature"}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
