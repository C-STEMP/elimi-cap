"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiInfo, FiUploadCloud } from "react-icons/fi";
import { Select, SelectOption } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { setNsqApplication } from "@/src/store/slices/onboardingSlice";
import {
  createApplicationApi,
  getApplicationsApi,
  submitApplicationApi,
  submitInductionFormApi,
} from "@/src/features/shared/applications/api";
import { getCentresApi, getSectorsApi, getTradesBySectorApi } from "@/src/features/shared/reference/api";
import { APPLICATION_QUERY_KEYS } from "@/src/features/shared/applications/hooks";
import { UploadSignatureModal } from "@/src/features/candidate/features/Application/components/UploadSignatureModal";
import { NsqConfirmationModal } from "../components/NsqConfirmationModal";
import { NsqSuccessModal } from "../components/NsqSuccessModal";
import { useNsqInductionState } from "../hooks/useNsqInductionState";
import { InductionPersonalFields } from "../components/InductionPersonalFields";
import { InductionUnitsCard } from "../components/InductionUnitsCard";
import { InductionStrengthsWeaknessesCard } from "../components/InductionStrengthsWeaknessesCard";
import { InductionPassportSignatureCard } from "../components/InductionPassportSignatureCard";

const QUALIFICATION_OPTIONS: SelectOption[] = [
  { label: "Primary School Leaving Certificate", value: "Primary School Leaving Certificate" },
  { label: "SSCE / WAEC / NECO", value: "SSCE / WAEC / NECO" },
  { label: "NABTEB / Technical Certificate", value: "NABTEB / Technical Certificate" },
  { label: "OND / National Diploma", value: "OND / National Diploma" },
  { label: "HND / Higher National Diploma", value: "HND / Higher National Diploma" },
  { label: "Bachelor's Degree (B.Sc / B.Tech / B.A)", value: "Bachelor's Degree" },
  { label: "Postgraduate Degree / Masters / PhD", value: "Postgraduate Degree" },
  { label: "Informal Apprenticeship Certificate", value: "Informal Apprenticeship Certificate" },
  { label: "No Formal Qualification", value: "None" },
];

const IMPAIRMENT_OPTIONS: SelectOption[] = [
  { label: "None", value: "None" },
  { label: "Visual Impairment", value: "Visual Impairment" },
  { label: "Hearing Impairment", value: "Hearing Impairment" },
  { label: "Physical / Mobility Impairment", value: "Physical / Mobility Impairment" },
  { label: "Speech Impairment", value: "Speech Impairment" },
  { label: "Learning Difficulty", value: "Learning Difficulty" },
  { label: "Other", value: "Other" },
];

export const NsqInductionForm: React.FC = () => {
  const s = useNsqInductionState();

  const tradeOptions: SelectOption[] = s.remoteTrades.map((t) => ({ label: t.name, value: t.id }));
  const unitsList = s.remoteUnits?.length
    ? s.remoteUnits
    : [
        { id: "unit-1", title: "Health, Safety and Environmental Practices", referenceNumber: "UNIT 1" },
        { id: "unit-2", title: "Core Trade Fundamentals & Materials Preparation", referenceNumber: "UNIT 2" },
        { id: "unit-3", title: "Specialized Practical Tools & Equipment Operation", referenceNumber: "UNIT 3" },
      ];

  const handlePassportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    s.setPassportPreview(localUrl);
    try {
      const asset = await s.uploadFileMutation.mutateAsync({ file, purpose: "passport" });
      if (asset?.assetId) {
        s.setPassportAssetId(asset.assetId);
        s.dispatch(setNsqApplication({ passportAssetId: asset.assetId, passportPreview: asset.url || localUrl }));
        s.toast({ type: "success", title: "Passport Photo Uploaded", description: "Uploaded successfully." });
      }
      if (asset?.url) s.setPassportPreview(asset.url);
    } catch {
      s.toast({ type: "error", title: "Upload Failed", description: "Could not upload passport photo." });
    }
  };

  const handleAppendSignature = () => {
    if (s.isSignatureAppended && s.signatureAssetId) {
      s.setIsSignatureModalOpen(true);
      return;
    }
    let savedAssetId = s.signatureAssetId || s.profileSignature?.assetId || s.saved.signatureAssetId;
    let savedUrl = s.signatureUrl || s.profileSignature?.url || s.saved.signatureUrl;
    if (savedAssetId?.trim()) {
      s.setIsSignatureAppended(true);
      s.setSignatureAssetId(savedAssetId);
      if (savedUrl) s.setSignatureUrl(savedUrl);
      s.dispatch(setNsqApplication({ signatureAssetId: savedAssetId, signatureUrl: savedUrl || "" }));
      s.toast({ type: "success", title: "Signature Appended", description: "Your saved signature has been appended." });
      return;
    }
    s.setIsSignatureModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!s.firstName.trim() || !s.lastName.trim()) {
      s.toast({ type: "error", title: "Name Required", description: "Please enter your first and last name." });
      return;
    }
    if (s.selectedUnitIds.length === 0) {
      s.toast({ type: "error", title: "Units Required", description: "Please select at least one unit/module." });
      return;
    }
    if (!s.highestQualification) {
      s.toast({ type: "error", title: "Qualification Required", description: "Please select your qualification." });
      return;
    }
    if (!s.passportAssetId?.trim()) {
      s.toast({ type: "error", title: "Passport Required", description: "Please upload your passport photo." });
      return;
    }
    if (!s.isSignatureAppended || !s.signatureAssetId?.trim()) {
      s.toast({ type: "error", title: "Signature Required", description: "Please append your signature." });
      return;
    }
    s.setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    s.setIsSubmitting(true);
    try {
      let activeCentreId = s.saved.centreId;
      let activeSectorId = s.saved.sectorId;
      let activeTradeId = s.tradeId || s.saved.tradeId;

      if (!activeCentreId || !activeSectorId || !activeTradeId) {
        try {
          const [centres, sectors] = await Promise.all([getCentresApi(), getSectorsApi()]);
          if (!activeCentreId && centres.length > 0) activeCentreId = centres[0].id;
          if (!activeSectorId && sectors.length > 0) activeSectorId = sectors[0].id;
          if (activeSectorId && !activeTradeId) {
            const trades = await getTradesBySectorApi(activeSectorId);
            if (trades.length > 0) activeTradeId = trades[0].id;
          }
        } catch {}
      }

      let appId = "";
      try {
        const app = await createApplicationApi({
          type: "NSQ",
          centreId: activeCentreId,
          sectorId: activeSectorId,
          tradeId: activeTradeId,
          unitIds: s.selectedUnitIds,
        });
        if (app?.id) appId = app.id;
      } catch (createErr: any) {
        const msg = createErr?.message || "";
        const code = createErr?.code || "";
        if (code === "application.trade_in_progress" || msg.includes("in-progress") || createErr?.statusCode === 409) {
          const list = await getApplicationsApi();
          const match = list.find((a) => a.type === "NSQ" && (a.status === "draft" || a.status === "in_progress"));
          if (match?.id) appId = match.id;
          else throw createErr;
        } else throw createErr;
      }

      if (!appId) throw new Error("Could not initialize application.");
      s.setCreatedAppId(appId);
      try { await submitApplicationApi(appId); } catch {}

      await submitInductionFormApi(appId, {
        firstName: s.firstName.trim(),
        lastName: s.lastName.trim(),
        ...(s.middleName?.trim() ? { middleName: s.middleName.trim() } : {}),
        ...(s.registrationNo?.trim() ? { registrationNo: s.registrationNo.trim() } : {}),
        assessmentType: s.assessmentType,
        courseStartDate: s.courseStartDate,
        impairment: s.impairment,
        learningStrengths: s.learningStrengths,
        learningWeaknesses: s.learningWeaknesses,
        passportAssetId: s.passportAssetId.trim(),
        signatureAssetId: s.signatureAssetId.trim(),
      });

      s.queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.all });
      s.setIsConfirmModalOpen(false);
      s.setIsSuccessModalOpen(true);
    } catch (err: any) {
      s.toast({ type: "error", title: "Submission Error", description: err?.message || "Could not submit form." });
    } finally {
      s.setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col justify-center select-text max-w-2xl mx-auto px-4 sm:px-0 pb-12"
    >
      <form onSubmit={handleFormSubmit} className="w-full flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#a31d38]">Induction Form</h1>
            <p className="text-neutral-secondary text-xs sm:text-sm">Candidate induction details and unit selection</p>
          </div>
          <div className="relative w-28 sm:w-32 h-32 sm:h-36 rounded-2xl border-2 border-dashed border-[#a31d38]/30 bg-[#fdf2f5] flex items-center justify-center p-2 group overflow-hidden">
            {s.passportPreview ? (
              <img src={s.passportPreview} alt="Passport" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <label className="flex flex-col items-center justify-center gap-1 cursor-pointer w-full h-full text-center">
                <FiUploadCloud className="w-6 h-6 text-[#a31d38]" />
                <span className="text-[#a31d38] font-bold text-xs">Upload Photo</span>
                <input type="file" accept="image/*" onChange={handlePassportUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>

        <InductionPersonalFields
          firstName={s.firstName} setFirstName={s.setFirstName}
          lastName={s.lastName} setLastName={s.setLastName}
          middleName={s.middleName} setMiddleName={s.setMiddleName}
          registrationNo={s.registrationNo} setRegistrationNo={s.setRegistrationNo}
          tradeId={s.tradeId} setTradeId={s.setTradeId}
          tradeOptions={tradeOptions}
          level={s.level} setLevel={s.setLevel}
          assessmentType={s.assessmentType} setAssessmentType={s.setAssessmentType}
          courseStartDate={s.courseStartDate} setCourseStartDate={s.setCourseStartDate}
        />

        <InductionUnitsCard
          unitsList={unitsList}
          selectedUnitIds={s.selectedUnitIds}
          onToggleUnit={(id) => s.setSelectedUnitIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])}
        />

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base sm:text-lg font-bold text-neutral-primary">Highest Qualification Held</h3>
            <FiInfo className="w-4 h-4 text-gray-400" />
          </div>
          <Select
            placeholder="Select qualification"
            options={QUALIFICATION_OPTIONS}
            value={s.highestQualification}
            onChange={(e) => s.setHighestQualification(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-base sm:text-lg font-bold text-neutral-primary">Impairment / Disability</h3>
          <Select
            placeholder="Select impairment"
            options={IMPAIRMENT_OPTIONS}
            value={s.impairment}
            onChange={(e) => s.setImpairment(e.target.value)}
          />
        </div>

        <InductionStrengthsWeaknessesCard
          learningStrengths={s.learningStrengths}
          newStrength={s.newStrength}
          setNewStrength={s.setNewStrength}
          onAddStrength={(e) => { e.preventDefault(); if (s.newStrength.trim()) { s.setLearningStrengths((prev) => [...prev, s.newStrength.trim()]); s.setNewStrength(""); } }}
          onRemoveStrength={(idx) => s.setLearningStrengths((prev) => prev.filter((_, i) => i !== idx))}
          learningWeaknesses={s.learningWeaknesses}
          newWeakness={s.newWeakness}
          setNewWeakness={s.setNewWeakness}
          onAddWeakness={(e) => { e.preventDefault(); if (s.newWeakness.trim()) { s.setLearningWeaknesses((prev) => [...prev, s.newWeakness.trim()]); s.setNewWeakness(""); } }}
          onRemoveWeakness={(idx) => s.setLearningWeaknesses((prev) => prev.filter((_, i) => i !== idx))}
        />

        <InductionPassportSignatureCard
          passportPreview={s.passportPreview}
          onPassportUpload={handlePassportUpload}
          isSignatureAppended={s.isSignatureAppended}
          signatureUrl={s.signatureUrl}
          onAppendSignature={handleAppendSignature}
        />

        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={() => s.router.push("/nsq/centre-info")}>
            <FiArrowLeft className="mr-2" /> Back
          </Button>
          <Button type="submit" variant="amber" className="bg-[#fbab2a] text-white">
            Submit Application <FiArrowRight className="ml-2" />
          </Button>
        </div>
      </form>

      <NsqConfirmationModal
        isOpen={s.isConfirmModalOpen}
        isLoading={s.isSubmitting}
        onConfirm={handleConfirmSubmit}
        onClose={() => s.setIsConfirmModalOpen(false)}
      />
      <NsqSuccessModal
        isOpen={s.isSuccessModalOpen}
        onViewApplication={() => {
          s.setIsSuccessModalOpen(false);
          s.router.push(s.createdAppId ? `/dashboard/applications/${s.createdAppId}` : "/dashboard");
        }}
      />
      <UploadSignatureModal
        isOpen={s.isSignatureModalOpen}
        onClose={() => s.setIsSignatureModalOpen(false)}
        onUploadSuccess={(sig) => {
          if (sig?.assetId) {
            s.setIsSignatureAppended(true);
            s.setSignatureAssetId(sig.assetId);
            if (sig.url) s.setSignatureUrl(sig.url);
          }
        }}
      />
    </motion.div>
  );
};
