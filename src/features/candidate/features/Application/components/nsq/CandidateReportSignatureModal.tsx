"use client";

import React, { useState } from "react";
import { Modal } from "antd";
import { FiX, FiEdit3, FiCheck } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { UploadSignatureModal } from "../UploadSignatureModal";
import { useCandidateProfileSignature } from "@/src/features/shared/onboarding/hooks";

import { signDirectObservationApi } from "@/src/features/shared/applications/api";

interface CandidateReportSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle?: string;
  verifierName?: string;
  applicationId?: string;
  sessionId?: string;
  onSignedSuccess?: () => void;
}

export const CandidateReportSignatureModal: React.FC<
  CandidateReportSignatureModalProps
> = ({
  isOpen,
  onClose,
  reportTitle = "Internal Verifier Report Form",
  verifierName = "Assessor",
  applicationId,
  sessionId,
  onSignedSuccess,
}) => {
  const { toast } = useToast();
  const { data: profileSignature } = useCandidateProfileSignature();
  const [isSigned, setIsSigned] = useState(false);
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAppendSignature = () => {
    let localAssetId: string | null = null;
    if (!profileSignature?.assetId) {
      try {
        const local = localStorage.getItem("user_saved_signature");
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed?.assetId) localAssetId = parsed.assetId;
        }
      } catch {}
    }

    if (profileSignature?.assetId || localAssetId) {
      setUploadedAssetId(localAssetId);
      setIsSigned(true);
      toast({
        type: "success",
        title: "Signature Appended",
        description: "Your saved signature has been appended.",
      });
      return;
    }

    setIsUploadModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!isSigned) {
      toast({
        type: "error",
        title: "Signature Required",
        description: "Please append your signature before submitting.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (applicationId && sessionId) {
        await signDirectObservationApi(applicationId, sessionId, {
          role: "learner",
          signatureMode: profileSignature?.assetId ? "default" : "upload",
          signatureAssetId: profileSignature?.assetId || uploadedAssetId || undefined,
          signedAt: new Date().toISOString(),
        });
      }
      toast({
        type: "success",
        title: "Report Signed",
        description: "You have successfully signed the document.",
      });
      onSignedSuccess?.();
      onClose();
    } catch (err: any) {
      toast({
        type: "error",
        title: "Signing Failed",
        description: err?.message || "Could not sign the document. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={onClose}
        footer={null}
        closable={false}
        centered
        width={440}
        styles={{
          body: {
            padding: "24px",
          },
        }}
      >
        <div className="flex flex-col gap-5 select-text">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-base sm:text-lg font-black text-neutral-primary">
              Append Signature
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#a31d38] flex items-center justify-center transition-colors cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Document
            </span>
            <h4 className="text-sm font-extrabold text-neutral-primary">
              {reportTitle}
            </h4>
            <span className="text-xs text-neutral-secondary">
              Verified by: <strong className="text-neutral-primary">{verifierName}</strong>
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-neutral-primary">
              Candidate Signature<span className="text-rose-500">*</span>
            </label>
            <div
              onClick={!isSigned ? handleAppendSignature : undefined}
              className={`h-12 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                isSigned
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-300 bg-amber-50/80 text-amber-700 hover:bg-amber-100/70 cursor-pointer"
              }`}
            >
              {isSigned ? (
                <>
                  <FiCheck className="w-4 h-4 text-emerald-600" />
                  <span>Signature Appended</span>
                </>
              ) : (
                <>
                  <FiEdit3 className="w-4 h-4 text-amber-600" />
                  <span>Append Signature</span>
                </>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="amber"
            size="lg"
            loading={isSubmitting}
            onClick={handleConfirmSubmit}
            className="w-full h-11 text-white font-bold text-xs sm:text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-md cursor-pointer"
          >
            Confirm & Sign
          </Button>
        </div>
      </Modal>

      <UploadSignatureModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={(signature) => {
          setUploadedAssetId(signature?.assetId || null);
          setIsSigned(true);
          setIsUploadModalOpen(false);
          toast({
            type: "success",
            title: "Signature Appended",
            description: "Your signature has been uploaded and appended.",
          });
        }}
      />
    </>
  );
};
