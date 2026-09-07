"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/src/components/ui/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSidebarVariant, setRplStep } from "@/store/slices/authSlice";
import { setPersonalInfo } from "@/store/slices/onboardingSlice";
import { personalInfoSchema, extractZodErrors } from "@/src/lib/validation";
import { useCountryStateCity } from "@/src/lib/hooks/useCountryStateCity";
import { useOnboarding } from "@/src/features/candidate/features/Onboarding/hooks";
import { useRplApplicationSubmission } from "./useRplApplicationSubmission";
import { parseImpairmentString } from "@/features/candidate/utils";

export function useRplPersonalInfoState(onSuccess?: () => void) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const { getOnboarding } = useOnboarding();
  const { saveDraft } = useRplApplicationSubmission();

  const authUser = useAppSelector((s) => s.auth.user);
  const savedPersonalInfo = useAppSelector((s) => s.onboarding.personalInfo);
  const initialEmail = savedPersonalInfo.email || authUser?.email || "";

  const [form, setForm] = useState({
    firstName: savedPersonalInfo.firstName ?? "",
    lastName: savedPersonalInfo.lastName ?? "",
    middleName: savedPersonalInfo.middleName ?? "",
    dob: savedPersonalInfo.dob ?? "",
    gender: savedPersonalInfo.gender ?? "",
    nationality: savedPersonalInfo.nationality ?? "",
    email: initialEmail,
    phoneNumber: savedPersonalInfo.phoneNumber ?? "",
    country: savedPersonalInfo.country || "Nigeria",
    state: savedPersonalInfo.state ?? "",
    lga: savedPersonalInfo.lga ?? "",
    streetAddress: savedPersonalInfo.streetAddress ?? "",
    completedBefore: "no",
    learnerId: "",
    impairment: savedPersonalInfo.impairment ?? "None / No impairment",
  });

  const initialImpairmentState = parseImpairmentString(savedPersonalInfo.impairment);
  const [selectedImpairments, setSelectedImpairments] = useState<string[]>(initialImpairmentState.list);
  const [otherImpairment, setOtherImpairment] = useState(initialImpairmentState.otherText);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportDefaultImage, setPassportDefaultImage] = useState<string>(savedPersonalInfo.passportUrl || "");
  const [passportError, setPassportError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDraftModal, setShowConfirmDraftModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);

  useEffect(() => {
    dispatch(setSidebarVariant("rpl-form"));
    dispatch(setRplStep(1));
  }, [dispatch]);

  useEffect(() => {
    if (getOnboarding.data?.data) {
      const apiData = getOnboarding.data.data as any;
      const pd = apiData?.personalDetails;
      const ci = apiData?.contactInformation;
      const ra = apiData?.residentialAddress;
      const acc = apiData?.accessibility;
      const passportAssetId: string = apiData?.passportAssetId ?? "";
      const passportUrl: string = apiData?.passportUrl ?? "";
      const hydratedEmail = ci?.emailAddress || savedPersonalInfo.email || authUser?.email || "";
      const rawImpairment = acc?.impairment || savedPersonalInfo.impairment || "None / No impairment";
      const parsed = parseImpairmentString(rawImpairment);

      const hydrated = {
        firstName: pd?.firstName || savedPersonalInfo.firstName || "",
        lastName: pd?.lastName || savedPersonalInfo.lastName || "",
        middleName: pd?.middleName || savedPersonalInfo.middleName || "",
        dob: pd?.dob || savedPersonalInfo.dob || "",
        gender: pd?.gender || savedPersonalInfo.gender || "",
        nationality: pd?.nationality || savedPersonalInfo.nationality || "",
        email: hydratedEmail,
        phoneNumber: ci?.phoneNumber?.number || savedPersonalInfo.phoneNumber || "",
        country: ra?.country || savedPersonalInfo.country || "Nigeria",
        state: ra?.state || savedPersonalInfo.state || "",
        lga: ra?.lga || savedPersonalInfo.lga || "",
        streetAddress: ra?.address || savedPersonalInfo.streetAddress || "",
        impairment: parsed.list.map((imp) => (imp === "Other" && parsed.otherText ? `Other: ${parsed.otherText}` : imp)).join(", "),
      };

      setForm((prev) => ({ ...prev, ...hydrated }));
      setSelectedImpairments(parsed.list);
      setOtherImpairment(parsed.otherText);
      dispatch(setPersonalInfo(hydrated));

      if (passportAssetId || passportUrl) {
        dispatch(setPersonalInfo({ passportAssetId, passportUrl }));
        setPassportDefaultImage(passportUrl || savedPersonalInfo.passportUrl || "");
      } else if (savedPersonalInfo.passportUrl) {
        setPassportDefaultImage(savedPersonalInfo.passportUrl);
      }
    } else if (authUser?.email && !form.email) {
      setForm((prev) => ({ ...prev, email: authUser.email || "" }));
    }
  }, [getOnboarding.data, authUser?.email]);

  const { countries, states, cities, isLoadingStates, isLoadingLgas } = useCountryStateCity(form.country, form.state);

  const update = (field: keyof typeof form, value: string) => {
    let nextState = form.state;
    let nextLga = form.lga;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "country" && prev.country !== value) {
        next.state = "";
        next.lga = "";
      }
      if (field === "state" && prev.state !== value) {
        next.lga = "";
      }
      nextState = next.state;
      nextLga = next.lga;
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
      newErrors.learnerId = "Learner ID is required";
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
    const resolved = selectedImpairments.map((imp) => (imp === "Other" ? `Other: ${otherImpairment}` : imp)).join(", ");
    dispatch(setPersonalInfo({ ...form, email: form.email || authUser?.email || "", impairment: resolved, passportFileName: passportFile?.name ?? savedPersonalInfo.passportFileName }));
    await saveDraft();
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
        impairment: "Impairment status", otherImpairment: "Other impairment specification", learnerId: "Learner ID",
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
    const resolved = selectedImpairments.map((imp) => (imp === "Other" ? `Other: ${otherImpairment}` : imp)).join(", ");
    dispatch(setPersonalInfo({ ...form, email: form.email || authUser?.email || "", impairment: resolved, passportFileName: passportFile?.name ?? savedPersonalInfo.passportFileName }));
    saveDraft().finally(() => {
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
