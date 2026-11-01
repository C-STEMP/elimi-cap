"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/src/components/ui/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSidebarVariant, setRplStep, updateUser } from "@/store/slices/authSlice";
import { setPersonalInfo } from "@/store/slices/onboardingSlice";
import { personalInfoSchema, extractZodErrors } from "@/src/lib/validation";
import { useCountryStateCity } from "@/src/lib/hooks/useCountryStateCity";
import { useOnboarding } from "@/src/features/candidate/features/Onboarding/hooks";
import { useCandidateProfile } from "@/src/features/shared/onboarding/hooks";
import { useGetMeProfile } from "@/src/features/shared/account/hooks";
import {
  useGetApplications,
  useGetApplicationById,
} from "@/src/features/candidate/features/Application/hooks";
import {
  formatIsoToDisplayDate,
  normalizeGenderForForm,
} from "@/src/features/candidate/features/Application/utils/applicationDetailsHelpers";
import { useRplApplicationSubmission } from "./useRplApplicationSubmission";
import { parseImpairmentString } from "@/features/candidate/utils";

export function useRplPersonalInfoState(onSuccess?: () => void) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const { getOnboarding } = useOnboarding();
  const { saveDraft } = useRplApplicationSubmission();
  const { data: meProfile } = useGetMeProfile();
  const { data: candidateProfile } = useCandidateProfile(true);

  const authUser = useAppSelector((s) => s.auth.user);
  const savedPersonalInfo = useAppSelector((s) => s.onboarding.personalInfo);
  const currentAppId = useAppSelector((s) => s.application.currentApplicationId);
  const { data: existingApps = [] } = useGetApplications();

  const activeApp = React.useMemo(() => {
    return (
      existingApps.find(
        (a) =>
          a.id === currentAppId &&
          a.status !== "certified" &&
          a.status !== "rejected" &&
          a.status !== "withdrawn",
      ) ||
      existingApps.find(
        (a) =>
          (a.type || "RPL").toUpperCase() === "RPL" &&
          a.status !== "certified" &&
          a.status !== "rejected" &&
          a.status !== "withdrawn",
      )
    );
  }, [existingApps, currentAppId]);

  const { data: appDetail } = useGetApplicationById(activeApp?.id || "");
  const initialEmail = savedPersonalInfo.email || authUser?.email || "";

  const initialPassportUrl =
    savedPersonalInfo.passportUrl ||
    savedPersonalInfo.passportPreview ||
    meProfile?.photo?.url ||
    meProfile?.personalDetails?.passportUrl ||
    (candidateProfile as any)?.passportPhoto?.url ||
    (candidateProfile as any)?.photo?.url ||
    authUser?.passportUrl ||
    authUser?.avatarUrl ||
    "";

  const [form, setForm] = useState({
    firstName: savedPersonalInfo.firstName ?? "",
    lastName: savedPersonalInfo.lastName ?? "",
    middleName: savedPersonalInfo.middleName ?? "",
    dob: formatIsoToDisplayDate(savedPersonalInfo.dob, false),
    gender: normalizeGenderForForm(savedPersonalInfo.gender),
    nationality: savedPersonalInfo.nationality ?? "",
    email: initialEmail,
    phoneNumber: savedPersonalInfo.phoneNumber ?? "",
    country: savedPersonalInfo.country || "Nigeria",
    state: savedPersonalInfo.state ?? "",
    lga: savedPersonalInfo.lga ?? "",
    streetAddress: savedPersonalInfo.streetAddress ?? "",
    completedBefore: savedPersonalInfo.completedBefore || "no",
    learnerId: savedPersonalInfo.learnerId ?? "",
    impairment: savedPersonalInfo.impairment || "None / No impairment",
  });

  const initialImpairmentState = parseImpairmentString(savedPersonalInfo.impairment);
  const [selectedImpairments, setSelectedImpairments] = useState<string[]>(initialImpairmentState.list);
  const [otherImpairment, setOtherImpairment] = useState(initialImpairmentState.otherText);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportDefaultImage, setPassportDefaultImage] = useState<string>(initialPassportUrl);
  const [passportError, setPassportError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDraftModal, setShowConfirmDraftModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);

  useEffect(() => {
    dispatch(setSidebarVariant("rpl-form"));
    dispatch(setRplStep(1));
  }, [dispatch]);

  // Synchronize passport photo from meProfile, candidateProfile, or saved state if initially missing
  useEffect(() => {
    const fallbackPhotoUrl =
      meProfile?.photo?.url ||
      meProfile?.personalDetails?.passportUrl ||
      (candidateProfile as any)?.passportPhoto?.url ||
      (candidateProfile as any)?.photo?.url ||
      authUser?.passportUrl ||
      authUser?.avatarUrl ||
      savedPersonalInfo.passportUrl ||
      "";

    const fallbackPhotoAssetId =
      meProfile?.photoAssetId ||
      meProfile?.personalDetails?.passportPhotoAssetId ||
      savedPersonalInfo.passportAssetId ||
      "";

    if (fallbackPhotoUrl && !passportDefaultImage) {
      setPassportDefaultImage(fallbackPhotoUrl);
      dispatch(
        setPersonalInfo({
          passportUrl: fallbackPhotoUrl,
          passportAssetId: fallbackPhotoAssetId,
        }),
      );
    }
  }, [
    meProfile,
    candidateProfile,
    authUser?.passportUrl,
    authUser?.avatarUrl,
    savedPersonalInfo.passportUrl,
    savedPersonalInfo.passportAssetId,
    passportDefaultImage,
    dispatch,
  ]);

  useEffect(() => {
    const apiData = getOnboarding.data?.data as any;
    const appPi = appDetail?.personalInformation;

    if (apiData || appPi) {
      const pd = apiData?.personalDetails || appPi?.personalDetails;
      const ci = apiData?.contactInformation || appPi?.contactInformation;
      const ra = apiData?.residentialAddress || appPi?.residentialAddress;
      const acc = apiData?.accessibility;
      const prevAss = apiData?.previousAssessmentStatus;

      const passportAssetId: string =
        apiData?.passportAssetId ||
        apiData?.personalDetails?.passportPhotoAssetId ||
        meProfile?.photoAssetId ||
        savedPersonalInfo.passportAssetId ||
        "";
      const passportUrl: string =
        apiData?.passportUrl ||
        apiData?.personalDetails?.passportUrl ||
        apiData?.photo?.url ||
        apiData?.passportPreview ||
        meProfile?.photo?.url ||
        (candidateProfile as any)?.passportPhoto?.url ||
        savedPersonalInfo.passportUrl ||
        authUser?.passportUrl ||
        "";
      const hydratedEmail =
        ci?.emailAddress || savedPersonalInfo.email || authUser?.email || "";
      const rawImpairment =
        (acc?.hasImpairment === false
          ? "None / No impairment"
          : acc?.impairment) ||
        savedPersonalInfo.impairment ||
        "None / No impairment";
      const parsed = parseImpairmentString(rawImpairment);

      const resolvedCompletedBefore =
        typeof prevAss?.hasCompletedPreviousAssessment === "boolean"
          ? prevAss.hasCompletedPreviousAssessment
            ? "yes"
            : "no"
          : savedPersonalInfo.completedBefore || "no";
      const resolvedLearnerId =
        (prevAss?.uniqueLearnerId && prevAss.uniqueLearnerId !== "Yes"
          ? prevAss.uniqueLearnerId
          : "") ||
        savedPersonalInfo.learnerId ||
        "";

      const hydrated = {
        firstName:
          pd?.firstName ||
          appPi?.personalDetails?.firstName ||
          savedPersonalInfo.firstName ||
          "",
        lastName:
          pd?.lastName ||
          appPi?.personalDetails?.lastName ||
          savedPersonalInfo.lastName ||
          "",
        middleName:
          pd?.middleName ||
          appPi?.personalDetails?.middleName ||
          savedPersonalInfo.middleName ||
          "",
        dob:
          formatIsoToDisplayDate(
            pd?.dob || appPi?.personalDetails?.dob || savedPersonalInfo.dob,
            false,
          ) || "",
        gender:
          normalizeGenderForForm(
            pd?.gender ||
              appPi?.personalDetails?.gender ||
              savedPersonalInfo.gender,
          ) || "",
        nationality:
          pd?.nationality ||
          appPi?.personalDetails?.nationality ||
          savedPersonalInfo.nationality ||
          "",
        email: hydratedEmail,
        phoneNumber:
          ci?.phoneNumber?.number ||
          appPi?.contactInformation?.phoneNumber?.number ||
          savedPersonalInfo.phoneNumber ||
          "",
        country:
          ra?.country ||
          appPi?.residentialAddress?.country ||
          savedPersonalInfo.country ||
          "Nigeria",
        state:
          ra?.state ||
          appPi?.residentialAddress?.state ||
          savedPersonalInfo.state ||
          "",
        lga:
          ra?.lga ||
          appPi?.residentialAddress?.lga ||
          savedPersonalInfo.lga ||
          "",
        streetAddress:
          ra?.address ||
          appPi?.residentialAddress?.address ||
          savedPersonalInfo.streetAddress ||
          "",
        completedBefore: resolvedCompletedBefore,
        learnerId: resolvedLearnerId,
        impairment: parsed.list
          .map((imp) =>
            imp === "Other" && parsed.otherText
              ? `Other: ${parsed.otherText}`
              : imp,
          )
          .join(", "),
      };

      setForm((prev) => ({
        ...prev,
        firstName: prev.firstName || hydrated.firstName,
        lastName: prev.lastName || hydrated.lastName,
        middleName: prev.middleName || hydrated.middleName,
        dob: prev.dob || hydrated.dob,
        gender: prev.gender || hydrated.gender,
        nationality: prev.nationality || hydrated.nationality,
        email: prev.email || hydrated.email,
        phoneNumber: prev.phoneNumber || hydrated.phoneNumber,
        country: prev.country || hydrated.country,
        state: prev.state || hydrated.state,
        lga: prev.lga || hydrated.lga,
        streetAddress: prev.streetAddress || hydrated.streetAddress,
        completedBefore:
          prev.completedBefore !== "no"
            ? prev.completedBefore
            : hydrated.completedBefore,
        learnerId: prev.learnerId || hydrated.learnerId,
        impairment:
          prev.impairment && prev.impairment !== "None / No impairment"
            ? prev.impairment
            : hydrated.impairment,
      }));
      setSelectedImpairments((prev) =>
        prev.length === 1 && prev[0] === "None / No impairment"
          ? parsed.list
          : prev,
      );
      setOtherImpairment((prev) => prev || parsed.otherText);
      dispatch(setPersonalInfo(hydrated));

      if (passportAssetId || passportUrl) {
        dispatch(setPersonalInfo({ passportAssetId, passportUrl }));
        setPassportDefaultImage((prev) => prev || passportUrl);
      } else if (savedPersonalInfo.passportUrl) {
        setPassportDefaultImage((prev) => prev || savedPersonalInfo.passportUrl);
      }
    } else if (authUser?.email && !form.email) {
      setForm((prev) => ({ ...prev, email: authUser.email || "" }));
    }
  }, [
    getOnboarding.data,
    appDetail,
    meProfile,
    candidateProfile,
    authUser?.email,
    authUser?.passportUrl,
    dispatch,
  ]);

  const { countries, states, cities, isLoadingStates, isLoadingLgas } = useCountryStateCity(form.country, form.state);

  const update = (field: keyof typeof form, value: string) => {
    const nextState =
      field === "country" && form.country !== value
        ? ""
        : field === "state"
          ? value
          : form.state;
    const nextLga =
      (field === "country" && form.country !== value) ||
      (field === "state" && form.state !== value)
        ? ""
        : field === "lga"
          ? value
          : form.lga;

    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "country" && prev.country !== value) {
        next.state = "";
        next.lga = "";
      }
      if (field === "state" && prev.state !== value) {
        next.lga = "";
      }
      return next;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    dispatch(setPersonalInfo({ [field]: value, state: nextState, lga: nextLga } as any));
  };

  const handleToggleImpairment = (option: string) => {
    let next: string[];
    const isExclusive = option === "None / No impairment" || option === "Prefer not to say";
    if (isExclusive) {
      next = [option];
      setOtherImpairment("");
    } else {
      const withoutExclusive = selectedImpairments.filter((x) => x !== "None / No impairment" && x !== "Prefer not to say" && x !== "None" && x !== "No");
      if (withoutExclusive.includes(option)) {
        next = withoutExclusive.filter((x) => x !== option);
        if (next.length === 0) next = ["None / No impairment"];
      } else {
        next = [...withoutExclusive, option];
      }
    }
    setSelectedImpairments(next);
    update("impairment", next.join(", "));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let valid = true;
    const hasPassport = Boolean(passportFile || passportDefaultImage || savedPersonalInfo.passportUrl || savedPersonalInfo.passportAssetId);
    if (!hasPassport) {
      setPassportError("Passport photograph is required");
      valid = false;
    } else {
      setPassportError("");
    }
    if (form.completedBefore === "yes" && !form.learnerId.trim()) {
      newErrors.learnerId = "Unique Learner Number (ULN) is required";
      valid = false;
    }
    if (selectedImpairments.length === 0) {
      newErrors.impairment = "Please select your impairment status";
      valid = false;
    } else if (selectedImpairments.includes("Other") && !otherImpairment.trim()) {
      newErrors.otherImpairment = "Please specify your impairment";
      valid = false;
    }
    const result = personalInfoSchema.safeParse(form);
    if (!result.success) {
      Object.assign(newErrors, extractZodErrors(result));
      valid = false;
    }
    setErrors(newErrors);
    return { valid: valid && Object.keys(newErrors).length === 0, hasPassport, errors: newErrors };
  };

  const handleConfirmSaveDraft = async () => {
    setShowConfirmDraftModal(false);
    const resolved = selectedImpairments
      .map((imp) => (imp === "Other" ? `Other: ${otherImpairment}` : imp))
      .join(", ");
    const updatedPersonalInfo = {
      ...form,
      email: form.email || authUser?.email || "",
      impairment: resolved,
      completedBefore: form.completedBefore,
      learnerId: form.learnerId,
      passportFileName:
        passportFile?.name ?? savedPersonalInfo.passportFileName,
      passportAssetId: savedPersonalInfo.passportAssetId,
      passportUrl: passportDefaultImage || savedPersonalInfo.passportUrl,
    };
    dispatch(setPersonalInfo(updatedPersonalInfo));
    await saveDraft({ personalInfo: updatedPersonalInfo });
    setShowDraftModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { valid, hasPassport, errors: formErrors } = validateForm();
    if (!valid) {
      const fieldLabels: Record<string, string> = {
        firstName: "First Name", lastName: "Last Name", dob: "Date of Birth", gender: "Gender",
        nationality: "Nationality", phoneNumber: "Phone Number", country: "Country",
        state: "State of Residence", lga: "City / LGA", streetAddress: "Residential Address",
        impairment: "Impairment status", otherImpairment: "Other impairment specification", learnerId: "Unique Learner Number (ULN)",
      };
      const missing = Object.keys(formErrors).map((k) => fieldLabels[k] || k).filter(Boolean);
      let desc = "";
      if (!hasPassport && missing.length > 0) desc = `Please upload passport photograph and fill: ${missing.slice(0, 3).join(", ")}.`;
      else if (!hasPassport) desc = "Please upload your passport photograph.";
      else desc = `Please complete required fields: ${missing.slice(0, 3).join(", ")}.`;
      toast({ type: "error", title: "Input Required", description: desc });
      return;
    }
    setIsSubmitting(true);
    const resolved = selectedImpairments
      .map((imp) => (imp === "Other" ? `Other: ${otherImpairment}` : imp))
      .join(", ");
    const updatedPersonalInfo = {
      ...form,
      email: form.email || authUser?.email || "",
      impairment: resolved,
      completedBefore: form.completedBefore,
      learnerId: form.learnerId,
      passportFileName:
        passportFile?.name ?? savedPersonalInfo.passportFileName,
      passportAssetId: savedPersonalInfo.passportAssetId,
      passportUrl: passportDefaultImage || savedPersonalInfo.passportUrl,
    };
    dispatch(setPersonalInfo(updatedPersonalInfo));
    saveDraft({ personalInfo: updatedPersonalInfo }).finally(() => {
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      else router.push("/rpl/experience-trade");
    });
  };

  return {
    form, errors, update, countries, states, cities, isLoadingStates, isLoadingLgas,
    passportFile, setPassportFile, passportDefaultImage, setPassportDefaultImage,
    passportError, setPassportError, isSubmitting,
    selectedImpairments, otherImpairment, setOtherImpairment, handleToggleImpairment,
    showConfirmDraftModal, setShowConfirmDraftModal, showDraftModal, setShowDraftModal,
    handleConfirmSaveDraft, handleSubmit,
  };
}
