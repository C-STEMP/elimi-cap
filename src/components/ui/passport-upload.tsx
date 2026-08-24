"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiUpload, FiCamera } from "react-icons/fi";
import { useToast } from "@/src/components/ui/toast";
import { useUploadFile } from "@/src/features/shared/storage/hooks";
import type { StorageAsset } from "@/src/features/shared/storage/api";
import { CameraCaptureModal } from "./camera-capture-modal";

export interface PassportUploadProps {
  onImageChange?: (file: File | null, asset?: StorageAsset | null) => void;
  defaultImage?: string;
  required?: boolean;
  error?: string;
  purpose?: string;
}

export const PassportUpload: React.FC<PassportUploadProps> = ({
  onImageChange,
  defaultImage,
  required = true,
  error,
  purpose = "passport",
}) => {
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const uploadFileMutation = useUploadFile();

  useEffect(() => {
    if (defaultImage) {
      setPreview(defaultImage);
    }
  }, [defaultImage]);

  const processFile = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const validExts = ["jpg", "jpeg", "png"];
    if (!ext || !validExts.includes(ext)) {
      toast({
        type: "error",
        title: "Invalid File Type",
        description: "Only .jpg, .jpeg, and .png image files are accepted.",
      });
      return;
    }

    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      toast({
        type: "error",
        title: "File Too Large",
        description: "Image size must not exceed 2MB.",
      });
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    onImageChange?.(file, {
      assetId: "",
      url: localPreview,
      provider: "local",
      type: "passport",
      metadata: {
        size: file.size,
        mimeType: file.type,
      },
    });

    try {
      const asset = await uploadFileMutation.mutateAsync({ file, purpose });
      if (asset?.url) {
        setPreview(asset.url);
      }
      onImageChange?.(file, asset);
    } catch {
      // Keep local preview even if server upload fails/is offline
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    await processFile(file);
  };

  const handleCameraCapture = async (file: File) => {
    await processFile(file);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImageChange?.(null, null);
  };

  return (
    <>
      <div
        className={`relative w-32.5 sm:w-37.5 h-32.5 sm:h-37.5 bg-[#fdf2f5] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all group shrink-0 select-none overflow-hidden ${
          error
            ? "border-primary-solid ring-2 ring-border-secondary"
            : "border-primary/20 hover:border-primary/40 hover:bg-[#fbe8ed]"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          disabled={uploadFileMutation.isPending}
          style={{ display: "none" }}
          className="hidden"
        />

        {uploadFileMutation.isPending ? (
          <div className="p-3 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary mb-2" />
            <span className="text-primary text-xs font-semibold">Uploading...</span>
          </div>
        ) : preview ? (
          <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden group z-10">
            <img
              src={preview}
              alt="Passport Preview"
              className="w-full h-full object-cover rounded-2xl"
            />
            <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs p-1 rounded-xl">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/90 hover:bg-white text-black p-1.5 rounded-lg text-xs font-semibold flex items-center justify-center cursor-pointer transition-colors"
                title="Upload another photo"
              >
                <FiUpload className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="bg-primary hover:bg-[#721328] text-white p-1.5 rounded-lg text-xs font-semibold flex items-center justify-center cursor-pointer transition-colors"
                title="Take photo with camera"
              >
                <FiCamera className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black z-20 cursor-pointer"
              title="Remove photo"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="p-2.5 sm:p-3 flex flex-col items-center justify-center gap-1.5 w-full">
            <span className="text-primary text-xs sm:text-sm font-bold leading-tight">
              Passport Photo
            </span>

            <div className="flex items-center gap-1.5 mt-0.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                title="Upload from device"
                aria-label="Upload photo from device"
              >
                <FiUpload className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="bg-primary hover:bg-[#721328] text-white p-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                title="Take with camera"
                aria-label="Take photo with camera"
              >
                <FiCamera className="w-4 h-4" />
              </button>
            </div>

            <span className="text-[10px] text-[#8e7a7e] font-medium leading-tight">
              Upload or Snap (2MB)
            </span>
          </div>
        )}
      </div>

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title="Take Passport Photograph"
      />
    </>
  );
};

