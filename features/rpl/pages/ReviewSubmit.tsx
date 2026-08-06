"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { FiArrowLeft, FiArrowRight, FiCheck, FiEdit2 } from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ASSETS_URL } from "@/assets";
import { useAppDispatch } from "@/store/hooks";
import { setSidebarVariant, setRplStep } from "@/store/slices/authSlice";

import { StatusModal } from "@/components/ui/status-modal";

export interface RPLReviewSubmitProps {
  onBack?: () => void;
  onSubmit?: () => void;
  onEditStep?: (step: 1 | 2 | 3) => void;
}

export const RPLReviewSubmit: React.FC<RPLReviewSubmitProps> = ({
  onBack,
  onSubmit,
  onEditStep,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const [declarations, setDeclarations] = useState({
    trueAndAccurate: true,
    noGuarantee: false,
    sufficientEvidence: false,
    agreeTerms: false,
  });

  React.useEffect(() => {
    dispatch(setSidebarVariant("rpl-form"));
    dispatch(setRplStep(4));
  }, [dispatch]);

  const allChecked =
    declarations.trueAndAccurate &&
    declarations.noGuarantee &&
    declarations.sufficientEvidence &&
    declarations.agreeTerms;

  const toggleDeclaration = (key: keyof typeof declarations) => {
    setDeclarations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [showConfirmDraftModal, setShowConfirmDraftModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);

  const handleSaveDraft = () => {
    setShowConfirmDraftModal(true);
  };

  const handleConfirmSaveDraft = () => {
    setShowConfirmDraftModal(false);
    setShowDraftModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allChecked) return;
    setShowSubmitModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col gap-6 select-text max-w-2xl mx-auto pb-10"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl xl:text-[26px] font-extrabold tracking-tight text-primary">
          Step 4 of 4: Review And Submit
        </h1>
        <p className="text-xs xl:text-sm text-neutral-secondary font-normal leading-relaxed">
          Please review the information you&apos;ve provided before submitting
          your application for identity verification. You can edit any section
          if needed. Once submitted, some information may be <br /> locked until
          your application has been reviewed.
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <h2 className="text-xl xl:text-2xl font-extrabold tracking-tight text-neutral-primary">
          Application Progress
        </h2>

        <div className="flex flex-col gap-3">
          <div className="p-4 bg-gray-50/80 border border-gray-100 rounded-xl flex items-center justify-between transition-all">
            <span className="text-sm xl:text-base font-medium text-neutral-primary">
              Personal Information
            </span>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#FDF2F2] text-[#EF4444] text-xs font-semibold rounded-full">
                100% Completed
              </span>
              <button
                type="button"
                onClick={() =>
                  onEditStep ? onEditStep(1) : router.push("/rpl/personal-info")
                }
                className="text-neutral-secondary hover:text-neutral-primary p-1 transition-colors cursor-pointer"
                title="Edit Personal Information"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-gray-50/80 border border-gray-100 rounded-xl flex items-center justify-between transition-all">
            <span className="text-sm xl:text-base font-medium text-neutral-primary">
              Experience &amp; Trade
            </span>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#FEF3C7] text-[#D97706] text-xs font-semibold rounded-full">
                60% Completed
              </span>
              <button
                type="button"
                onClick={() =>
                  onEditStep
                    ? onEditStep(2)
                    : router.push("/rpl/experience-trade")
                }
                className="text-neutral-secondary hover:text-neutral-primary p-1 transition-colors cursor-pointer"
                title="Edit Experience & Trade"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 3: Verify Identity */}
          <div className="p-4 bg-gray-50/80 border border-gray-100 rounded-xl flex items-center justify-between transition-all">
            <span className="text-sm xl:text-base font-medium text-neutral-primary">
              Verify Identity
            </span>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#FDF2F2] text-[#EF4444] text-xs font-semibold rounded-full">
                Not Verified
              </span>
              <button
                type="button"
                onClick={() =>
                  onEditStep
                    ? onEditStep(3)
                    : router.push("/rpl/verify-identity")
                }
                className="text-neutral-secondary hover:text-neutral-primary p-1 transition-colors cursor-pointer"
                title="Edit Verify Identity"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Declaration */}
      <div className="flex flex-col gap-3 mt-4">
        <h2 className="text-xl xl:text-2xl font-extrabold tracking-tight text-neutral-primary">
          Assessment Declaration
        </h2>

        <div className="flex flex-col gap-3.5 mt-1">
          {/* Checkbox 1 */}
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <div
              onClick={() => toggleDeclaration("trueAndAccurate")}
              className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-all shrink-0 ${
                declarations.trueAndAccurate
                  ? "bg-primary border-primary text-white"
                  : "bg-white border-gray-300 group-hover:border-gray-400"
              }`}
            >
              {declarations.trueAndAccurate && (
                <FiCheck className="w-3.5 h-3.5 stroke-3" />
              )}
            </div>
            <span
              onClick={() => toggleDeclaration("trueAndAccurate")}
              className="text-sm xl:text-base text-neutral-primary font-medium leading-6"
            >
              I confirm that the information provided is true and accurate.
            </span>
          </label>

          {/* Checkbox 2 */}
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <div
              onClick={() => toggleDeclaration("noGuarantee")}
              className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-all shrink-0 ${
                declarations.noGuarantee
                  ? "bg-primary border-primary text-white"
                  : "bg-white border-gray-300 group-hover:border-gray-400"
              }`}
            >
              {declarations.noGuarantee && (
                <FiCheck className="w-3.5 h-3.5 stroke-3" />
              )}
            </div>
            <span
              onClick={() => toggleDeclaration("noGuarantee")}
              className="text-sm xl:text-base text-neutral-primary font-medium leading-6"
            >
              I understand that submitting this application does not guarantee
              certification.
            </span>
          </label>

          {/* Checkbox 3 */}
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <div
              onClick={() => toggleDeclaration("sufficientEvidence")}
              className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-all shrink-0 ${
                declarations.sufficientEvidence
                  ? "bg-primary border-primary text-white"
                  : "bg-white border-gray-300 group-hover:border-gray-400"
              }`}
            >
              {declarations.sufficientEvidence && (
                <FiCheck className="w-3.5 h-3.5 stroke-3" />
              )}
            </div>
            <span
              onClick={() => toggleDeclaration("sufficientEvidence")}
              className="text-sm xl:text-base text-neutral-primary font-medium leading-6"
            >
              I understand that I must provide sufficient evidence to
              demonstrate my competence.
            </span>
          </label>

          {/* Checkbox 4 */}
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <div
              onClick={() => toggleDeclaration("agreeTerms")}
              className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-all shrink-0 ${
                declarations.agreeTerms
                  ? "bg-primary border-primary text-white"
                  : "bg-white border-gray-300 group-hover:border-gray-400"
              }`}
            >
              {declarations.agreeTerms && (
                <FiCheck className="w-3.5 h-3.5 stroke-3" />
              )}
            </div>
            <span
              onClick={() => toggleDeclaration("agreeTerms")}
              className="text-sm xl:text-base text-neutral-primary font-medium leading-6"
            >
              I agree to the ELIMI{" "}
              <span className="font-bold text-primary">
                Terms &amp; Conditions
              </span>{" "}
              and{" "}
              <span className="font-bold text-primary">Privacy Policy.</span>
            </span>
          </label>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-8 pt-4 border-t border-gray-100 gap-4">
        <button
          type="button"
          onClick={onBack || (() => router.back())}
          className="flex items-center justify-center gap-2 text-sm font-medium text-black hover:text-text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-5 h-11 bg-white border border-secondary text-secondary hover:bg-secondary/10 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer whitespace-nowrap"
          >
            <span>Save As Draft</span>
            <Image
              src={ASSETS_URL.saveIcon}
              alt="Save icon"
              width={20}
              height={20}
              className="w-5 h-5 shrink-0"
            />
          </button>

          <Button
            type="button"
            variant="amber"
            size="md"
            onClick={handleSubmit}
            disabled={!allChecked}
            rightIcon={<FiArrowRight className="w-4.5 h-4.5" />}
            className="px-8 h-11 text-white font-bold text-sm rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
          >
            Submit
          </Button>
        </div>
      </div>

      <StatusModal
        isOpen={showConfirmDraftModal}
        variant="save-draft-confirm"
        onClose={() => setShowConfirmDraftModal(false)}
        onAction={handleConfirmSaveDraft}
      />

      <StatusModal
        isOpen={showDraftModal}
        variant="draft-saved"
        onClose={() => setShowDraftModal(false)}
        onAction={() => router.push("/dashboard")}
      />

      <StatusModal
        isOpen={showSubmitModal}
        variant="application-submitted"
        onClose={() => setShowSubmitModal(false)}
        onAction={() => router.push("/dashboard?status=submitted")}
      />
    </motion.div>
  );
};
