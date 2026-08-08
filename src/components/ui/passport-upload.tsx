"use client";

import React, { useState, useRef } from "react";
import { FiUpload } from "react-icons/fi";
import { useToast } from "@/src/components/ui/toast";

export interface PassportUploadProps {
  onImageChange?: (file: File | null) => void;
  required?: boolean;
  error?: string;
}

export const PassportUpload: React.FC<PassportUploadProps> = ({
  onImageChange,
  required = true,
  error,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      const url = URL.createObjectURL(file);
      setPreview(url);
      onImageChange?.(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImageChange?.(null);
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      className={`relative w-32.5 sm:w-37.5 h-32.5 sm:h-37.5 bg-[#fdf2f5] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#fbe8ed] transition-all group shrink-0 select-none overflow-hidden ${
        error
          ? "border-primary-solid ring-2 ring-border-secondary"
          : "border-primary/10"
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        style={{ display: "none" }}
        className="hidden"
      />
      {preview ? (
        <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden group z-10">
          <img
            src={preview}
            alt="Passport Preview"
            className="w-full h-full object-cover rounded-2xl"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black z-20 cursor-pointer"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="p-3 flex flex-col items-center justify-center">
          <FiUpload className="w-6.5 h-6.5 text-primary mb-1" />
          <span className="text-primary text-sm font-semibold leading-tight">
            Upload Passport
          </span>
          <span className="text-[10px] text-[#8e7a7e] font-normal leading-tight mt-1">
            <span className="text-primary">2MB</span> image max size
          </span>
        </div>
      )}
    </div>
  );
};
