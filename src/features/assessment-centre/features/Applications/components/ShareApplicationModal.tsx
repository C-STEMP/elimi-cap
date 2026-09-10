"use client";

import React, { useState } from "react";
import { FiX, FiShare2, FiCopy, FiCheck, FiTrash2, FiExternalLink } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useCreateShareToken, useDeleteShareToken } from "@/src/features/shared/centre/hooks";

interface ShareApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  candidateName?: string;
  existingToken?: string | null;
}

export const ShareApplicationModal: React.FC<ShareApplicationModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  candidateName = "Candidate",
  existingToken = null,
}) => {
  const { toast } = useToast();
  const createTokenMutation = useCreateShareToken(applicationId);
  const deleteTokenMutation = useDeleteShareToken(applicationId);

  const [currentToken, setCurrentToken] = useState<string | null>(existingToken);
  const [hasCopied, setHasCopied] = useState(false);

  React.useEffect(() => {
    if (existingToken) {
      setCurrentToken(existingToken);
    }
  }, [existingToken]);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = currentToken ? `${origin}/shared/applications/${currentToken}` : "";

  const handleGenerate = async () => {
    try {
      const result = await createTokenMutation.mutateAsync();
      setCurrentToken(result.token);
      toast({
        type: "success",
        title: "Share Link Generated",
        description: "Public link to candidate dossier is active.",
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Generation Failed",
        description: err?.message || "Failed to generate share token.",
      });
    }
  };

  const handleRevoke = async () => {
    try {
      await deleteTokenMutation.mutateAsync();
      setCurrentToken(null);
      setHasCopied(false);
      toast({
        type: "success",
        title: "Link Revoked",
        description: "The public share token has been deactivated.",
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Revoke Failed",
        description: err?.message || "Failed to revoke share token.",
      });
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setHasCopied(true);
    toast({
      type: "success",
      title: "Link Copied",
      description: "Shareable link copied to clipboard.",
    });
    setTimeout(() => setHasCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-[28px] p-6 sm:p-8 max-w-lg w-full relative shadow-2xl flex flex-col border border-gray-100"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FDF2F4] text-[#A31D38] hover:bg-[#FCE3E7] flex items-center justify-center transition-colors cursor-pointer"
          >
            <FiX className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div className="w-12 h-12 rounded-full bg-[#FFF8EB] text-[#FBAB2A] flex items-center justify-center mx-auto mb-3">
            <FiShare2 className="w-6 h-6" />
          </div>

          <h3 className="text-[#1A1A1A] font-extrabold text-xl text-center mb-1 tracking-tight">
            Share Application Dossier
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm text-center leading-relaxed mb-6 font-normal">
            Generate a secure, tokenized public link to share {candidateName}&apos;s dossier with employers or audit bodies without logging in.
          </p>

          {currentToken ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Public Dossier Link:
                </label>
                <div className="flex items-center gap-2 bg-[#F8F9FA] border border-gray-200 rounded-xl p-2 pl-3">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="bg-transparent border-none text-xs text-neutral-primary w-full focus:outline-none select-all truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 p-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer transition-colors shadow-2xs"
                  >
                    {hasCopied ? (
                      <>
                        <FiCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <FiCopy className="w-3.5 h-3.5 text-gray-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                    title="Open in new tab"
                  >
                    <FiExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleRevoke}
                  disabled={deleteTokenMutation.isPending}
                  className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                  <span>Revoke Link</span>
                </button>

                <Button
                  type="button"
                  size="sm"
                  onClick={onClose}
                  className="bg-[#A31D38]! hover:bg-[#8A1538]! text-white! font-bold"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center text-center">
              <p className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3.5 w-full">
                No active share link. Click below to generate an unguessable token link for this application.
              </p>

              <div className="flex items-center justify-end gap-3 w-full pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  loading={createTokenMutation.isPending}
                  onClick={handleGenerate}
                  className="bg-[#FBAB2A]! hover:bg-[#E89B1F]! text-white! font-bold"
                >
                  Generate Share Link
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
