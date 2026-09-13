"use client";

import React, { useState } from "react";
import { Modal } from "antd";
import { FiX, FiPlus, FiTrash2, FiUploadCloud, FiEdit3, FiCheck, FiInfo } from "react-icons/fi";
import { Input } from "@/src/components/ui/input";
import { Select, SelectOption } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useUploadFile } from "@/src/features/shared/storage/hooks";
import { useCandidateProfileSignature } from "@/src/features/shared/onboarding/hooks";
import { useSubmitInductionForm } from "@/src/features/shared/applications/hooks";
import { UploadSignatureModal } from "../UploadSignatureModal";

const ASSESSMENT_TYPE_OPTIONS: SelectOption[] = [
  { label: "Specialized", value: "Specialized" },
  { label: "Modular", value: "Modular" },
  { label: "Full Qualification", value: "Full Qualification" },
];

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

export interface InductionUnitOption {
  id: string;
  unitNo: string;
  title: string;
  qualificationLevelId?: string;
}

export interface InductionQualificationLevelOption {
  id: string;
  level: number;
  slug?: string;
}

interface NsqCompleteInductionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  tradeName: string;
  levelName: string;
  qualificationLevels?: InductionQualificationLevelOption[];
  defaultQualificationLevelId?: string;
  candidateName?: string;
  availableUnits: InductionUnitOption[];
  defaultSelectedUnitIds?: string[];
  onSubmitted?: () => void;
}

export const NsqCompleteInductionFormModal: React.FC<
  NsqCompleteInductionFormModalProps
> = ({
  isOpen,
  onClose,
  applicationId,
  tradeName,
  levelName,
  qualificationLevels = [],
  defaultQualificationLevelId,
  candidateName = "",
  availableUnits,
  defaultSelectedUnitIds,
  onSubmitted,
}) => {
  const { toast } = useToast();
  const { data: profileSignature } = useCandidateProfileSignature();
  const uploadMutation = useUploadFile();
  const submitMutation = useSubmitInductionForm(applicationId);

  const [nameParts] = useState(() => candidateName.trim().split(/\s+/));
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [middleName, setMiddleName] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [assessmentType, setAssessmentType] = useState("Full Qualification");
  const [courseStartDate, setCourseStartDate] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState<string>(
    defaultQualificationLevelId || qualificationLevels[0]?.id || "",
  );

  const levelOptions: SelectOption[] = qualificationLevels.map((lvl) => ({
    label: lvl.slug ? `Level ${lvl.level} (${lvl.slug})` : `Level ${lvl.level}`,
    value: lvl.id,
  }));

  // Units are shared across qualification levels in the same trade, so only
  // show the ones that belong to whichever level is currently selected.
  const unitsForSelectedLevel = selectedLevelId
    ? availableUnits.filter(
        (u) => !u.qualificationLevelId || u.qualificationLevelId === selectedLevelId,
      )
    : availableUnits;

  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>(
    defaultSelectedUnitIds && defaultSelectedUnitIds.length > 0
      ? defaultSelectedUnitIds
      : unitsForSelectedLevel.map((u) => u.id),
  );
  const [relevantQualification, setRelevantQualification] = useState("");
  const [impairment, setImpairment] = useState("None");
  const [learningStrengths, setLearningStrengths] = useState<string[]>([]);
  const [newStrength, setNewStrength] = useState("");
  const [learningWeaknesses, setLearningWeaknesses] = useState<string[]>([]);
  const [newWeakness, setNewWeakness] = useState("");
  const [passportAssetId, setPassportAssetId] = useState<string | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const [isUploadingPassport, setIsUploadingPassport] = useState(false);
  const [signatureAssetId, setSignatureAssetId] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleUnit = (id: string) => {
    setSelectedUnitIds((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id],
    );
  };

  // Modular assessment means only a subset of units — clear the default
  // "all selected" state so the candidate actively picks which ones apply.
  // Switching back to a full assessment type restores the full selection.
  const handleAssessmentTypeChange = (value: string) => {
    setAssessmentType(value);
    setSelectedUnitIds(value === "Modular" ? [] : unitsForSelectedLevel.map((u) => u.id));
  };

  // The unit catalogue is scoped per qualification level, so switching level
  // re-pools which units are selectable (and re-applies the same
  // Modular/full-selection default the assessment type uses above).
  const handleLevelChange = (levelId: string) => {
    setSelectedLevelId(levelId);
    const poolIds = availableUnits
      .filter((u) => !u.qualificationLevelId || u.qualificationLevelId === levelId)
      .map((u) => u.id);
    setSelectedUnitIds(assessmentType === "Modular" ? [] : poolIds);
  };

  const handlePassportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPassportPreview(localUrl);
    setIsUploadingPassport(true);
    try {
      const asset = await uploadMutation.mutateAsync({ file, purpose: "passport" });
      if (asset?.assetId) {
        setPassportAssetId(asset.assetId);
        if (asset.url) setPassportPreview(asset.url);
      }
    } catch {
      setPassportPreview(null);
      toast({
        type: "error",
        title: "Upload Failed",
        description: "Could not upload passport photo. Please try again.",
      });
    } finally {
      setIsUploadingPassport(false);
    }
  };

  const handleAppendSignature = () => {
    if (profileSignature?.assetId) {
      setSignatureAssetId(profileSignature.assetId);
      setSignatureUrl(profileSignature.url || null);
      toast({
        type: "success",
        title: "Signature Appended",
        description: "Your saved signature has been appended.",
      });
      return;
    }
    setIsSignatureModalOpen(true);
  };

  const addStrength = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStrength.trim()) return;
    setLearningStrengths((prev) => [...prev, newStrength.trim()]);
    setNewStrength("");
  };

  const addWeakness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeakness.trim()) return;
    setLearningWeaknesses((prev) => [...prev, newWeakness.trim()]);
    setNewWeakness("");
  };

  const resolvedSignatureAssetId = signatureAssetId || profileSignature?.assetId || null;
  const resolvedSignatureUrl = signatureUrl || profileSignature?.url || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast({ type: "error", title: "Name Required", description: "Please enter your first and last name." });
      return;
    }
    if (!selectedLevelId) {
      toast({ type: "error", title: "Level Required", description: "Please select your qualification level." });
      return;
    }
    if (selectedUnitIds.length === 0) {
      toast({ type: "error", title: "Units Required", description: "Please select at least one unit/module." });
      return;
    }
    if (!relevantQualification) {
      toast({ type: "error", title: "Qualification Required", description: "Please select your highest qualification held." });
      return;
    }
    if (!passportAssetId) {
      toast({ type: "error", title: "Passport Required", description: "Please upload your passport photo." });
      return;
    }
    if (!resolvedSignatureAssetId) {
      toast({ type: "error", title: "Signature Required", description: "Please append your signature." });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync({
        submit: true,
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          middleName: middleName.trim() || undefined,
          registrationNo: registrationNo.trim() || undefined,
          qualificationLevelId: selectedLevelId,
          assessmentType,
          courseStartDate: courseStartDate || undefined,
          unitIds: selectedUnitIds,
          relevantQualification,
          hasImpairment: impairment !== "None",
          impairment: impairment !== "None" ? impairment : undefined,
          learningStrengths,
          learningWeaknesses,
          passportAssetId,
          signatureAssetId: resolvedSignatureAssetId,
        },
      });
      toast({
        type: "success",
        title: "Induction Form Submitted",
        description: "Your induction form has been submitted successfully.",
      });
      onSubmitted?.();
      onClose();
    } catch (err: any) {
      toast({
        type: "error",
        title: "Submission Failed",
        description: err?.message || "Could not submit the induction form. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={isSubmitting ? () => {} : onClose}
        footer={null}
        centered
        closable={false}
        width={680}
        styles={{ body: { padding: 20, maxHeight: "80vh", overflowY: "auto" } }}
      >
        <div className="relative flex flex-col gap-6 p-2 sm:p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-0 right-0 w-8 h-8 rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 flex items-center justify-center cursor-pointer transition-colors"
            title="Close modal"
          >
            <FiX className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div className="flex flex-col text-left mt-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
              Induction Form
            </h3>
            <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-1">
              Complete your candidate registration details for {tradeName} ({levelName})
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={<span>First Name<span className="text-primary-solid ml-0.5">*</span></span>}
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                label={<span>Last Name<span className="text-primary-solid ml-0.5">*</span></span>}
                placeholder="Surname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <Input
                label="Middle Name"
                placeholder="Other names"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
              <Input
                label="Registration No."
                placeholder="Type here"
                value={registrationNo}
                onChange={(e) => setRegistrationNo(e.target.value)}
              />
              {levelOptions.length > 0 && (
                <Select
                  label={<span>Qualification Level<span className="text-primary-solid ml-0.5">*</span></span>}
                  placeholder="Select"
                  options={levelOptions}
                  value={selectedLevelId}
                  onChange={(e) => handleLevelChange(e.target.value)}
                />
              )}
              <Select
                label={<span>Assessment Type<span className="text-primary-solid ml-0.5">*</span></span>}
                placeholder="Select"
                options={ASSESSMENT_TYPE_OPTIONS}
                value={assessmentType}
                onChange={(e) => handleAssessmentTypeChange(e.target.value)}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
                  Course Start Date<span className="text-primary-solid ml-0.5">*</span>
                </label>
                <input
                  type="date"
                  value={courseStartDate}
                  onChange={(e) => setCourseStartDate(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#f8f9fa] text-xs font-semibold text-neutral-primary focus:outline-none focus:ring-2 focus:ring-[#fbab2a]/30 focus:border-[#fbab2a] transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Units */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm sm:text-base font-bold text-neutral-primary">Unit/Modules</h4>
                <FiInfo className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex flex-col gap-2.5">
                {unitsForSelectedLevel.length === 0 && (
                  <p className="text-xs text-gray-400 font-medium py-1">
                    No units found for this trade yet.
                  </p>
                )}
                {unitsForSelectedLevel.map((unit) => {
                  const isChecked = selectedUnitIds.includes(unit.id);
                  return (
                    <div
                      key={unit.id}
                      onClick={() => toggleUnit(unit.id)}
                      className={`p-3.5 rounded-xl border transition-all flex items-center gap-3.5 cursor-pointer select-none ${
                        isChecked
                          ? "bg-[#fdf2f5] border-[#a31d38]/30 shadow-xs"
                          : "bg-[#f8f9fa] border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                          isChecked
                            ? "bg-[#a31d38] border-[#a31d38] text-white"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {isChecked && <FiCheck className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                        <span className="font-extrabold text-neutral-primary shrink-0 uppercase">
                          {unit.unitNo}:
                        </span>
                        <span className="text-gray-600 font-medium">{unit.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Select
              label={<span>Highest Qualification Held<span className="text-primary-solid ml-0.5">*</span></span>}
              placeholder="Select"
              options={QUALIFICATION_OPTIONS}
              value={relevantQualification}
              onChange={(e) => setRelevantQualification(e.target.value)}
            />

            <Select
              label="Do you have any impairment?"
              placeholder="Select"
              options={IMPAIRMENT_OPTIONS}
              value={impairment}
              onChange={(e) => setImpairment(e.target.value)}
            />

            {/* Strengths & Weaknesses */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm sm:text-base font-bold text-neutral-primary">Learning Strengths</h4>
              <div className="flex flex-wrap gap-2">
                {learningStrengths.map((st, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fdf2f5] text-[#a31d38] text-xs font-semibold border border-[#a31d38]/20"
                  >
                    <span>{st}</span>
                    <button type="button" onClick={() => setLearningStrengths((prev) => prev.filter((_, i) => i !== idx))} className="hover:text-red-700 cursor-pointer">
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a strength..."
                  value={newStrength}
                  onChange={(e) => setNewStrength(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-[#f8f9fa] text-xs"
                />
                <Button type="button" size="sm" variant="outline" onClick={addStrength}>
                  <FiPlus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-sm sm:text-base font-bold text-neutral-primary">Learning Weaknesses</h4>
              <div className="flex flex-wrap gap-2">
                {learningWeaknesses.map((wk, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200"
                  >
                    <span>{wk}</span>
                    <button type="button" onClick={() => setLearningWeaknesses((prev) => prev.filter((_, i) => i !== idx))} className="hover:text-red-700 cursor-pointer">
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a weakness / area for improvement..."
                  value={newWeakness}
                  onChange={(e) => setNewWeakness(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-[#f8f9fa] text-xs"
                />
                <Button type="button" size="sm" variant="outline" onClick={addWeakness}>
                  <FiPlus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>
            </div>

            {/* Passport */}
            <div className="flex flex-col gap-1.5">
              <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
                Upload Passport<span className="text-primary-solid ml-0.5">*</span>
              </label>
              <label className="border-2 border-dashed border-[#a31d38]/30 bg-[#fdf2f5] hover:bg-[#fbe8ed] rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group select-none">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handlePassportUpload}
                  className="hidden"
                  disabled={isUploadingPassport}
                />
                {passportPreview ? (
                  <img src={passportPreview} alt="Passport preview" className="h-20 w-20 object-cover rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <FiUploadCloud className="w-5 h-5 text-[#a31d38] group-hover:-translate-y-0.5 transition-transform" />
                    <span className="text-[#a31d38] font-bold text-xs">
                      {isUploadingPassport ? "Uploading..." : "Upload Passport"}
                    </span>
                    <span className="text-gray-400 text-[10px] font-medium">5mb image max size</span>
                  </div>
                )}
              </label>
            </div>

            {/* Signature */}
            <div className="flex flex-col gap-2">
              <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
                Append Signature<span className="text-primary-solid ml-0.5">*</span>
              </label>
              <div
                onClick={handleAppendSignature}
                className={`w-full min-h-14 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer select-none py-3 px-4 ${
                  resolvedSignatureAssetId
                    ? "bg-amber-50/70 border-amber-400 text-amber-800"
                    : "bg-[#fffaf0] border-[#fbab2a]/40 text-[#d98200] hover:bg-[#fff5e0] hover:border-[#fbab2a]"
                }`}
              >
                {resolvedSignatureAssetId ? (
                  <div className="flex items-center gap-3">
                    {resolvedSignatureUrl && (
                      <img src={resolvedSignatureUrl} alt="Signature" className="h-9 max-w-[120px] object-contain border border-amber-200/80 rounded-md bg-white p-1" />
                    )}
                    <div className="flex items-center gap-1.5 text-amber-800">
                      <FiEdit3 className="w-4 h-4" />
                      <span>Signature Appended (Click to update)</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <FiEdit3 className="w-4 h-4" />
                    <span>Append Signature</span>
                  </>
                )}
              </div>
            </div>

            <Button
              type="submit"
              variant="amber"
              size="lg"
              loading={isSubmitting}
              className="w-full h-12 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-md mt-2 cursor-pointer"
            >
              Submit Application
            </Button>
          </form>
        </div>
      </Modal>

      <UploadSignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onUploadSuccess={(signature) => {
          if (signature?.assetId) {
            setSignatureAssetId(signature.assetId);
            setSignatureUrl(signature.url || null);
          }
          setIsSignatureModalOpen(false);
        }}
      />
    </>
  );
};
