"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/src/components/ui/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSidebarVariant, setRplStep } from "@/store/slices/authSlice";
import {
  setRPLExperienceTrade,
  setStartApplication,
} from "@/store/slices/onboardingSlice";
import { useOnboarding } from "@/src/features/candidate/features/Onboarding/hooks";
import { useRplApplicationSubmission } from "./useRplApplicationSubmission";
import {
  useGetTradeDetail,
  useGetTradesBySector,
  useGetUnitsByTrade,
} from "@/src/features/shared/reference/hooks";
import {
  useGetApplications,
  useGetApplicationById,
} from "@/src/features/candidate/features/Application/hooks";
import {
  formatIsoToDisplayDate,
  mapEvidenceFlagsToLabels,
} from "@/src/features/candidate/features/Application/utils/applicationDetailsHelpers";
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
    let day = 0;
    let month = 0;
    let year = 0;
    if (parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2].slice(0, 2), 10);
    } else {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
      if (year < 100) year += year < 40 ? 2000 : 1900;
    }
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day);
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

  const savedStartApp = useAppSelector((s) => s.onboarding.startApplication);
  const savedPersonalInfo = useAppSelector((s) => s.onboarding.personalInfo);
  const savedTrade = savedStartApp.trade;
  const savedTradeName = savedStartApp.tradeName;
  const savedSector = savedStartApp.sector;
  const savedRPLExperienceTrade = useAppSelector((s) => s.onboarding.rplExperienceTrade);
  const currentAppId = useAppSelector((s) => s.application.currentApplicationId);

  const { data: existingApps = [] } = useGetApplications();
  const activeApp =
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
    );

  const { data: appDetail } = useGetApplicationById(activeApp?.id || "");

  const appTradeName =
    appDetail?.trade?.name ||
    activeApp?.trade?.name ||
    (activeApp as any)?.tradeName ||
    "";
  const effectiveTradeId =
    savedTrade || appDetail?.tradeId || activeApp?.tradeId || "";
  const effectiveSectorId =
    savedSector || appDetail?.sectorId || activeApp?.sectorId || "";

  const { data: tradeDetail } = useGetTradeDetail(effectiveTradeId);
  const { data: remoteTrades = [] } = useGetTradesBySector(effectiveSectorId);

  const selectedLevelNumber = React.useMemo(() => {
    const qLevels = tradeDetail?.activeNosDocument?.qualificationLevels || [];
    const targetQlId =
      savedStartApp.qualificationLevelId ||
      appDetail?.qualificationLevelId ||
      appDetail?.qualificationLevel?.id;
    if (targetQlId && qLevels.length > 0) {
      const matched = qLevels.find((ql) => ql.id === targetQlId);
      if (matched) return matched.level;
    }
    if (typeof savedStartApp.levelNumber === "number" && !isNaN(savedStartApp.levelNumber)) {
      return savedStartApp.levelNumber;
    }
    if (savedStartApp.level) {
      const parsed = parseInt(String(savedStartApp.level).replace(/\D+/g, ""), 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    const detailQl = appDetail?.qualificationLevel || (activeApp as any)?.qualificationLevel;
    if (detailQl && typeof detailQl.level === "number") {
      return detailQl.level;
    }
    return undefined;
  }, [savedStartApp, tradeDetail, appDetail, activeApp]);

  const { data: remoteUnits = [], isLoading: isLoadingUnits, isFetching: isFetchingUnits } =
    useGetUnitsByTrade(effectiveTradeId, selectedLevelNumber);
  const isUnitsLoading = isLoadingUnits || isFetchingUnits;

  const scopedUnits = React.useMemo(() => {
    const qLevels = tradeDetail?.activeNosDocument?.qualificationLevels || [];
    const targetLevel = qLevels.find(
      (ql) =>
        (savedStartApp.qualificationLevelId && ql.id === savedStartApp.qualificationLevelId) ||
        (selectedLevelNumber && ql.level === selectedLevelNumber),
    );
    if (targetLevel?.units && targetLevel.units.length > 0) {
      return targetLevel.units;
    }
    return remoteUnits || [];
  }, [tradeDetail, savedStartApp.qualificationLevelId, selectedLevelNumber, remoteUnits]);

  const unitOptions = scopedUnits?.length
    ? scopedUnits.map((u) => ({
        label: u.referenceNumber ? `${u.referenceNumber}: ${u.title}` : u.title,
        value: u.id,
      }))
    : [];

  const isLikelyId = (str?: string) => {
    if (!str) return false;
    if (str === savedTrade && savedTrade.length > 15) return true;
    return /^[0-9A-Z]{20,}$/.test(str) || /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(str);
  };

  const matchedRemoteTradeName =
    remoteTrades.find((t) => t.id === effectiveTradeId || t.id === savedTrade)
      ?.name || "";

  const resolvedLockedTradeTitle =
    tradeDetail?.name ||
    matchedRemoteTradeName ||
    (!isLikelyId(savedTradeName) ? savedTradeName : "") ||
    (!isLikelyId(appTradeName) ? appTradeName : "") ||
    "";

  const initialTradeTitle =
    resolvedLockedTradeTitle ||
    (!isLikelyId(savedRPLExperienceTrade.qualificationTitle) &&
      savedRPLExperienceTrade.qualificationTitle) ||
    (!isLikelyId(savedTrade) ? savedTrade : "") ||
    "";

  const normalizeCompletedBefore = (val?: string) => {
    if (!val) return "";
    return val.trim().toLowerCase() === "yes" ? "Yes" : "No";
  };

  const initialCompletedBefore =
    (savedRPLExperienceTrade.completedBefore &&
    savedRPLExperienceTrade.completedBefore.toLowerCase() === "yes"
      ? "Yes"
      : "") ||
    normalizeCompletedBefore(savedPersonalInfo.completedBefore) ||
    normalizeCompletedBefore(savedRPLExperienceTrade.completedBefore) ||
    "No";

  const [form, setForm] = useState({
    qualificationTitle: initialTradeTitle,
    qualificationCode: savedRPLExperienceTrade.qualificationCode || "",
    completedBefore: initialCompletedBefore,
    previousAssessmentDetails:
      savedRPLExperienceTrade.previousAssessmentDetails ||
      savedPersonalInfo.learnerId ||
      "",
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
  const hasHydratedOnboardingRef = React.useRef(false);
  const hasHydratedAppDetailRef = React.useRef(false);

  useEffect(() => {
    dispatch(setSidebarVariant("rpl-form"));
    dispatch(setRplStep(2));
  }, [dispatch]);

  // Trade resolution & hydration — always lock qualificationTitle to the selected backend trade name
  useEffect(() => {
    if (!resolvedLockedTradeTitle) return;
    setForm((prev) =>
      prev.qualificationTitle !== resolvedLockedTradeTitle
        ? { ...prev, qualificationTitle: resolvedLockedTradeTitle }
        : prev,
    );
    if (savedRPLExperienceTrade.qualificationTitle !== resolvedLockedTradeTitle) {
      dispatch(
        setRPLExperienceTrade({ qualificationTitle: resolvedLockedTradeTitle }),
      );
    }
  }, [
    resolvedLockedTradeTitle,
    savedRPLExperienceTrade.qualificationTitle,
    dispatch,
  ]);

  // Hydrate from backend ApplicationDetail (unitIds, assessmentType, currentOccupation, reasonForSeekingRPL, evidenceCandidateCanProvide, qualificationLevel)
  useEffect(() => {
    if (hasHydratedAppDetailRef.current || !appDetail?.id) return;
    hasHydratedAppDetailRef.current = true;

    const qLevelId =
      appDetail.qualificationLevelId || appDetail.qualificationLevel?.id || "";
    const qLevelNum = appDetail.qualificationLevel?.level;
    if (
      qLevelId &&
      (!savedStartApp.qualificationLevelId || !savedStartApp.level)
    ) {
      dispatch(
        setStartApplication({
          ...(appDetail.centreId ? { assessmentCenter: appDetail.centreId } : {}),
          ...(appDetail.sectorId ? { sector: appDetail.sectorId } : {}),
          ...(appDetail.tradeId ? { trade: appDetail.tradeId } : {}),
          ...(appDetail.trade?.name ? { tradeName: appDetail.trade.name } : {}),
          qualificationLevelId: qLevelId,
          ...(qLevelNum !== undefined
            ? { level: String(qLevelNum), levelNumber: qLevelNum }
            : {}),
        }),
      );
    }

    const occ = appDetail.currentOccupation;
    const unitIds = Array.isArray(appDetail.unitIds) ? appDetail.unitIds : [];
    const mappedEvidence = mapEvidenceFlagsToLabels(
      appDetail.evidenceCandidateCanProvide as any,
    );
    const hasSavedExpData = Boolean(
      occ ||
        unitIds.length > 0 ||
        appDetail.reasonForSeekingRPL ||
        appDetail.evidenceCandidateCanProvide,
    );
    const resolvedAssessmentType =
      unitIds.length > 0
        ? "Modular Assessment"
        : hasSavedExpData
          ? "Full Qualification Assessment"
          : "";

    const hydratedEmployments =
      Array.isArray(occ?.employmentHistory) && occ.employmentHistory.length > 0
        ? occ.employmentHistory.map((emp, idx) => ({
            id: String(idx + 1),
            companyName: emp.company || "",
            jobTitle: emp.jobTitle || "",
            employmentType: emp.employmentType || "Full-time",
            startDate: formatIsoToDisplayDate(emp.startDate, true),
            endDate: formatIsoToDisplayDate(emp.endDate, true),
            responsibilities: emp.keyResponsibilities || "",
          }))
        : null;

    const hydratedPatch: Partial<typeof form> = {
      ...(resolvedLockedTradeTitle
        ? { qualificationTitle: resolvedLockedTradeTitle }
        : {}),
      ...(resolvedAssessmentType
        ? {
            assessmentType:
              savedRPLExperienceTrade.assessmentType || resolvedAssessmentType,
          }
        : {}),
      ...(unitIds.length > 0 &&
      (!savedRPLExperienceTrade.individualUnit ||
        savedRPLExperienceTrade.individualUnit.length === 0)
        ? { individualUnit: unitIds }
        : {}),
      ...(occ?.occupation && !savedRPLExperienceTrade.occupation
        ? { occupation: occ.occupation }
        : {}),
      ...(occ?.yearsOfExperience !== undefined &&
      !savedRPLExperienceTrade.yearsOfExperience
        ? { yearsOfExperience: String(occ.yearsOfExperience) }
        : {}),
      ...(hydratedEmployments &&
      !savedRPLExperienceTrade.employments?.some(
        (e) => e.companyName || e.jobTitle || e.startDate,
      )
        ? { employments: hydratedEmployments }
        : {}),
      ...(appDetail.reasonForSeekingRPL && !savedRPLExperienceTrade.reasonRPL
        ? { reasonRPL: appDetail.reasonForSeekingRPL }
        : {}),
      ...(mappedEvidence.length > 0 &&
      (!savedRPLExperienceTrade.selectedEvidence ||
        savedRPLExperienceTrade.selectedEvidence.length === 0)
        ? { selectedEvidence: mappedEvidence }
        : {}),
    };

    setForm((prev) => {
      const hasLocalEmployments = prev.employments?.some(
        (e) => e.companyName || e.jobTitle || e.startDate,
      );
      return {
        ...prev,
        qualificationTitle:
          resolvedLockedTradeTitle || prev.qualificationTitle,
        assessmentType: prev.assessmentType || resolvedAssessmentType,
        individualUnit:
          prev.individualUnit && prev.individualUnit.length > 0
            ? prev.individualUnit
            : unitIds,
        occupation: prev.occupation || occ?.occupation || "",
        yearsOfExperience:
          prev.yearsOfExperience ||
          (occ?.yearsOfExperience !== undefined
            ? String(occ.yearsOfExperience)
            : ""),
        employments:
          hasLocalEmployments || !hydratedEmployments
            ? prev.employments
            : hydratedEmployments,
        reasonRPL: prev.reasonRPL || appDetail.reasonForSeekingRPL || "",
        selectedEvidence:
          prev.selectedEvidence && prev.selectedEvidence.length > 0
            ? prev.selectedEvidence
            : mappedEvidence,
      };
    });

    if (Object.keys(hydratedPatch).length > 0) {
      dispatch(setRPLExperienceTrade(hydratedPatch));
    }
  }, [
    appDetail,
    resolvedLockedTradeTitle,
    savedStartApp.qualificationLevelId,
    savedStartApp.level,
    savedRPLExperienceTrade,
    dispatch,
  ]);

  // Hydrate from backend Candidate Onboarding record (previousAssessmentStatus & currentOccupation fallback)
  useEffect(() => {
    if (hasHydratedOnboardingRef.current) return;
    if (getOnboarding.data?.data) {
      hasHydratedOnboardingRef.current = true;
      const obData = getOnboarding.data.data as any;
      const rplExp = obData?.rplExperienceTrade;
      const obOcc = obData?.currentOccupation;
      const prevAss = obData?.previousAssessmentStatus;

      const lockedTradeTitle =
        resolvedLockedTradeTitle ||
        (!isLikelyId(rplExp?.qualificationTitle)
          ? rplExp?.qualificationTitle
          : "") ||
        "";

      const resolvedCompletedBefore =
        typeof prevAss?.hasCompletedPreviousAssessment === "boolean"
          ? prevAss.hasCompletedPreviousAssessment
            ? "Yes"
            : "No"
          : rplExp?.completedBefore || undefined;
      const resolvedPrevDetails =
        (prevAss?.uniqueLearnerId && prevAss.uniqueLearnerId !== "Yes"
          ? prevAss.uniqueLearnerId
          : "") ||
        rplExp?.previousAssessmentDetails ||
        "";

      const obEmployments =
        Array.isArray(obOcc?.employmentHistory) &&
        obOcc.employmentHistory.length > 0
          ? obOcc.employmentHistory.map((emp: any, idx: number) => ({
              id: String(idx + 1),
              companyName: emp.company || "",
              jobTitle: emp.jobTitle || "",
              employmentType: emp.employmentType || "Full-time",
              startDate: formatIsoToDisplayDate(emp.startDate, true),
              endDate: formatIsoToDisplayDate(emp.endDate, true),
              responsibilities: emp.keyResponsibilities || "",
            }))
          : rplExp?.employments || null;

      const obPatch: Partial<typeof form> = {
        ...(rplExp || {}),
        ...(lockedTradeTitle ? { qualificationTitle: lockedTradeTitle } : {}),
        ...(resolvedCompletedBefore &&
        (!savedRPLExperienceTrade.completedBefore ||
          savedRPLExperienceTrade.completedBefore === "No")
          ? { completedBefore: resolvedCompletedBefore }
          : {}),
        ...(resolvedPrevDetails &&
        !savedRPLExperienceTrade.previousAssessmentDetails
          ? { previousAssessmentDetails: resolvedPrevDetails }
          : {}),
        ...((obOcc?.occupation || rplExp?.occupation) &&
        !savedRPLExperienceTrade.occupation
          ? { occupation: obOcc?.occupation || rplExp?.occupation }
          : {}),
        ...(obOcc?.yearsOfExperience !== undefined &&
        !savedRPLExperienceTrade.yearsOfExperience
          ? { yearsOfExperience: String(obOcc.yearsOfExperience) }
          : {}),
        ...(obEmployments &&
        !savedRPLExperienceTrade.employments?.some(
          (e) => e.companyName || e.jobTitle || e.startDate,
        )
          ? { employments: obEmployments }
          : {}),
        ...(rplExp?.reasonRPL && !savedRPLExperienceTrade.reasonRPL
          ? { reasonRPL: rplExp.reasonRPL }
          : {}),
      };

      setForm((prev) => {
        const hasLocalEmployments = prev.employments?.some(
          (e) => e.companyName || e.jobTitle || e.startDate,
        );
        return {
          ...prev,
          ...(rplExp || {}),
          qualificationTitle: lockedTradeTitle || prev.qualificationTitle,
          completedBefore:
            prev.completedBefore && prev.completedBefore !== "No"
              ? prev.completedBefore
              : resolvedCompletedBefore || prev.completedBefore || "No",
          previousAssessmentDetails:
            prev.previousAssessmentDetails || resolvedPrevDetails,
          occupation:
            prev.occupation || obOcc?.occupation || rplExp?.occupation || "",
          yearsOfExperience:
            prev.yearsOfExperience ||
            (obOcc?.yearsOfExperience !== undefined
              ? String(obOcc.yearsOfExperience)
              : rplExp?.yearsOfExperience || ""),
          employments:
            hasLocalEmployments || !obEmployments
              ? prev.employments
              : obEmployments,
          reasonRPL: prev.reasonRPL || rplExp?.reasonRPL || "",
        };
      });

      if (Object.keys(obPatch).length > 0) {
        dispatch(setRPLExperienceTrade(obPatch));
      }
    }
  }, [
    getOnboarding.data,
    resolvedLockedTradeTitle,
    savedRPLExperienceTrade,
    dispatch,
  ]);

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
      await saveDraft({ rplExp: form });
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
    saveDraft({ rplExp: form }).finally(() => {
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
