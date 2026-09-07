"use client";

import React from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ASSETS_URL } from "@/assets";
import { StatusModal } from "@/components/status-modal";
import { Button } from "@/src/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { useRplPersonalInfoState } from "../hooks/useRplPersonalInfoState";
import { RplPersonalDetailsCard } from "../components/RplPersonalDetailsCard";
import { RplContactAddressCard } from "../components/RplContactAddressCard";
import { RplSpecialSupportCard } from "../components/RplSpecialSupportCard";

export interface RPLPersonalInfoProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export const RPLPersonalInfo: React.FC<RPLPersonalInfoProps> = ({
  onBack,
  onSuccess,
}) => {
  const router = useRouter();
  const authUser = useAppSelector((s) => s.auth.user);
  const state = useRplPersonalInfoState(onSuccess);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col gap-6 select-text max-w-2xl mx-auto pb-10"
    >
      <form onSubmit={state.handleSubmit} className="w-full flex flex-col gap-4">
        <div className="w-full max-w-109.75 flex justify-start">
          <div className="w-46.5 h-2.5 bg-primary-solid/15 rounded-[10px] overflow-hidden">
            <div className="w-1/4 h-full bg-primary-solid rounded-[10px] transition-all duration-300" />
          </div>
        </div>

        <RplPersonalDetailsCard
          form={state.form}
          errors={state.errors}
          update={state.update}
          countries={state.countries}
          passportDefaultImage={state.passportDefaultImage}
          setPassportDefaultImage={state.setPassportDefaultImage}
          passportError={state.passportError}
          setPassportError={state.setPassportError}
          setPassportFile={state.setPassportFile}
        />

        <RplContactAddressCard
          form={state.form}
          errors={state.errors}
          update={state.update}
          countries={state.countries}
          states={state.states}
          cities={state.cities}
          isLoadingStates={state.isLoadingStates}
          isLoadingLgas={state.isLoadingLgas}
          userEmail={authUser?.email}
        />

        <RplSpecialSupportCard
          form={state.form}
          errors={state.errors}
          update={state.update}
          selectedImpairments={state.selectedImpairments}
          otherImpairment={state.otherImpairment}
          setOtherImpairment={state.setOtherImpairment}
          handleToggleImpairment={state.handleToggleImpairment}
        />

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-8 pt-4 border-t border-gray-100 gap-4">
          <button
            type="button"
            onClick={onBack || (() => router.back())}
            className="flex items-center gap-2 text-sm font-medium text-black hover:text-text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
              variant="secondary"
              size="md"
              loading={state.isSubmitting}
              className="px-8 h-11 text-white font-bold text-sm bg-secondary hover:bg-secondary-hover rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
            >
              <span>Next</span>
              <FiArrowRight className="w-4 h-4" />
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

      <StatusModal
        isOpen={state.showDraftModal}
        variant="draft-saved"
        onClose={() => state.setShowDraftModal(false)}
        onAction={() => router.push("/dashboard")}
      />
    </motion.div>
  );
};
