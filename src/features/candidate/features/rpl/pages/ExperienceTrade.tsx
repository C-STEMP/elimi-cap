"use client";

import React from "react";
import { Button } from "@/src/components/ui/button";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ASSETS_URL } from "@/assets";
import { StatusModal } from "@/components/status-modal";
import { useRplExperienceState } from "../hooks/useRplExperienceState";
import { RplQualificationCard } from "../components/RplQualificationCard";
import { RplOccupationCard } from "../components/RplOccupationCard";
import { RplEmploymentHistoryCard } from "../components/RplEmploymentHistoryCard";
import { RplEvidenceCard } from "../components/RplEvidenceCard";

export interface RPLExperienceTradeProps {
  onBack?: () => void;
  onContinue?: () => void;
}

export const RPLExperienceTrade: React.FC<RPLExperienceTradeProps> = ({
  onBack,
  onContinue,
}) => {
  const router = useRouter();
  const state = useRplExperienceState(onContinue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col gap-6 select-text max-w-2xl mx-auto pb-12"
    >
      <form onSubmit={state.handleSubmit} className="w-full flex flex-col gap-6">
        {/* Step Progress Bar */}
        <div className="w-full max-w-109.75 flex justify-start">
          <div className="w-46.5 h-2.5 bg-primary-solid/15 rounded-[10px] overflow-hidden">
            <div className="w-2/4 h-full bg-primary-solid rounded-[10px] transition-all duration-300" />
          </div>
        </div>

        {/* Header Title */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl xl:text-[26px] font-bold tracking-tight text-primary">
            Step 2 of 4: Experience & Trade
          </h1>
          <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-0.5">
            This information helps us determine the most suitable qualification and assessment path.
          </p>
        </div>

        <RplQualificationCard
          form={state.form}
          errors={state.errors}
          update={state.update}
          isUnitsLoading={state.isUnitsLoading}
          unitOptions={state.unitOptions}
        />

        <RplOccupationCard
          form={state.form}
          errors={state.errors}
          update={state.update}
        />

        <RplEmploymentHistoryCard
          employments={state.form.employments}
          errors={state.errors}
          updateEmployment={state.updateEmployment}
          addEmployment={state.addEmployment}
          removeEmployment={state.removeEmployment}
        />

        <RplEvidenceCard
          reasonRPL={state.form.reasonRPL}
          selectedEvidence={state.form.selectedEvidence}
          otherEvidenceText={state.form.otherEvidenceText}
          update={state.update}
          toggleEvidence={state.toggleEvidence}
        />

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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => state.setShowConfirmDraftModal(true)}
              className="px-5 h-11 bg-white border border-secondary text-secondary hover:bg-secondary/10 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer whitespace-nowrap"
            >
              <span>Save As Draft</span>
              <Image src={ASSETS_URL.saveIcon} alt="Save icon" width={20} height={20} className="w-5 h-5 shrink-0" />
            </button>

            <Button
              type="submit"
              variant="amber"
              size="md"
              loading={state.form.isSubmitting}
              rightIcon={<FiArrowRight className="w-4.5 h-4.5" />}
              className="px-8 h-11 text-white font-bold text-sm rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
            >
              Continue
            </Button>
          </div>
        </div>
      </form>

      <StatusModal
        isOpen={state.showConfirmDraftModal}
        variant="save-draft-confirm"
        onClose={() => state.setShowConfirmDraftModal(false)}
        onAction={state.handleConfirmSaveDraft}
      />

      <StatusModal isOpen={state.showSavingDraftModal} variant="saving-draft" />

      <StatusModal
        isOpen={state.showDraftModal}
        variant="draft-saved"
        onClose={() => state.setShowDraftModal(false)}
        onAction={() => router.push("/dashboard")}
      />

      <StatusModal
        isOpen={state.form.showSuccessModal}
        type="success"
        title="Step 2 Completed"
        description="Experience & Trade information saved successfully!"
        actionLabel="Go to Dashboard"
        onAction={() => router.push("/dashboard")}
      />
    </motion.div>
  );
};
