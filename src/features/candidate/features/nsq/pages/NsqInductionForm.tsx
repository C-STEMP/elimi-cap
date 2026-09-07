"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiArrowRight,
  FiInfo,
  FiPlus,
  FiTrash2,
  FiUploadCloud,
  FiCalendar,
  FiEdit3,
  FiCheck,
} from "react-icons/fi";
import { Input } from "@/src/components/ui/input";
import { Select, SelectOption } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setNsqApplication } from "@/src/store/slices/onboardingSlice";
import {
  useGetTradesBySector,
  useGetUnitsByTrade,
  useGetSectors,
} from "@/src/features/shared/reference/hooks";
import {
  getCentresApi,
  getSectorsApi,
  getTradesBySectorApi,
} from "@/src/features/shared/reference/api";
import { useGetMeProfile } from "@/src/features/shared/account/hooks";
import { useUploadFile } from "@/src/features/shared/storage/hooks";
import {
  createApplicationApi,
  getApplicationsApi,
  submitApplicationApi,
  submitInductionFormApi,
} from "@/src/features/shared/applications/api";
import { APPLICATION_QUERY_KEYS } from "@/src/features/shared/applications/hooks";
import { UploadSignatureModal } from "@/src/features/candidate/features/Application/components/UploadSignatureModal";
import { useCandidateProfileSignature } from "@/src/features/shared/onboarding/hooks";
import { NsqConfirmationModal } from "../components/NsqConfirmationModal";
import { NsqSuccessModal } from "../components/NsqSuccessModal";

const LEVEL_OPTIONS: SelectOption[] = [
  { label: "Level 1", value: "Level 1" },
  { label: "Level 2", value: "Level 2" },
  { label: "Level 3", value: "Level 3" },
  { label: "Level 4", value: "Level 4" },
  { label: "Level 5", value: "Level 5" },
];

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
  { label: "Master's Degree / Postgraduate", value: "Master's Degree" },
  { label: "None", value: "None" },
  { label: "Other", value: "Other" },
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
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saved = useAppSelector((state) => state.onboarding.nsqApplication);
  const authUser = useAppSelector((state) => state.auth.user);
  const { data: meProfile } = useGetMeProfile();
  const { data: profileSignature } = useCandidateProfileSignature();
  const uploadFileMutation = useUploadFile();
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  // Form Fields
  const [firstName, setFirstName] = useState(
    saved.firstName ||
      meProfile?.personalDetails?.firstName ||
      authUser?.fullName?.split(" ")[0] ||
      "",
  );
  const [lastName, setLastName] = useState(
    saved.lastName ||
      meProfile?.personalDetails?.lastName ||
      authUser?.fullName?.split(" ").slice(1).join(" ") ||
      "",
  );
  const [middleName, setMiddleName] = useState(
    saved.middleName || meProfile?.personalDetails?.middleName || "",
  );
  const [registrationNo, setRegistrationNo] = useState(
    saved.registrationNo || "",
  );

  const [tradeId, setTradeId] = useState(saved.tradeId || "");
  const [level, setLevel] = useState(saved.level || "Level 1");
  const [assessmentType, setAssessmentType] = useState(
    saved.assessmentType || "Specialized",
  );
  const [courseStartDate, setCourseStartDate] = useState(
    saved.courseStartDate || new Date().toISOString().split("T")[0],
  );

  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>(
    saved.selectedUnitIds || [],
  );
  const [highestQualification, setHighestQualification] = useState(
    saved.highestQualification || "",
  );
  const [impairment, setImpairment] = useState(saved.impairment || "None");

  // Strengths & Weaknesses
  const [learningStrengths, setLearningStrengths] = useState<string[]>(
    saved.learningStrengths?.length
      ? saved.learningStrengths
      : ["Strong practical dexterity", "Quick comprehension of mechanical blueprints"],
  );
  const [newStrength, setNewStrength] = useState("");

  const [learningWeaknesses, setLearningWeaknesses] = useState<string[]>(
    saved.learningWeaknesses?.length
      ? saved.learningWeaknesses
      : ["Limited familiarity with computerized diagnostics"],
  );
  const [newWeakness, setNewWeakness] = useState("");

  // Passport & Signature
  const [passportPreview, setPassportPreview] = useState<string | null>(
    saved.passportPreview ||
      saved.passportUrl ||
      meProfile?.photo?.url ||
      authUser?.avatar ||
      null,
  );
  const [passportAssetId, setPassportAssetId] = useState(
    saved.passportAssetId || meProfile?.photo?.assetId || "",
  );

  const [signatureAssetId, setSignatureAssetId] = useState(
    saved.signatureAssetId || "",
  );
  const [signatureUrl, setSignatureUrl] = useState(saved.signatureUrl || "");
  const [isSignatureAppended, setIsSignatureAppended] = useState(
    Boolean(saved.signatureUrl || saved.signatureAssetId),
  );

  // Modals
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdAppId, setCreatedAppId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reference Data
  const { data: remoteTrades = [] } = useGetTradesBySector(saved.sectorId);
  const { data: remoteUnits = [], isLoading: isLoadingUnits } =
    useGetUnitsByTrade(tradeId || saved.tradeId);

  const tradeOptions: SelectOption[] = remoteTrades.map((t) => ({
    label: t.name,
    value: t.id,
  }));

  // Hydrate Units
  const unitsList =
    remoteUnits && remoteUnits.length > 0
      ? remoteUnits
      : [
          {
            id: "unit-1",
            title: "Health, Safety and Environmental Practices",
            referenceNumber: "UNIT 1",
            isMandatory: true,
          },
          {
            id: "unit-2",
            title: "Core Trade Fundamentals & Materials Preparation",
            referenceNumber: "UNIT 2",
            isMandatory: true,
          },
          {
            id: "unit-3",
            title: "Specialized Practical Tools & Equipment Operation",
            referenceNumber: "UNIT 3",
            isMandatory: false,
          },
          {
            id: "unit-4",
            title: "Quality Control, Inspection and Measurements",
            referenceNumber: "UNIT 4",
            isMandatory: false,
          },
          {
            id: "unit-5",
            title: "Workplace Communication & Documentation",
            referenceNumber: "UNIT 5",
            isMandatory: false,
          },
          {
            id: "unit-6",
            title: "Finishing, Packaging and Maintenance Standards",
            referenceNumber: "UNIT 6",
            isMandatory: false,
          },
        ];

  useEffect(() => {
    if (selectedUnitIds.length === 0 && unitsList.length > 0) {
      // Default to first 3 units
      setSelectedUnitIds(unitsList.slice(0, 3).map((u) => u.id));
    }
  }, [unitsList, selectedUnitIds.length]);

  useEffect(() => {
    if (!passportAssetId) {
      const assetId =
        saved.passportAssetId ||
        meProfile?.photo?.assetId ||
        meProfile?.photoAssetId ||
        meProfile?.personalDetails?.passportPhotoAssetId;
      if (assetId) {
        setPassportAssetId(assetId);
      }
    }
    if (!passportPreview) {
      const previewUrl =
        saved.passportPreview ||
        saved.passportUrl ||
        meProfile?.photo?.url ||
        meProfile?.personalDetails?.passportUrl ||
        authUser?.avatar;
      if (previewUrl) {
        setPassportPreview(previewUrl);
      }
    }
  }, [meProfile, authUser, saved, passportAssetId, passportPreview]);

  useEffect(() => {
    if (!signatureAssetId) {
      const assetId = profileSignature?.assetId || saved.signatureAssetId;
      if (assetId) {
        setSignatureAssetId(assetId);
        setIsSignatureAppended(true);
      } else {
        try {
          const local = localStorage.getItem("user_saved_signature");
          if (local) {
            const parsed = JSON.parse(local);
            if (parsed?.assetId) {
              setSignatureAssetId(parsed.assetId);
              if (parsed?.url) setSignatureUrl(parsed.url);
              setIsSignatureAppended(true);
            }
          }
        } catch {}
      }
    }
  }, [profileSignature, saved.signatureAssetId, signatureAssetId]);

  const toggleUnit = (uId: string) => {
    setSelectedUnitIds((prev) =>
      prev.includes(uId) ? prev.filter((id) => id !== uId) : [...prev, uId],
    );
  };

  const handleAddStrength = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStrength.trim()) return;
    setLearningStrengths((prev) => [...prev, newStrength.trim()]);
    setNewStrength("");
  };

  const handleRemoveStrength = (idx: number) => {
    setLearningStrengths((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddWeakness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeakness.trim()) return;
    setLearningWeaknesses((prev) => [...prev, newWeakness.trim()]);
    setNewWeakness("");
  };

  const handleRemoveWeakness = (idx: number) => {
    setLearningWeaknesses((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePassportUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPassportPreview(localUrl);

    try {
      const asset = await uploadFileMutation.mutateAsync({
        file,
        purpose: "passport",
      });
      if (asset?.assetId) {
        setPassportAssetId(asset.assetId);
        dispatch(
          setNsqApplication({
            passportAssetId: asset.assetId,
            passportPreview: asset.url || localUrl,
          }),
        );
        toast({
          type: "success",
          title: "Passport Photo Uploaded",
          description: "Your passport photo has been uploaded successfully.",
        });
      }
      if (asset?.url) {
        setPassportPreview(asset.url);
      }
    } catch {
      toast({
        type: "error",
        title: "Upload Failed",
        description: "Could not upload passport photograph. Please try again.",
      });
    }
  };

  const handleAppendSignature = () => {
    // If signature is already appended and user clicks the button ("✓ Signature Appended (Click to update)"),
    // open the upload modal so they can upload a new one / update their saved signature.
    if (isSignatureAppended && signatureAssetId) {
      setIsSignatureModalOpen(true);
      return;
    }

    // Check if there is an existing saved signature from backend profile, Redux, or localStorage
    let savedAssetId =
      signatureAssetId ||
      profileSignature?.assetId ||
      saved.signatureAssetId;
    let savedUrl =
      signatureUrl ||
      profileSignature?.url ||
      saved.signatureUrl;

    if (!savedAssetId) {
      try {
        const local = localStorage.getItem("user_saved_signature");
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed?.assetId) {
            savedAssetId = parsed.assetId;
            savedUrl = parsed.url || savedUrl;
          }
        }
      } catch {}
    }

    // A valid saved signature MUST have an assetId (non-empty string)
    if (savedAssetId && savedAssetId.trim()) {
      setIsSignatureAppended(true);
      setSignatureAssetId(savedAssetId);
      if (savedUrl) setSignatureUrl(savedUrl);
      dispatch(
        setNsqApplication({
          signatureAssetId: savedAssetId,
          signatureUrl: savedUrl || "",
        }),
      );
      toast({
        type: "success",
        title: "Signature Appended",
        description: "Your saved signature has been automatically appended.",
      });
      return;
    }

    // First time (or no valid assetId saved yet) -> ask user to upload signature!
    setIsSignatureModalOpen(true);
  };

  const handleSignatureUploadSuccess = (sig?: {
    assetId: string;
    url?: string;
  }) => {
    const assetId = sig?.assetId || "";
    const url = sig?.url || "";

    if (assetId || url) {
      setIsSignatureAppended(true);
      if (assetId) setSignatureAssetId(assetId);
      if (url) setSignatureUrl(url);

      dispatch(
        setNsqApplication({
          signatureAssetId: assetId,
          signatureUrl: url,
        }),
      );

      toast({
        type: "success",
        title: "Signature Appended",
        description: "Your signature has been uploaded and saved for future usage.",
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast({
        type: "error",
        title: "Name Required",
        description: "Please enter your first and last name.",
      });
      return;
    }

    if (selectedUnitIds.length === 0) {
      toast({
        type: "error",
        title: "Units Required",
        description: "Please select at least one unit/module.",
      });
      return;
    }

    if (!highestQualification) {
      toast({
        type: "error",
        title: "Qualification Required",
        description: "Please select your highest relevant qualification held.",
      });
      return;
    }

    if (!passportAssetId || !passportAssetId.trim()) {
      toast({
        type: "error",
        title: "Passport Photo Required",
        description: "Please upload your passport photograph before submitting.",
      });
      return;
    }

    if (!isSignatureAppended || !signatureAssetId || !signatureAssetId.trim()) {
      toast({
        type: "error",
        title: "Signature Required",
        description: "Please upload and append your signature before submitting.",
      });
      return;
    }

    // Save current form state to Redux
    dispatch(
      setNsqApplication({
        firstName,
        lastName,
        middleName,
        registrationNo,
        tradeId: tradeId || saved.tradeId,
        level,
        assessmentType,
        courseStartDate,
        selectedUnitIds,
        highestQualification,
        impairment,
        hasImpairment: impairment !== "None",
        learningStrengths,
        learningWeaknesses,
        signatureAssetId,
        signatureUrl,
        passportAssetId,
        passportPreview: passportPreview || "",
      }),
    );

    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    try {
      let activeCentreId = saved.centreId;
      let activeSectorId = saved.sectorId;
      let activeTradeId = tradeId || saved.tradeId;

      // Fallback IDs if catalogue selection state is missing
      if (!activeCentreId || !activeSectorId || !activeTradeId) {
        try {
          const [centres, sectors] = await Promise.all([
            getCentresApi(),
            getSectorsApi(),
          ]);
          if (!activeCentreId && centres.length > 0) activeCentreId = centres[0].id;
          if (!activeSectorId && sectors.length > 0) activeSectorId = sectors[0].id;
          if (activeSectorId && !activeTradeId) {
            const trades = await getTradesBySectorApi(activeSectorId);
            if (trades.length > 0) activeTradeId = trades[0].id;
          }
        } catch {
          // Fallback handled below
        }
      }

      let appId = "";

      try {
        const app = await createApplicationApi({
          type: "NSQ",
          centreId: activeCentreId,
          sectorId: activeSectorId,
          tradeId: activeTradeId,
          unitIds: selectedUnitIds,
        });

        if (app?.id) {
          appId = app.id;
        }
      } catch (createErr: any) {
        // If candidate already has an application in progress or draft for this trade
        const msg = createErr?.message || "";
        const code = createErr?.code || "";
        if (
          code === "application.trade_in_progress" ||
          code === "application.draft_exists" ||
          msg.toLowerCase().includes("in-progress") ||
          msg.toLowerCase().includes("already has") ||
          createErr?.statusCode === 409
        ) {
          const list = await getApplicationsApi();
          const match =
            list.find(
              (a) =>
                a.type === "NSQ" &&
                (a.tradeId === activeTradeId || (a.trade as any)?.id === activeTradeId) &&
                (a.status === "draft" || a.status === "in_progress"),
            ) ||
            list.find(
              (a) =>
                a.type === "NSQ" &&
                (a.status === "draft" || a.status === "in_progress"),
            );
          if (match?.id) {
            appId = match.id;
          } else {
            throw createErr;
          }
        } else {
          throw createErr;
        }
      }

      if (!appId) {
        throw new Error("Could not initialize application. Please try again.");
      }

      setCreatedAppId(appId);

      // 1. Move application to in_progress so the backend allows submitting the induction form
      try {
        await submitApplicationApi(appId);
      } catch (submitErr: any) {
        // Continue if already active or submitted
        const msg = submitErr?.message || "";
        const code = submitErr?.code || "";
        if (
          !code.includes("already") &&
          !msg.toLowerCase().includes("already") &&
          !msg.toLowerCase().includes("in_progress")
        ) {
          console.warn("Notice: submitApplicationApi:", submitErr);
        }
      }

      // 2. Submit the induction form (conforming strictly to backend schema)
      await submitInductionFormApi(appId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ...(middleName?.trim() ? { middleName: middleName.trim() } : {}),
        ...(registrationNo?.trim() ? { registrationNo: registrationNo.trim() } : {}),
        assessmentType,
        courseStartDate,
        impairment,
        learningStrengths,
        learningWeaknesses,
        passportAssetId: passportAssetId.trim(),
        signatureAssetId: signatureAssetId.trim(),
      });

      queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.all });

      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      let errorMsg =
        err?.message || "Could not submit your NSQ application. Please try again.";
      if (err?.details && Array.isArray(err.details)) {
        errorMsg =
          err.details
            .map((d: any) => `${d.field ? d.field + ": " : ""}${d.issue || d.message}`)
            .join("; ") || errorMsg;
      }
      toast({
        type: "error",
        title: "Submission Error",
        description: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/nsq/centre-info");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col justify-center select-text max-w-2xl mx-auto px-4 sm:px-0 pb-12"
    >
      <form onSubmit={handleFormSubmit} className="w-full flex flex-col gap-8">
        {/* Top Header & Passport Upload */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#a31d38] tracking-tight">
              Induction Form
            </h1>
            <p className="text-neutral-secondary text-xs sm:text-sm font-normal">
              Candidate induction details and modular unit selection
            </p>
          </div>

          {/* Top-Right Passport Box */}
          <div className="relative w-28 sm:w-32 h-32 sm:h-36 rounded-2xl border-2 border-dashed border-[#a31d38]/30 bg-[#fdf2f5] flex flex-col items-center justify-center p-2 text-center shrink-0 group overflow-hidden">
            {passportPreview ? (
              <div className="relative w-full h-full">
                <img
                  src={passportPreview}
                  alt="Passport"
                  className="w-full h-full object-cover rounded-xl"
                />
                <label className="absolute inset-0 bg-black/40 text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity rounded-xl">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePassportUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-1 cursor-pointer w-full h-full">
                <FiUploadCloud className="w-6 h-6 text-[#a31d38]" />
                <span className="text-[#a31d38] font-bold text-xs">
                  Upload Passport
                </span>
                <span className="text-gray-400 text-[10px]">
                  5mb image max size
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePassportUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Personal & Registration Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={
              <span>
                First Name<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <Input
            label={
              <span>
                Last Name<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
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

          <Select
            label={
              <span>
                Trade<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder="Select"
            options={
              tradeOptions.length > 0
                ? tradeOptions
                : [{ label: saved.tradeName || "Selected Trade", value: tradeId }]
            }
            value={tradeId}
            onChange={(e) => setTradeId(e.target.value)}
          />

          <Select
            label={
              <span>
                Level<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder="Select"
            options={LEVEL_OPTIONS}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          />

          <Select
            label={
              <span>
                Assessment Type<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder="Select"
            options={ASSESSMENT_TYPE_OPTIONS}
            value={assessmentType}
            onChange={(e) => setAssessmentType(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
              Course Start Date<span className="text-primary-solid ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={courseStartDate}
                onChange={(e) => setCourseStartDate(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#f8f9fa] text-xs font-semibold text-neutral-primary focus:outline-none focus:ring-2 focus:ring-[#fbab2a]/30 focus:border-[#fbab2a] transition-all cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section: Unit/Modules */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base sm:text-lg font-bold text-neutral-primary">
              Unit/Modules
            </h3>
            <FiInfo className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex flex-col gap-2.5">
            {unitsList.map((unit: any, idx: number) => {
              const isChecked = selectedUnitIds.includes(unit.id);
              const unitNum = unit.referenceNumber || `UNIT ${idx + 1}`;
              return (
                <div
                  key={unit.id || idx}
                  onClick={() => toggleUnit(unit.id)}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all flex items-center gap-3.5 cursor-pointer select-none ${
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
                      {unitNum}:
                    </span>
                    <span className="text-gray-600 font-medium">
                      {unit.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Highest Qualification Held */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base sm:text-lg font-bold text-neutral-primary">
              Highest Qualification Held
            </h3>
            <FiInfo className="w-4 h-4 text-gray-400" />
          </div>

          <Select
            label={
              <span>
                Relevant Qualification Held
                <span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder="Select"
            options={QUALIFICATION_OPTIONS}
            value={highestQualification}
            onChange={(e) => setHighestQualification(e.target.value)}
          />
        </div>

        {/* Section: Accessibility */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base sm:text-lg font-bold text-neutral-primary">
              Accessibility
            </h3>
            <FiInfo className="w-4 h-4 text-gray-400" />
          </div>

          <Select
            label={
              <span>
                Do you have any impairment?
                <span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder="Select"
            options={IMPAIRMENT_OPTIONS}
            value={impairment}
            onChange={(e) => setImpairment(e.target.value)}
          />
        </div>

        {/* Section: Strength and Weakness Analysis */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base sm:text-lg font-bold text-neutral-primary">
              Strength and Weakness Analysis
            </h3>
            <FiInfo className="w-4 h-4 text-gray-400" />
          </div>

          {/* Learning Strengths */}
          <div className="flex flex-col gap-2">
            <label className="text-text-dark font-semibold text-xs leading-[1.4]">
              Learning Strengths<span className="text-primary-solid ml-0.5">*</span>
            </label>

            <div className="flex flex-col gap-2">
              {learningStrengths.map((str, idx) => (
                <div
                  key={idx}
                  className="bg-[#f8f9fa] border border-gray-200 px-4 py-3 rounded-xl flex items-center justify-between gap-3 text-xs font-medium text-gray-700"
                >
                  <span>{str}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveStrength(idx)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                    title="Remove item"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add Strength"
                  value={newStrength}
                  onChange={(e) => setNewStrength(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddStrength(e);
                    }
                  }}
                  className="flex-1 h-11 px-3.5 rounded-xl border border-gray-200 bg-[#f8f9fa] text-xs font-medium text-neutral-primary focus:outline-none focus:ring-2 focus:ring-[#fbab2a]/30 focus:border-[#fbab2a] transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddStrength}
                  className="h-11 px-5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Learning Weaknesses */}
          <div className="flex flex-col gap-2 pt-2">
            <label className="text-text-dark font-semibold text-xs leading-[1.4]">
              Learning Weakness<span className="text-primary-solid ml-0.5">*</span>
            </label>

            <div className="flex flex-col gap-2">
              {learningWeaknesses.map((weak, idx) => (
                <div
                  key={idx}
                  className="bg-[#f8f9fa] border border-gray-200 px-4 py-3 rounded-xl flex items-center justify-between gap-3 text-xs font-medium text-gray-700"
                >
                  <span>{weak}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWeakness(idx)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                    title="Remove item"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add weakness"
                  value={newWeakness}
                  onChange={(e) => setNewWeakness(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddWeakness(e);
                    }
                  }}
                  className="flex-1 h-11 px-3.5 rounded-xl border border-gray-200 bg-[#f8f9fa] text-xs font-medium text-neutral-primary focus:outline-none focus:ring-2 focus:ring-[#fbab2a]/30 focus:border-[#fbab2a] transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddWeakness}
                  className="h-11 px-5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Upload Signature */}
        <div className="flex flex-col gap-2">
          <label className="text-text-dark font-semibold text-xs leading-[1.4]">
            Upload Signature<span className="text-primary-solid ml-0.5">*</span>
          </label>

          <div
            onClick={handleAppendSignature}
            className={`w-full min-h-14 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer select-none py-3 px-4 ${
              isSignatureAppended
                ? "bg-amber-50/70 border-amber-400 text-amber-800"
                : "bg-[#fffaf0] border-[#fbab2a]/40 text-[#d98200] hover:bg-[#fff5e0] hover:border-[#fbab2a]"
            }`}
          >
            {isSignatureAppended && signatureUrl && !signatureUrl.startsWith("data:image/svg") ? (
              <div className="flex items-center gap-3">
                <img
                  src={signatureUrl}
                  alt="Signature"
                  className="h-9 max-w-[120px] object-contain border border-amber-200/80 rounded-md bg-white p-1"
                />
                <div className="flex items-center gap-1.5 text-amber-800">
                  <FiEdit3 className="w-4 h-4 text-amber-800" />
                  <span>✓ Signature Appended (Click to update)</span>
                </div>
              </div>
            ) : (
              <>
                <FiEdit3 className="w-4 h-4" />
                <span>
                  {isSignatureAppended
                    ? "✓ Signature Appended (Click to update)"
                    : "Append Signature"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-neutral-secondary hover:text-neutral-primary font-semibold text-sm transition-colors cursor-pointer select-none focus:outline-none"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>

          <Button
            type="submit"
            variant="amber"
            size="lg"
            rightIcon={<FiArrowRight className="w-4 h-4" />}
            className="px-8 h-12 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-md cursor-pointer"
          >
            Submit Application
          </Button>
        </div>
      </form>

      {/* Confirmation Modal (Image 4) */}
      <NsqConfirmationModal
        isOpen={isConfirmModalOpen}
        isLoading={isSubmitting}
        onConfirm={handleConfirmSubmit}
        onClose={() => setIsConfirmModalOpen(false)}
      />

      {/* Success Modal (Image 3) */}
      <NsqSuccessModal
        isOpen={isSuccessModalOpen}
        onViewApplication={() => {
          setIsSuccessModalOpen(false);
          if (createdAppId) {
            router.push(`/dashboard/applications/${createdAppId}`);
          } else {
            router.push("/dashboard");
          }
        }}
      />

      {/* Upload Signature Modal */}
      <UploadSignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onUploadSuccess={handleSignatureUploadSuccess}
      />
    </motion.div>
  );
};
