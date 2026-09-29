"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiMapPin, FiChevronDown } from "react-icons/fi";
import { Select, SelectOption } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setNsqApplication } from "@/src/store/slices/onboardingSlice";
import {
  useGetCentres,
  useGetSectors,
  useGetTradesBySector,
  useCandidateLocation,
} from "@/src/features/shared/reference/hooks";
import { useCountryStateCity } from "@/src/lib/hooks/useCountryStateCity";
import {
  createApplicationApi,
  getApplicationsApi,
  submitApplicationApi,
} from "@/src/features/shared/applications/api";
import { APPLICATION_QUERY_KEYS } from "@/src/features/shared/applications/hooks";
import { NsqConfirmationModal } from "../components/NsqConfirmationModal";

export const NsqCentreInfo: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saved = useAppSelector((state) => state.onboarding.nsqApplication);

  const [centreId, setCentreId] = useState(saved.centreId || "");
  const [sectorId, setSectorId] = useState(saved.sectorId || "");
  const [tradeId, setTradeId] = useState(saved.tradeId || "");

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<{
    centreId?: string;
    sectorId?: string;
    tradeId?: string;
  }>({});

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

  // Combine user selected filters with candidate detected location
  const queryLocation = useMemo(() => {
    return {
      country: filterCountry || candidateLoc.country || undefined,
      state: filterState || candidateLoc.state || undefined,
      lga: filterLga || candidateLoc.lga || undefined,
    };
  }, [filterCountry, filterState, filterLga, candidateLoc]);

  const { data: remoteCentres = [], isLoading: isLoadingCentres } =
    useGetCentres(queryLocation);
  const { data: remoteSectors = [], isLoading: isLoadingSectors } =
    useGetSectors();
  const { data: remoteTrades = [], isLoading: isLoadingTrades } =
    useGetTradesBySector(sectorId);

  const matchingCentres = useMemo(() => {
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

  const centreOptions: SelectOption[] = useMemo(() => {
    return matchingCentres.map((c: any) => {
      const locParts = [c.address?.lga, c.address?.state].filter(Boolean);
      const locSuffix = locParts.length > 0 ? ` (${locParts.join(", ")})` : "";
      return {
        label: `${c.name}${locSuffix}`,
        value: c.id,
      };
    });
  }, [matchingCentres]);

  const sectorOptions: SelectOption[] = remoteSectors.map((s) => ({
    label: s.name,
    value: s.id,
  }));

  const tradeOptions: SelectOption[] = remoteTrades.map((t) => ({
    label: t.name,
    value: t.id,
  }));

  useEffect(() => {
    if (saved.centreId && !centreId) setCentreId(saved.centreId);
    if (saved.sectorId && !sectorId) setSectorId(saved.sectorId);
    if (saved.tradeId && !tradeId) setTradeId(saved.tradeId);
  }, [saved, centreId, sectorId, tradeId]);

  const handleSectorChange = (newSectorId: string) => {
    setSectorId(newSectorId);
    setTradeId("");
    if (errors.sectorId) setErrors((prev) => ({ ...prev, sectorId: undefined }));
    if (errors.tradeId) setErrors((prev) => ({ ...prev, tradeId: undefined }));
  };

  const handleCentreChange = (newCentreId: string) => {
    setCentreId(newCentreId);
    if (errors.centreId) setErrors((prev) => ({ ...prev, centreId: undefined }));
  };

  const handleStateFilterChange = (newState: string) => {
    setFilterState(newState);
    setFilterLga("");
    setCentreId("");
    if (errors.centreId) setErrors((prev) => ({ ...prev, centreId: undefined }));
  };

  const handleLgaFilterChange = (newLga: string) => {
    setFilterLga(newLga);
    setCentreId("");
    if (errors.centreId) setErrors((prev) => ({ ...prev, centreId: undefined }));
  };

  const handleClearLocation = () => {
    setFilterState("");
    setFilterLga("");
  };

  const handleTradeChange = (newTradeId: string) => {
    setTradeId(newTradeId);
    if (errors.tradeId) setErrors((prev) => ({ ...prev, tradeId: undefined }));
  };

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!centreId) nextErrors.centreId = "Assessment Centre is required";
    if (!sectorId) nextErrors.sectorId = "Sector is required";
    if (!tradeId) nextErrors.tradeId = "Trade is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({
        type: "error",
        title: "Selection Required",
        description: "Please select an assessment centre, sector, and trade to continue.",
      });
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleConfirmSendRequest = async () => {
    const selectedCentre = remoteCentres.find((c) => c.id === centreId);
    const selectedSector = remoteSectors.find((s) => s.id === sectorId);
    const selectedTrade = remoteTrades.find((t) => t.id === tradeId);

    dispatch(
      setNsqApplication({
        centreId,
        centreName: selectedCentre?.name || "",
        sectorId,
        sectorName: selectedSector?.name || "",
        tradeId,
        tradeName: selectedTrade?.name || "",
      }),
    );

    setIsSubmitting(true);
    try {
      let appId = "";
      let needsSubmit = false;
      try {
        const app = await createApplicationApi({
          type: "NSQ",
          centreId,
          sectorId,
          tradeId,
          unitIds: [],
        });
        if (app?.id) {
          appId = app.id;
          // POST /applications always creates a DRAFT — it still needs to be
          // submitted before the centre can see or act on it.
          needsSubmit = true;
        }
      } catch (createErr: any) {
        const msg = createErr?.message || "";
        const code = createErr?.code || "";
        if (
          code === "application.trade_in_progress" ||
          msg.includes("in-progress") ||
          createErr?.statusCode === 409
        ) {
          const list = await getApplicationsApi();
          const match = list.find(
            (a) =>
              a.type === "NSQ" &&
              (a.status === "draft" ||
                a.status === "in_progress" ||
                (a.status as string) === "submitted"),
          );
          if (match?.id) {
            appId = match.id;
            needsSubmit = match.status === "draft";
          } else throw createErr;
        } else {
          throw createErr;
        }
      }

      // A draft has no backend workflow state and isn't visible to the
      // centre for review — submit is what actually "sends the request".
      if (needsSubmit) {
        try {
          await submitApplicationApi(appId);
        } catch (submitErr: any) {
          queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.all });
          const msg = submitErr?.message?.toLowerCase() || "";
          const isMaxPolicy =
            msg.includes("in-progress") ||
            msg.includes("policy max") ||
            submitErr?.statusCode === 409 ||
            submitErr?.statusCode === 422;

          if (isMaxPolicy) {
            toast({
              type: "info",
              title: "Application Saved as Draft",
              description:
                "You currently have an active application in progress. Your new NSQ application has been saved as a draft in My Applications and can be submitted once your current application is completed.",
            });
          } else {
            toast({
              type: "error",
              title: "Could Not Send Request",
              description:
                submitErr?.message ||
                "Your application was saved as a draft but could not be sent to the centre. Please try again from My Applications.",
            });
          }
          setIsConfirmModalOpen(false);
          router.push("/dashboard/applications");
          return;
        }
      }

      // Invalidate applications query cache
      queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.all });

      toast({
        type: "success",
        title: "Request Sent to Centre",
        description: "Your request has been successfully sent to the centre.",
      });

      setIsConfirmModalOpen(false);
      router.push("/dashboard/applications");
    } catch (err: any) {
      toast({
        type: "error",
        title: "Request Failed",
        description: err?.message || "Could not send request to centre. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/onboarding/assessment-type");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col justify-center select-text max-w-xl mx-auto px-4 sm:px-0"
    >
      <form onSubmit={handleOpenConfirm} autoComplete="off" className="w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <span className="text-[#a31d38] font-bold text-sm sm:text-base tracking-tight">
            Start Application
          </span>
          <p className="text-neutral-secondary text-xs sm:text-sm font-normal">
            Your journey is about to start
          </p>
        </div>

        {/* Centre Information Section */}
        <div className="flex flex-col gap-5 pt-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
            Centre Information
          </h2>

          {/* Collapsible Location Filter Toggle */}
          <div className="flex items-center justify-between -mb-1">
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
            <div className="bg-[#FAFBFB] border border-gray-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
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

          <div className="flex flex-col gap-4">
            <div>
              <Select
                label={
                  <span>
                    Assessment Centre<span className="text-primary-solid ml-0.5">*</span>
                  </span>
                }
                placeholder={
                  isLoadingCentres
                    ? "Loading centres..."
                    : matchingCentres.length === 0
                    ? "No centres available in this location"
                    : "Select"
                }
                options={centreOptions}
                value={centreId}
                disabled={isLoadingCentres || matchingCentres.length === 0}
                loading={isLoadingCentres}
                onChange={(e) => handleCentreChange(e.target.value)}
                error={errors.centreId}
                showSearch
              />
              {filterState && matchingCentres.length === 0 && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200/70 rounded-xl px-3 py-2 mt-2">
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
            </div>

            <Select
              label={
                <span>
                  Sector<span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="Select"
              options={sectorOptions}
              value={sectorId}
              loading={isLoadingSectors}
              onChange={(e) => handleSectorChange(e.target.value)}
              error={errors.sectorId}
            />

            <Select
              label={
                <span>
                  Trade<span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder={
                !sectorId
                  ? "Select sector first"
                  : isLoadingTrades
                  ? "Loading trades..."
                  : "Select"
              }
              options={tradeOptions}
              value={tradeId}
              disabled={!sectorId || isLoadingTrades}
              loading={isLoadingTrades}
              onChange={(e) => handleTradeChange(e.target.value)}
              error={errors.tradeId}
            />
          </div>
        </div>

        {/* Navigation Actions */}
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
            loading={isSubmitting}
            rightIcon={<FiArrowRight className="w-4 h-4" />}
            className="px-8 h-12 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-md cursor-pointer"
          >
            Send Request
          </Button>
        </div>
      </form>

      <NsqConfirmationModal
        isOpen={isConfirmModalOpen}
        isLoading={isSubmitting}
        title="Are you sure?"
        subtitle="Confirm you want to send request to centre"
        confirmText="Yes, Send"
        cancelText="No"
        onConfirm={handleConfirmSendRequest}
        onClose={() => setIsConfirmModalOpen(false)}
      />
    </motion.div>
  );
};
