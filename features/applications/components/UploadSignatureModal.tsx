"use client";

import React, { useState } from "react";
import {
  FiX,
  FiUploadCloud,
  FiTrash2,
  FiCheckCircle,
  FiFileText,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/components/ui/button";

interface UploadSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const UploadSignatureModal: React.FC<UploadSignatureModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [fileUploaded, setFileUploaded] = useState(true);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-[28px] p-6 sm:p-8 max-w-md w-full relative shadow-2xl flex flex-col"
        >
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="icon"
            rounded="full"
            aria-label="Close modal"
            className="absolute top-5 right-5 w-8 h-8 bg-[#FDF2F4] text-[#A31D38] hover:bg-[#FCE3E7]"
            leftIcon={<FiX className="w-4 h-4 stroke-[2.5]" />}
          />

          <h3 className="text-[#1A1A1A] font-extrabold text-xl sm:text-2xl text-center mt-2 mb-2">
            Upload Signature
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm text-center leading-relaxed mb-6 max-w-xs mx-auto font-normal">
            Please upload your signature to complete this step. Ensure the
            signature is clear and legible.
          </p>

          <div className="text-left w-full">
            <span className="font-semibold text-gray-700 text-xs sm:text-sm mb-2 block">
              Upload Evidence
            </span>

            <div
              onClick={() => setFileUploaded(true)}
              className="bg-[#FDF2F4] border-2 border-dashed border-[#F87171]/40 hover:border-[#A31D38]/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all mb-4"
            >
              <div className="w-10 h-10 rounded-full bg-[#FDF2F4] text-[#A31D38] flex items-center justify-center mb-2">
                <FiUploadCloud className="w-6 h-6 stroke-2" />
              </div>
              <span className="font-bold text-[#A31D38] text-sm sm:text-base">
                Upload Evidence
              </span>
              <span className="text-gray-400 text-xs mt-1">
                JPG, PNG, PDF, Docs, Mp4, or WebP
              </span>
            </div>

            {fileUploaded && (
              <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 flex items-center justify-between shadow-2xs mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF2F4] text-[#A31D38] flex items-center justify-center shrink-0">
                    <FiFileText className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-black text-xs sm:text-sm leading-snug">
                      File Name
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-medium mt-0.5">
                      <span>5 mb</span>
                      <span>•</span>
                      <span className="text-[#1E7F4C] font-semibold flex items-center gap-1">
                        <FiCheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFileUploaded(false);
                  }}
                  variant="ghost"
                  size="icon"
                  rounded="lg"
                  aria-label="Remove file"
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100"
                  leftIcon={<FiTrash2 className="w-4 h-4" />}
                />
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={() => {
              onUploadSuccess();
              onClose();
            }}
            variant="amber"
            size="lg"
            fullWidth
            rounded="xl"
          >
            Upload
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
