"use client";

import React, { useEffect, useState } from "react";
import { Form } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { Select, SelectOption } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { FiArrowLeft, FiArrowRight, FiMapPin, FiChevronDown } from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setStartApplication,
  setRPLExperienceTrade,
} from "@/store/slices/onboardingSlice";
import { startApplicationSchema } from "@/src/lib/validation";

import {
  useGetApplications,
  useGetApplicationById,
  useApplication,
  useWithdrawApplication,
  usePatchApplicationDraft,
} from "@/src/features/candidate/features/Application/hooks";
import { getApplicationsApi } from "@/src/features/shared/applications/api";
import {
  useGetSectors,
  useGetCentres,
  useGetTradesBySector,
  useGetAllTrades,
  useGetTradeDetail,
  useCandidateLocation,
} from "@/src/features/shared/reference/hooks";
import { useCountryStateCity } from "@/src/lib/hooks/useCountryStateCity";
import {
  setCurrentApplication,
} from "@/store/slices/applicationSlice";

const rule = createSchemaFieldRule(startApplicationSchema);

export interface StartApplicationProps {
  onBack?: () => void;
  onContinue?: () => void;
}

interface ControlledSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  label: React.ReactNode;
  placeholder?: string;
  options: (string | SelectOption)[];
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  help?: string;
}

const FormSelect: React.FC<ControlledSelectProps> = ({
  value = "",
  onChange,
  error,
  help,
  loading,
  ...rest
}) => (
  <Select
    {...rest}
    loading={loading}
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
  />
);

export const StartApplication: React.FC<StartApplicationProps> = ({
  onBack,
  onContinue,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { createApplication } = useApplication();
  const withdrawApplication = useWithdrawApplication({ suppressToast: true });
  const patchApplicationDraft = usePatchApplicationDraft();

  const assessmentType = useAppSelector(
    (state) =>
      state.onboarding.assessmentType ||
      state.auth.user?.assessmentType ||
      "rpl",
  );

  const { data: remoteSectors = [], isLoading: isLoadingSectors } =
    useGetSectors();
  const [isLocationFilterOpen, setIsLocationFilterOpen] = useState(false);
  const [filterCountry, setFilterCountry] = useState("Nigeria");
  const [filterState, setFilterState] = useState("");
  const [filterLga, setFilterLga] = useState("");

  const {
    states,
    cities: lgas,
    isLoadingStates,
    isLoadingLgas,
  } = useCountryStateCity(filterCountry, filterState);

  const candidateLoc = useCandidateLocation();

  const selectedCentreId = Form.useWatch("assessmentCenter", form);
  const selectedSectorId = Form.useWatch("sector", form);
  const selectedTradeId = Form.useWatch("trade", form);
  const { data: allTrades = [], isLoading: isLoadingAllTrades } =
    useGetAllTrades({ enabled: Boolean(selectedCentreId) });
  const { data: remoteTrades = [], isLoading: isLoadingTrades } =
    useGetTradesBySector(selectedSectorId);
  const { data: tradeDetail, isLoading: isLoadingTradeDetail } =
    useGetTradeDetail(selectedTradeId);

  const queryLocation = React.useMemo(() => {
    return {
      country: filterCountry || candidateLoc.country || undefined,
      state: filterState || candidateLoc.state || undefined,
      lga: filterLga || candidateLoc.lga || undefined,
    };
  }, [filterCountry, filterState, filterLga, candidateLoc]);

  const { data: allLocationCentres = [], isLoading: isLoadingAllCentres } =
    useGetCentres(queryLocation);

  const remoteCentres = React.useMemo(() => {
    return Array.isArray(allLocationCentres)
      ? allLocationCentres
      : (allLocationCentres as any)?.data || [];
  }, [allLocationCentres]);

  const isLoadingCentres = isLoadingAllCentres;

  const matchingCentres = React.useMemo(() => {
    let list = Array.isArray(remoteCentres)
      ? remoteCentres
      : (remoteCentres as any)?.data || [];

    if (filterState) {
      const sMatches = list.filter((c: any) => {
        if (!c.address?.state) return false;
        const s1 = c.address.state.toLowerCase();
        const s2 = filterState.toLowerCase();
        return s1.includes(s2) || s2.includes(s1);
      });
      if (sMatches.length > 0) {
        list = sMatches;
      } else {
        list = [];
      }
    }

    if (filterLga && list.length > 0) {
      const lMatches = list.filter((c: any) => {
        if (!c.address?.lga) return false;
        const l1 = c.address.lga.toLowerCase();
        const l2 = filterLga.toLowerCase();
        return l1.includes(l2) || l2.includes(l1);
      });
      if (lMatches.length > 0) {
        list = lMatches;
      }
    }

    return list;
  }, [remoteCentres, filterState, filterLga]);

  const centreOptions: SelectOption[] = React.useMemo(() => {
    const seen = new Set<string>();
    const uniqueOptions: SelectOption[] = [];

    for (const c of matchingCentres) {
      if (!c || !c.name) continue;
      const normalized = c.name.trim().toLowerCase();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        const locParts = [c.address?.lga, c.address?.state].filter(Boolean);
        const locSuffix = locParts.length > 0 ? ` (${locParts.join(", ")})` : "";
        uniqueOptions.push({
          label: `${c.name.trim()}${locSuffix}`,
          value: c.id,
        });
      }
    }
    return uniqueOptions;
  }, [matchingCentres]);

  const handleStateFilterChange = (newState: string) => {
    setFilterState(newState);
    setFilterLga("");
    form.setFieldValue("assessmentCenter", "");
    form.setFieldValue("sector", "");
    form.setFieldValue("trade", "");
    form.setFieldValue("level", "");
  };

  const handleLgaFilterChange = (newLga: string) => {
    setFilterLga(newLga);
    form.setFieldValue("assessmentCenter", "");
    form.setFieldValue("sector", "");
    form.setFieldValue("trade", "");
    form.setFieldValue("level", "");
  };

  const handleClearLocation = () => {
    setFilterState("");
    setFilterLga("");
  };

  const selectedCentreObj = React.useMemo(
    () => remoteCentres.find((c: any) => c.id === selectedCentreId),
    [remoteCentres, selectedCentreId],
  );

  const centreOfferedTrades = React.useMemo(() => {
    return Array.isArray(selectedCentreObj?.trades)
      ? selectedCentreObj.trades
      : [];
  }, [selectedCentreObj]);

  const centreTradeIds = React.useMemo(() => {
    return new Set<string>(
      centreOfferedTrades.map((t: any) => t.id).filter(Boolean),
    );
  }, [centreOfferedTrades]);

  const availableSectors = React.useMemo(() => {
    if (!selectedCentreId || centreTradeIds.size === 0) {
      return remoteSectors;
    }
    const offeredSectorIds = new Set<string>();
    for (const ct of centreOfferedTrades) {
      if ((ct as any).sectorId) {
        offeredSectorIds.add((ct as any).sectorId);
      }
    }
    for (const t of allTrades) {
      if (centreTradeIds.has(t.id) && t.sectorId) {
        offeredSectorIds.add(t.sectorId);
      }
    }
    if (offeredSectorIds.size === 0) {
      return remoteSectors;
    }
    const filtered = remoteSectors.filter((s) => offeredSectorIds.has(s.id));
    return filtered.length > 0 ? filtered : remoteSectors;
  }, [selectedCentreId, centreTradeIds, centreOfferedTrades, allTrades, remoteSectors]);

  const availableTrades = React.useMemo(() => {
    if (!selectedCentreId || centreTradeIds.size === 0) {
      return remoteTrades;
    }
    const filtered = remoteTrades.filter((t) => centreTradeIds.has(t.id));
    return filtered.length > 0 ? filtered : remoteTrades;
  }, [selectedCentreId, centreTradeIds, remoteTrades]);

  const isLoadingAvailableSectors =
    isLoadingSectors ||
    (Boolean(selectedCentreId) && centreTradeIds.size > 0 && isLoadingAllTrades);

  const sectorOptions: SelectOption[] = availableSectors.map((s) => ({
    label: s.name,
    value: s.id,
  }));

  const tradeOptions: SelectOption[] = availableTrades.map((t) => ({
    label: t.name,
    value: t.id,
  }));

  const levelOptions: SelectOption[] = React.useMemo(() => {
    const levels =
      tradeDetail?.activeNosDocument?.qualificationLevels ||
      (tradeDetail as any)?.qualificationLevels ||
      [];
    if (Array.isArray(levels) && levels.length > 0) {
      return levels.map((lvl) => ({
        label: `Level ${lvl.level}${lvl.purpose ? ` - ${lvl.purpose}` : ""}`,
        value: String(lvl.level),
      }));
    }
    return [1, 2, 3, 4, 5].map((lvl) => ({
      label: `Level ${lvl}`,
      value: String(lvl),
    }));
  }, [tradeDetail]);

  const { data: existingApps = [] } = useGetApplications();

  const savedStartApplication = useAppSelector(
    (s) => s.onboarding.startApplication,
  );

  const activeDraftApp = React.useMemo(() => {
    const appType = assessmentType === "nsq" ? "NSQ" : "RPL";
    return existingApps.find(
      (a) =>
        (a.type || "RPL").toUpperCase() === appType &&
        a.status === "draft",
    );
  }, [existingApps, assessmentType]);

  const { data: activeDraftDetail } = useGetApplicationById(
    activeDraftApp?.id || "",
  );

  const hasHydratedRef = React.useRef(false);
  const hasHydratedLevelRef = React.useRef(false);

  useEffect(() => {
    const draftCentreId =
      activeDraftDetail?.centreId ||
      activeDraftApp?.centreId ||
      (activeDraftApp as any)?.centre?.id ||
      "";
    const draftSectorId =
      activeDraftDetail?.sectorId ||
      activeDraftApp?.sectorId ||
      (activeDraftApp as any)?.sector?.id ||
      "";
    const draftTradeId =
      activeDraftDetail?.tradeId ||
      activeDraftApp?.tradeId ||
      (activeDraftApp as any)?.trade?.id ||
      "";
    const draftLevelNum =
      activeDraftDetail?.qualificationLevel?.level ??
      (activeDraftApp as any)?.qualificationLevel?.level;
    const draftLevel =
      draftLevelNum !== undefined ? String(draftLevelNum) : "";
    const draftQlId =
      activeDraftDetail?.qualificationLevelId ||
      activeDraftDetail?.qualificationLevel?.id ||
      "";

    const resolvedCentre =
      savedStartApplication.assessmentCenter || draftCentreId;
    const resolvedSector = savedStartApplication.sector || draftSectorId;
    const resolvedTrade = savedStartApplication.trade || draftTradeId;
    const resolvedLevel = savedStartApplication.level || draftLevel;

    if (
      !hasHydratedRef.current &&
      (resolvedCentre || resolvedSector || resolvedTrade)
    ) {
      hasHydratedRef.current = true;
      const currentFields = form.getFieldsValue();
      const valuesToSet: Record<string, string> = {};
      if (resolvedCentre && !currentFields.assessmentCenter) {
        valuesToSet.assessmentCenter = resolvedCentre;
      }
      if (resolvedSector && !currentFields.sector) {
        valuesToSet.sector = resolvedSector;
      }
      if (resolvedTrade && !currentFields.trade) {
        valuesToSet.trade = resolvedTrade;
      }
      if (resolvedLevel && !currentFields.level) {
        valuesToSet.level = resolvedLevel;
        hasHydratedLevelRef.current = true;
      }
      if (Object.keys(valuesToSet).length > 0) {
        form.setFieldsValue(valuesToSet);
      }
      dispatch(
        setStartApplication({
          ...(resolvedCentre ? { assessmentCenter: resolvedCentre } : {}),
          ...(resolvedSector ? { sector: resolvedSector } : {}),
          ...(resolvedTrade ? { trade: resolvedTrade } : {}),
          ...(resolvedLevel ? { level: resolvedLevel } : {}),
          ...(draftLevelNum !== undefined ? { levelNumber: draftLevelNum } : {}),
          ...(draftQlId ? { qualificationLevelId: draftQlId } : {}),
        }),
      );
    } else if (!hasHydratedLevelRef.current && resolvedLevel) {
      hasHydratedLevelRef.current = true;
      const currentFields = form.getFieldsValue();
      if (!currentFields.level) {
        form.setFieldValue("level", resolvedLevel);
      }
      dispatch(
        setStartApplication({
          level: resolvedLevel,
          ...(draftLevelNum !== undefined ? { levelNumber: draftLevelNum } : {}),
          ...(draftQlId ? { qualificationLevelId: draftQlId } : {}),
        }),
      );
    }
  }, [
    form,
    savedStartApplication,
    activeDraftApp,
    activeDraftDetail,
    dispatch,
  ]);

  const handleValuesChange = (changedValues: Record<string, string>) => {
    if ("assessmentCenter" in changedValues) {
      form.setFieldValue("sector", "");
      form.setFieldValue("trade", "");
      form.setFieldValue("level", "");
    }
    if ("sector" in changedValues) {
      form.setFieldValue("trade", "");
      form.setFieldValue("level", "");
    }
    if ("trade" in changedValues) {
      form.setFieldValue("level", "");
    }
    const currentValues = form.getFieldsValue();
    const tradeObj = remoteTrades.find((t) => t.id === currentValues.trade);
    const sectorObj = remoteSectors.find((s) => s.id === currentValues.sector);
    const centreObj = remoteCentres.find(
      (c: any) => c.id === currentValues.assessmentCenter,
    );

    const resolvedTradeName = tradeObj?.name || currentValues.trade || "";
    const selectedLevelStr = currentValues.level || "";
    const selectedLevelNum = selectedLevelStr ? parseInt(selectedLevelStr, 10) : undefined;
    const matchedQLevel = (
      tradeDetail?.activeNosDocument?.qualificationLevels ||
      (tradeDetail as any)?.qualificationLevels ||
      []
    ).find((ql: any) => String(ql.level) === selectedLevelStr || ql.id === selectedLevelStr);

    dispatch(
      setStartApplication({
        ...currentValues,
        tradeName: resolvedTradeName,
        sectorName: sectorObj?.name || currentValues.sector,
        centreName: centreObj?.name || currentValues.assessmentCenter,
        level: selectedLevelStr,
        levelNumber: selectedLevelNum,
        qualificationLevelId: matchedQLevel?.id,
      }),
    );

    if (resolvedTradeName) {
      dispatch(
        setRPLExperienceTrade({
          qualificationTitle: resolvedTradeName,
          ...( ("level" in changedValues || "trade" in changedValues)
            ? { individualUnit: [] }
            : {}),
        }),
      );
    }
  };

  const handleFinish = (values: {
    assessmentCenter: string;
    sector: string;
    trade: string;
    level?: string;
  }) => {
    const appType = assessmentType === "nsq" ? "NSQ" : "RPL";

    if (!values.assessmentCenter || !values.sector || !values.trade) {
      toast({
        type: "error",
        title: "Required Fields",
        description: "Please select an assessment centre, sector, and trade.",
      });
      return;
    }

    const qLevels =
      tradeDetail?.activeNosDocument?.qualificationLevels ||
      (tradeDetail as any)?.qualificationLevels ||
      [];
    const selectedLevelStr = values.level || "";
    const selectedLevelNum = selectedLevelStr ? parseInt(selectedLevelStr, 10) : undefined;
    const matchedQLevel =
      qLevels.find(
        (ql: any) =>
          String(ql.level) === selectedLevelStr || ql.id === selectedLevelStr,
      ) ||
      qLevels.find((ql: any) => ql.level === 3) ||
      qLevels[0];

    if (appType === "RPL" && !matchedQLevel?.id) {
      toast({
        type: "error",
        title: "Level Required",
        description: "Please select a qualification level to continue.",
      });
      return;
    }

    const tradeObj = remoteTrades.find((t) => t.id === values.trade);
    const tradeName = tradeObj?.name || values.trade;
    const sectorObj = remoteSectors.find((s) => s.id === values.sector);
    const sectorName = sectorObj?.name || values.sector;
    const centreObj = remoteCentres.find(
      (c: any) => c.id === values.assessmentCenter,
    );
    const centreName = centreObj?.name || values.assessmentCenter;

    setIsSubmitting(true);
    dispatch(
      setStartApplication({
        ...values,
        tradeName,
        sectorName,
        centreName,
        level: selectedLevelStr || (matchedQLevel ? String(matchedQLevel.level) : ""),
        levelNumber: selectedLevelNum ?? matchedQLevel?.level,
        qualificationLevelId: matchedQLevel?.id,
      }),
    );
    dispatch(
      setRPLExperienceTrade({
        qualificationTitle: tradeName,
      }),
    );

    const existingApp = existingApps.find(
      (a) =>
        (a.type || "RPL").toUpperCase() === appType.toUpperCase() &&
        a.status !== "certified" &&
        a.status !== "rejected" &&
        a.status !== "withdrawn",
    );

    const createPayload = {
      type: appType as "RPL" | "NSQ",
      centreId: values.assessmentCenter,
      sectorId: values.sector,
      tradeId: values.trade,
      ...(appType === "RPL" && matchedQLevel?.id
        ? { qualificationLevelId: matchedQLevel.id }
        : {}),
      unitIds: [] as string[],
    };

    const handleCreateSuccess = (res: any, wasCentreOrTradeChanged = false) => {
      setIsSubmitting(false);
      const createdApp = res?.data || res;
      if (createdApp?.id) {
        dispatch(setCurrentApplication(createdApp.id));
      }
      if (wasCentreOrTradeChanged) {
        toast({
          type: "success",
          title: "Application Updated",
          description:
            "Your previous draft was withdrawn and a new draft has been created with your updated selection.",
        });
      }

      if (onContinue) {
        onContinue();
      } else if (appType === "RPL") {
        router.push("/rpl/personal-info");
      } else {
        router.push(
          createdApp?.id
            ? `/dashboard/applications/${createdApp.id}`
            : "/dashboard/applications",
        );
      }
    };

    if (existingApp) {
      if (existingApp.status !== "draft") {
        setIsSubmitting(false);
        toast({
          type: "info",
          title: `${appType} Application Already Submitted`,
          description: `You have already submitted an ${appType} application. You can only have one ${appType} application.`,
        });
        router.push(`/dashboard/applications/${existingApp.id}`);
        return;
      }

      const existingCentreId =
        existingApp.centreId || (existingApp as any).centre?.id || "";
      const existingSectorId =
        existingApp.sectorId || (existingApp as any).sector?.id || "";
      const existingTradeId =
        existingApp.tradeId || (existingApp as any).trade?.id || "";
      const existingQLevelId =
        (existingApp as any).qualificationLevelId ||
        (existingApp as any).qualificationLevel?.id ||
        "";

      const isChangingCentreOrTrade =
        (Boolean(existingCentreId) &&
          existingCentreId !== values.assessmentCenter) ||
        (Boolean(existingSectorId) && existingSectorId !== values.sector) ||
        (Boolean(existingTradeId) && existingTradeId !== values.trade);

      if (isChangingCentreOrTrade) {
        // Per OpenAPI contract, PATCH /applications/{id}/centre is deprecated.
        // Candidates withdraw the draft (POST /applications/{id}/withdraw)
        // and create a new application (POST /applications) to change centre or trade.
        withdrawApplication
          .mutateAsync(existingApp.id)
          .then(() => {
            createApplication.mutate(createPayload, {
              onSuccess: (res: any) => handleCreateSuccess(res, true),
              onError: (err: any) => {
                setIsSubmitting(false);
                toast({
                  type: "error",
                  title: "Application Error",
                  description:
                    err?.message ||
                    "Failed to create new application after withdrawing draft. Please try again.",
                });
              },
            });
          })
          .catch((err: any) => {
            setIsSubmitting(false);
            toast({
              type: "error",
              title: "Could Not Update Centre",
              description:
                err?.message ||
                "Unable to withdraw existing draft application. Please try again.",
            });
          });
        return;
      }

      if (
        appType === "RPL" &&
        matchedQLevel?.id &&
        existingQLevelId !== matchedQLevel.id
      ) {
        patchApplicationDraft
          .mutateAsync({
            id: existingApp.id,
            payload: { qualificationLevelId: matchedQLevel.id },
          })
          .catch(() => {});
      }

      setIsSubmitting(false);
      toast({
        type: "info",
        title: "Draft Application Found",
        description:
          "You have a saved draft application. Continuing to your application details...",
      });
      dispatch(setCurrentApplication(existingApp.id));
      if (onContinue) {
        onContinue();
      } else {
        router.push("/rpl/personal-info");
      }
      return;
    }

    createApplication.mutate(createPayload, {
      onSuccess: (res: any) => handleCreateSuccess(res, false),
      onError: async (err: any) => {
        const errorMsg = err?.message?.toLowerCase() || "";
        const isConflict =
          errorMsg.includes("already") ||
          errorMsg.includes("in-progress") ||
          errorMsg.includes("exists") ||
          err?.statusCode === 409;

        if (isConflict) {
          try {
            const list = await getApplicationsApi();
            const conflictApp = list.find(
              (a) =>
                (a.type || "RPL").toUpperCase() === appType.toUpperCase() &&
                a.status !== "certified" &&
                a.status !== "rejected" &&
                a.status !== "withdrawn",
            );
            if (conflictApp?.status === "draft") {
              const cCentreId =
                conflictApp.centreId || (conflictApp as any).centre?.id || "";
              const cSectorId =
                conflictApp.sectorId || (conflictApp as any).sector?.id || "";
              const cTradeId =
                conflictApp.tradeId || (conflictApp as any).trade?.id || "";
              const needsWithdrawAndRecreate =
                (Boolean(cCentreId) && cCentreId !== values.assessmentCenter) ||
                (Boolean(cSectorId) && cSectorId !== values.sector) ||
                (Boolean(cTradeId) && cTradeId !== values.trade);

              if (needsWithdrawAndRecreate) {
                await withdrawApplication.mutateAsync(conflictApp.id);
                createApplication.mutate(createPayload, {
                  onSuccess: (res: any) => handleCreateSuccess(res, true),
                  onError: (reCreateErr: any) => {
                    setIsSubmitting(false);
                    toast({
                      type: "error",
                      title: "Application Error",
                      description:
                        reCreateErr?.message ||
                        "Failed to initialize application. Please try again.",
                    });
                  },
                });
                return;
              }
              dispatch(setCurrentApplication(conflictApp.id));
            }
          } catch {
            // Fall through to standard conflict reminder
          }

          setIsSubmitting(false);
          toast({
            type: "info",
            title: "Ongoing Application Reminder",
            description:
              "You already have an application in progress. Your progress has been linked to your existing draft.",
          });
          if (onContinue) {
            onContinue();
          } else if (appType === "RPL") {
            router.push("/rpl/personal-info");
          } else {
            router.push("/dashboard/applications");
          }
        } else {
          setIsSubmitting(false);
          toast({
            type: "error",
            title: "Application Error",
            description:
              err.message ||
              "Failed to initialize application. Please try again.",
          });
          if (appType === "RPL") {
            router.push("/rpl/personal-info");
          }
        }
      },
    });
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/onboarding/assessment-type");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-110 mx-auto flex flex-col justify-center select-text"
    >
      <div className="mb-6 text-left w-full flex flex-col items-start">
        <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-primary">
          Start Application
        </h1>
        <p className="text-neutral-secondary text-sm font-normal mt-0.5">
          Your journey is about to start
        </p>
        <h2 className="text-xl xl:text-2xl font-extrabold tracking-tight text-neutral-primary mt-4">
          Centre Information
        </h2>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}
        className="w-full flex flex-col"
        requiredMark={false}
        autoComplete="off"
      >
        {/* Collapsible Location Filter Toggle */}
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => setIsLocationFilterOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#a31d38] transition-colors cursor-pointer group"
          >
            <FiMapPin className="w-3.5 h-3.5 text-[#a31d38]" />
            <span>Filter centres by location</span>
            <FiChevronDown
              className={`w-3.5 h-3.5 text-gray-400 group-hover:text-[#a31d38] transition-transform duration-200 ${
                isLocationFilterOpen ? "rotate-180 text-[#a31d38]" : ""
              }`}
            />
            {(filterState || filterLga) && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FCE8EC] text-[#a31d38]">
                {[filterState, filterLga].filter(Boolean).join(", ")}
              </span>
            )}
          </button>

          {(filterState || filterLga) && (
            <button
              type="button"
              onClick={handleClearLocation}
              className="text-xs font-medium text-[#a31d38] hover:underline cursor-pointer"
            >
              Clear location
            </button>
          )}
        </div>

        {/* Collapsible Location Filter Body */}
        {isLocationFilterOpen && (
          <div className="bg-[#FAFBFB] border border-gray-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="State"
                placeholder="All States"
                options={[{ label: "All States", value: "" }, ...states]}
                value={filterState}
                onChange={(e) => handleStateFilterChange(e.target.value)}
                loading={isLoadingStates}
                showSearch
                allowClear
              />

              <Select
                label="LGA"
                placeholder={filterState ? "All LGAs" : "Select State first"}
                options={[{ label: "All LGAs", value: "" }, ...lgas]}
                value={filterLga}
                disabled={!filterState || isLoadingLgas}
                loading={isLoadingLgas}
                onChange={(e) => handleLgaFilterChange(e.target.value)}
                showSearch
                allowClear
              />
            </div>
          </div>
        )}

        <Form.Item name="assessmentCenter" rules={[rule]}>
          <FormSelect
            label={
              <span>
                Assessment Centre
                <span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            loading={isLoadingCentres}
            disabled={isLoadingCentres || matchingCentres.length === 0}
            placeholder={
              isLoadingCentres
                ? "Loading centres..."
                : matchingCentres.length === 0
                ? "No centres available in this location"
                : "Select"
            }
            options={centreOptions}
          />
        </Form.Item>
        {filterState && matchingCentres.length === 0 && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200/70 rounded-xl px-3 py-2 -mt-3 mb-4">
            No approved assessment centres found in {filterState}
            {filterLga ? ` (${filterLga})` : ""}. Try selecting another state or{" "}
            <button
              type="button"
              onClick={handleClearLocation}
              className="underline font-semibold hover:text-amber-900 cursor-pointer"
            >
              view all centres
            </button>
            .
          </p>
        )}

        <Form.Item name="sector" rules={[rule]}>
          <FormSelect
            label={
              <span>
                Sector<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            loading={isLoadingAvailableSectors}
            disabled={!selectedCentreId || isLoadingAvailableSectors}
            placeholder={
              !selectedCentreId
                ? "Select an Assessment Centre first"
                : isLoadingAvailableSectors
                  ? "Loading sectors..."
                  : "Select"
            }
            options={sectorOptions}
          />
        </Form.Item>

        <Form.Item name="trade" rules={[rule]}>
          <FormSelect
            label={
              <span>
                Trade<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            loading={isLoadingTrades}
            placeholder={
              isLoadingTrades
                ? "Loading trades..."
                : selectedSectorId
                ? "Select"
                : "Select a Sector first"
            }
            disabled={!selectedSectorId || isLoadingTrades}
            options={tradeOptions}
          />
        </Form.Item>

        <Form.Item name="level" rules={[rule]}>
          <FormSelect
            label={
              <span>
                Level
              </span>
            }
            loading={isLoadingTradeDetail}
            placeholder={
              isLoadingTradeDetail
                ? "Loading levels..."
                : selectedTradeId
                ? "Select a Level"
                : "Select a Trade first"
            }
            disabled={!selectedTradeId || isLoadingTradeDetail}
            options={levelOptions}
          />
        </Form.Item>

        <div className="flex items-center justify-between mt-8 pt-4 gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-semibold text-neutral-secondary hover:text-neutral-primary transition-colors cursor-pointer select-none focus:outline-none"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>

          <Button
            type="submit"
            variant="amber"
            size="lg"
            loading={isSubmitting}
            className="px-8 h-12 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer whitespace-nowrap"
          >
            <span>Continue</span>
            <FiArrowRight className="w-4 h-4 text-white" />
          </Button>
        </div>
      </Form>
    </motion.div>
  );
};
