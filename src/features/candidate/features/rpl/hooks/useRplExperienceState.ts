"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/src/components/ui/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSidebarVariant, setRplStep } from "@/store/slices/authSlice";
import { setRPLExperienceTrade } from "@/store/slices/onboardingSlice";
import { useOnboarding } from "@/src/features/candidate/features/Onboarding/hooks";
import { useRplApplicationSubmission } from "./useRplApplicationSubmission";
import {
  useGetTradeDetail,
  useGetTradesBySector,
  useGetUnitsByTrade,
} from "@/src/features/shared/reference/hooks";
import { useGetApplications } from "@/src/features/candidate/features/Application/hooks";
import { rplExperienceTradeSchema, extractZodErrors } from "@/src/lib/validation";

export const EVIDENCE_OPTIONS = [
  "Resume / CV",
  "Work Samples",
  "Employment Letter",
  "Certificates / Statements of Attainment",
  "Statements of Attainment",
  "References / Third-Party Reports",
  "Job Descriptions",
  "Photos / Videos of Work",
  "Other",
];

const parseDate = (str: string): Date | null => {
  if (!str || typeof str !== "string") return null;
  const parts = str.trim().split(/[/.-]/);
  if (parts.length === 3) {
    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, day ? month : 0, day);
    }
  }
  return null;
};

export function useRplExperienceState(onContinue?: () => void) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const { getOnboarding } = useOnboarding();
  const { saveDraft } = useRplApplicationSubmission();

  const savedTrade = useAppSelector((s) => s.onboarding.startApplication.trade);
  const savedTradeName = useAppSelector((s) => s.onboarding.startApplication.tradeName);
  const savedSector = useAppSelector((s) => s.onboarding.startApplication.sector);
  const savedRPLExperienceTrade = useAppSelector((s) => s.onboarding.rplExperienceTrade);
  const currentAppId = useAppSelector((s) => s.application.currentApplicationId);

  const { data: existingApps = [] } = useGetApplications();
  const activeApp =
    existingApps.find((a) => a.id === currentAppId) ||
    existingApps.find((a) => (a.type || "RPL").toUpperCase() === "RPL") ||
    existingApps[0];

  const appTradeName = activeApp?.trade?.name || (activeApp as any)?.tradeName || "";
  const effectiveTradeId = savedTrade || activeApp?.tradeId || "";
  const effectiveSectorId = savedSector || activeApp?.sectorId || "";

  const { data: tradeDetail } = useGetTradeDetail(effectiveTradeId);
  const { data: remoteTrades = [] } = useGetTradesBySector(effectiveSectorId);
  const { data: remoteUnits = [], isLoading: isLoadingUnits, isFetching: isFetchingUnits } = useGetUnitsByTrade(effectiveTradeId);
  const isUnitsLoading = isLoadingUnits || isFetchingUnits;

  const unitOptions = remoteUnits?.length
    ? remoteUnits.map((u) => ({
        label: u.referenceNumber ? `${u.referenceNumber}: ${u.title}` : u.title,
        value: u.id,
      }))
    : [];

  const isLikelyId = (str?: string) => {
    if (!str) return false;
    if (str === savedTrade && savedTrade.length > 15) return true;
    return /^[0-9A-Z]{20,}$/.test(str) || /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(str);
  };

  const initialTradeTitle =
    (!isLikelyId(savedRPLExperienceTrade.qualificationTitle) && savedRPLExperienceTrade.qualificationTitle) ||
    savedTradeName ||
    appTradeName ||
    tradeDetail?.name ||
    (!isLikelyId(savedTrade) ? savedTrade : "") ||
    "";

  const [form, setForm] = useState({
    qualificationTitle: initialTradeTitle,
    qualificationCode: savedRPLExperienceTrade.qualificationCode || "NOS-ELI-L3",
    completedBefore: savedRPLExperienceTrade.completedBefore || "No",
    previousAssessmentDetails: savedRPLExperienceTrade.previousAssessmentDetails || "",
    assessmentType: savedRPLExperienceTrade.assessmentType || "",
    individualUnit: savedRPLExperienceTrade.individualUnit || [],
    occupation: savedRPLExperienceTrade.occupation || "",
    yearsOfExperience: savedRPLExperienceTrade.yearsOfExperience || "",
    employments:
      savedRPLExperienceTrade.employments?.length > 0
        ? savedRPLExperienceTrade.employments
        : [{ id: "1", companyName: "", jobTitle: "", employmentType: "", startDate: "", endDate: "", responsibilities: "" }],
    reasonRPL: savedRPLExperienceTrade.reasonRPL || "",
    selectedEvidence: savedRPLExperienceTrade.selectedEvidence || [],
    otherEvidenceText: savedRPLExperienceTrade.otherEvidenceText || "",
    isSubmitting: false,
    showSuccessModal: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmDraftModal, setShowConfirmDraftModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showSavingDraftModal, setShowSavingDraftModal] = useState(false);

  useEffect(() => {
    dispatch(setSidebarVariant("rpl-form"));
    dispatch(setRplStep(2));
  }, [dispatch]);

  // Trade resolution & hydration
  useEffect(() => {
    const resolvedName = savedTradeName || appTradeName || tradeDetail?.name || remoteTrades.find((t) => t.id === savedTrade || t.id === effectiveTradeId)?.name;
    if (resolvedName) {
      setForm((prev) => (!prev.qualificationTitle || isLikelyId(prev.qualificationTitle) ? { ...prev, qualificationTitle: resolvedName } : prev));
      dispatch(setRPLExperienceTrade({ qualificationTitle: resolvedName }));
    }
  }, [savedTradeName, appTradeName, tradeDetail, remoteTrades, savedTrade, effectiveTradeId, dispatch]);

  useEffect(() => {
    if (getOnboarding.data?.data) {
      const rplExp = (getOnboarding.data.data as any)?.rplExperienceTrade;
      if (rplExp) {
        const resolvedTitle = (!isLikelyId(rplExp.qualificationTitle) && rplExp.qualificationTitle) || savedTradeName || tradeDetail?.name || (!isLikelyId(savedTrade) ? savedTrade : "") || "";
        setForm((prev) => ({ ...prev, ...rplExp, qualificationTitle: resolvedTitle || prev.qualificationTitle || savedTradeName || "" }));
        dispatch(setRPLExperienceTrade({ ...rplExp, qualificationTitle: resolvedTitle || rplExp.qualificationTitle }));
      }
    }
  }, [getOnboarding.data, savedTrade, savedTradeName, tradeDetail, dispatch]);

  const update = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    dispatch(setRPLExperienceTrade({ [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const updateEmployment = (id: string, field: string, value: any) => {
    const updated = form.employments.map((emp) => (emp.id === id ? { ...emp, [field]: value } : emp));
    setForm((prev) => ({ ...prev, employments: updated }));
    dispatch(setRPLExperienceTrade({ employments: updated }));

    const targetEmp = updated.find((emp) => emp.id === id);
    if (targetEmp && (field === "startDate" || field === "endDate")) {
      const sVal = targetEmp.startDate;
      const eVal = targetEmp.endDate;
      if (sVal && eVal) {
        const start = parseDate(sVal);
        const end = parseDate(eVal);
        if (start && end && end <= start) {
          setErrors((errs) => ({ ...errs, [`empDate_${id}`]: "End date must be greater than start date" }));
        } else {
          setErrors((errs) => ({ ...errs, [`empDate_${id}`]: "" }));
        }
      } else {
        setErrors((errs) => ({ ...errs, [`empDate_${id}`]: "" }));
      }
    } else if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addEmployment = () => {
    setForm((prev) => ({
      ...prev,
      employments: [...prev.employments, { id: Date.now().toString(), companyName: "", jobTitle: "", employmentType: "", startDate: "", endDate: "", responsibilities: "" }],
    }));
  };

  const removeEmployment = (id: string) => {
    if (form.employments.length > 1) {
      update("employments", form.employments.filter((emp) => emp.id !== id));
    }
  };

  const toggleEvidence = (item: string) => {
    const current = form.selectedEvidence;
    update("selectedEvidence", current.includes(item) ? current.filter((i) => i !== item) : [...current, item]);
  };

  const validateForm = () => {
    let valid = true;
    const newErrors: Record<string, string> = {};
    const result = rplExperienceTradeSchema.safeParse(form);
    if (!result.success) {
      Object.assign(newErrors, extractZodErrors(result));
      valid = false;
    }
    if (form.assessmentType === "Modular Assessment") {
      if (remoteUnits.length === 0) {
        newErrors.assessmentType = "No modular units are available for this trade. Please select 'Full Qualification Assessment'.";
        valid = false;
      } else if (!form.individualUnit || form.individualUnit.length === 0) {
        newErrors.individualUnit = "Please select at least one unit for Modular Assessment.";
        valid = false;
      }
    }
    form.employments.forEach((emp) => {
      if (emp.startDate && emp.endDate) {
        const start = parseDate(emp.startDate);
        const end = parseDate(emp.endDate);
        if (start && end && end <= start) {
          newErrors[`empDate_${emp.id}`] = "End date must be greater than start date";
          valid = false;
        }
      }
    });
    setErrors(newErrors);
    return valid;
  };

  const handleConfirmSaveDraft = async () => {
    setShowConfirmDraftModal(false);
    setShowSavingDraftModal(true);
    dispatch(setRPLExperienceTrade(form));
    try {
      await saveDraft();
      setShowSavingDraftModal(false);
      setShowDraftModal(true);
    } catch {
      setShowSavingDraftModal(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ type: "error", title: "Input Required", description: "Please check form errors. End date must be greater than start date." });
      return;
    }
    update("isSubmitting", true);
    dispatch(setRPLExperienceTrade(form));
    saveDraft().finally(() => {
      update("isSubmitting", false);
      toast({ type: "success", title: "Experience & Trade Saved", description: "Step 2 of 4 completed successfully!" });
      if (onContinue) onContinue();
      else router.push("/rpl/verify-identity");
    });
  };

  return {
    form, errors, isUnitsLoading, unitOptions, update, updateEmployment,
    addEmployment, removeEmployment, toggleEvidence, handleSubmit,
    showConfirmDraftModal, setShowConfirmDraftModal,
    showSavingDraftModal, showDraftModal, setShowDraftModal, handleConfirmSaveDraft,
  };
}
