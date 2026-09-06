"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiAlertTriangle,
  FiPlus,
} from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { useToast } from "@/src/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useGetApplications } from "@/src/features/shared/applications/hooks";
import {
  useGetCentreInterviews,
  useGetCentrePanels,
  useScheduleCentreInterviewFromTemplate,
} from "@/src/features/shared/centre/hooks";
import { useGetAllTrades } from "@/src/features/shared/reference/hooks";
import { scheduleCentreInterviewFromTemplateApi } from "@/src/features/shared/centre/api/centre.api";
import {
  scheduleInterviewApi,
  curateInterviewPanelApi,
} from "@/src/features/shared/applications/api/application.api";

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (scheduledData?: any) => void;
  initialApplicationId?: string;
  initialCandidateName?: string;
  initialTradeName?: string;
}

interface CandidateSlot {
  id: string;
  applicationId: string;
  name: string;
  time: string;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialApplicationId,
  initialCandidateName,
  initialTradeName,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications = [] } = useGetApplications();
  const { data: interviewTemplates = [] } = useGetCentreInterviews();
  const { data: panels = [] } = useGetCentrePanels();

  const scheduleFromTemplate = useScheduleCentreInterviewFromTemplate();
  const { data: backendTrades = [], isLoading: isLoadingTrades } = useGetAllTrades();

  // Form states matching media_1788703578201.png & media_1788703578215.png
  const [selectedPanelId, setSelectedPanelId] = useState("");
  const [selectedTrade, setSelectedTrade] = useState("");
  const [candidateRows, setCandidateRows] = useState<CandidateSlot[]>([]);
  const [candidatePickerId, setCandidatePickerId] = useState("");
  const [newCandidateTime, setNewCandidateTime] = useState("12:00");

  // Backend trades merged with real application trades
  const tradeOptions = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();

    const add = (name?: string | null) => {
      if (!name) return;
      const trimmed = name.trim();
      if (!trimmed || /^[0-9a-f-]{20,}$/i.test(trimmed)) return;
      const lower = trimmed.toLowerCase();
      if (seen.has(lower)) return;
      seen.add(lower);
      list.push(trimmed);
    };

    // 1. Initial trade if supplied
    if (initialTradeName) {
      add(initialTradeName);
    }

    // 2. Candidate application trade if present
    if (initialApplicationId) {
      const matched = applications.find(
        (a) => a.id === initialApplicationId,
      ) as any;
      add(
        matched?.trade?.name ||
          (typeof matched?.trade === "string" ? matched?.trade : null),
      );
      add(matched?.sector?.name);
    }

    // 3. Backend trades from /trades or /sectors/{id}/trades
    backendTrades.forEach((t) => add(t.name));

    // 4. Any trades found across other applications
    applications.forEach((a: any) => {
      add(a?.trade?.name || (typeof a?.trade === "string" ? a?.trade : null));
    });

    return list;
  }, [backendTrades, applications, initialApplicationId, initialTradeName]);

  // Pre-populate candidate and trade when initialApplicationId / initialTradeName is supplied
  useEffect(() => {
    if (isOpen) {
      if (initialTradeName && !/^[0-9a-f-]{20,}$/i.test(initialTradeName)) {
        setSelectedTrade(initialTradeName);
      } else if (initialApplicationId) {
        const app = applications.find(
          (a) => a.id === initialApplicationId,
        ) as any;
        const appTrade =
          app?.trade?.name ||
          (typeof app?.trade === "string" ? app.trade : "");
        if (appTrade && !/^[0-9a-f-]{20,}$/i.test(appTrade)) {
          setSelectedTrade(appTrade);
        }
      }
    }
  }, [isOpen, initialApplicationId, initialTradeName, applications]);

  useEffect(() => {
    if (!selectedTrade && tradeOptions.length > 0) {
      setSelectedTrade(tradeOptions[0]);
    }
  }, [tradeOptions, selectedTrade]);

  // Pre-populate candidate when initialApplicationId is supplied
  useEffect(() => {
    if (isOpen && initialApplicationId) {
      const candidateName =
        initialCandidateName ||
        (() => {
          const app = applications.find(
            (a) => a.id === initialApplicationId,
          ) as any;
          return (
            app?.candidate?.name ||
            `${app?.candidate?.firstName || ""} ${app?.candidate?.lastName || ""}`.trim() ||
            "Candidate"
          );
        })();

      setCandidateRows([
        {
          id: `slot-${initialApplicationId}`,
          applicationId: initialApplicationId,
          name: candidateName,
          time: "12:00",
        },
      ]);
    }
  }, [isOpen, initialApplicationId, initialCandidateName, applications]);

  // Confirmation state matching media_1788703578238.png
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available panels options (merging backend templates + panels)
  const panelOptions = useMemo(() => {
    const combined = [
      ...interviewTemplates.map((t) => ({
        label: t.name,
        value: t.id,
        item: t,
        type: "interview" as const,
      })),
      ...panels.map((p) => ({
        label: p.name,
        value: p.id,
        item: p,
        type: "panel" as const,
      })),
    ];

    // Deduplicate by value
    const seen = new Set<string>();
    return combined.filter((c) => {
      if (seen.has(c.value)) return false;
      seen.add(c.value);
      return true;
    });
  }, [interviewTemplates, panels]);

  // Selected panel info object
  const selectedPanelInfo = useMemo(() => {
    if (!selectedPanelId) return null;
    const found = panelOptions.find((p) => p.value === selectedPanelId);
    if (!found) return null;
    const item = found.item as any;

    const scheduledDate = item?.scheduledAt
      ? new Date(item.scheduledAt)
      : new Date();

    const dateStr = scheduledDate.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    const timeStr = scheduledDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const isOnline =
      Boolean(item?.mode && item.mode.toLowerCase() === "online") ||
      Boolean(item?.link && !item?.location);
    const mode = isOnline ? "Online" : "Physical";

    const meetingLink = item?.link || (isOnline ? item?.location : undefined);
    const streetAddress =
      item?.location || (item?.useCentreAddress ? "Centre Address" : (isOnline ? undefined : "Centre Address"));

    const displayValue = isOnline
      ? (meetingLink || "https://meet.google.com")
      : (streetAddress || "Centre Address");

    return {
      title: item?.name || item?.title || found.label,
      mode,
      isOnline,
      dateTime: `${dateStr} - ${timeStr}`,
      scheduledAtDate: scheduledDate,
      country: item?.country || "Nigeria",
      state: item?.state || "FCT Abuja",
      meetingLink,
      streetAddress,
      displayValue,
    };
  }, [selectedPanelId, panelOptions]);

  // When panel changes, initialize candidates from real applications if rows empty
  const handlePanelChange = (panelId: string) => {
    setSelectedPanelId(panelId);
    if (candidateRows.length === 0) {
      const interviewCandidates = applications
        .filter((app: any) => app.currentStageKey === "interview")
        .slice(0, 3)
        .map((app: any, idx: number) => {
          const raw = app as any;
          const name =
            raw.candidate?.name ||
            `${raw.candidate?.firstName || ""} ${raw.candidate?.lastName || ""}`.trim() ||
            `Candidate (${app.id.slice(0, 8)})`;
          const hour = 12 + idx;
          return {
            id: `slot-${app.id}`,
            applicationId: app.id,
            name,
            time: `${hour}:00`,
          };
        });
      if (interviewCandidates.length > 0) {
        setCandidateRows(interviewCandidates);
      }
    }
  };

  // Candidates available to add from real applications
  const unselectedApplications = useMemo(() => {
    const selectedAppIds = new Set(candidateRows.map((c) => c.applicationId));
    return applications
      .filter((app) => !selectedAppIds.has(app.id))
      .map((app) => {
        const raw = app as any;
        const name =
          raw.candidate?.name ||
          `${raw.candidate?.firstName || ""} ${raw.candidate?.lastName || ""}`.trim() ||
          `Candidate (${app.id.slice(0, 8)})`;
        return {
          label: name,
          value: app.id,
        };
      });
  }, [applications, candidateRows]);

  const handleAddCandidate = () => {
    if (!candidatePickerId) {
      toast({
        type: "info",
        title: "Select Candidate",
        description: "Please choose a candidate from the dropdown first.",
      });
      return;
    }

    const app = applications.find((a) => a.id === candidatePickerId);
    const raw = app as any;
    const name =
      raw?.candidate?.name ||
      `${raw?.candidate?.firstName || ""} ${raw?.candidate?.lastName || ""}`.trim() ||
      "New Candidate";

    setCandidateRows((prev) => [
      ...prev,
      {
        id: `slot-${Date.now()}`,
        applicationId: candidatePickerId,
        name,
        time: newCandidateTime || "14:00",
      },
    ]);

    setCandidatePickerId("");
  };

  const handleRemoveCandidate = (id: string) => {
    setCandidateRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateCandidateTime = (id: string, newTime: string) => {
    setCandidateRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, time: newTime } : r)),
    );
  };

  const handleTriggerSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPanelId) {
      toast({
        type: "error",
        title: "Panel Required",
        description: "Please select an interview panel.",
      });
      return;
    }

    if (candidateRows.length === 0) {
      toast({
        type: "error",
        title: "Candidates Required",
        description: "Please add at least one candidate for this interview.",
      });
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleFinalConfirm = async () => {
    setIsSubmitting(true);

    try {
      // Resolve associated panel details
      const selectedOption = panelOptions.find((p) => p.value === selectedPanelId);
      const selectedItem = selectedOption?.item as any;
      const associatedPanel =
        selectedItem?.panel ||
        panels.find((p) => p.id === selectedItem?.panelId) ||
        (selectedOption?.type === "panel" ? selectedItem : null) ||
        panels[0];

      const assessorIds: string[] =
        associatedPanel?.assessorIds ||
        associatedPanel?.members?.map((m: any) => m.assessorId || m.id) ||
        [];
      const leadAssessorId: string =
        associatedPanel?.leadAssessorId ||
        associatedPanel?.members?.find(
          (m: any) =>
            m.role === "lead" || m.role === "lead_assessor" || m.isLead,
        )?.assessorId ||
        assessorIds[0];
      const observerIvAssessorId: string | undefined =
        associatedPanel?.observerIvAssessorId ||
        associatedPanel?.members?.find(
          (m: any) =>
            m.role === "observer" || m.role === "iv" || m.isObserver,
        )?.assessorId;

      // Schedule interview sitting for each candidate in accordance with backend OpenAPI spec
      for (const cand of candidateRows) {
        const baseDate = selectedPanelInfo?.scheduledAtDate || new Date();
        const candDate = new Date(baseDate);
        if (cand.time && cand.time.includes(":")) {
          const [hoursStr, minsStr] = cand.time.split(":");
          const h = parseInt(hoursStr, 10);
          const m = parseInt(minsStr, 10);
          if (!isNaN(h)) candDate.setHours(h);
          if (!isNaN(m)) candDate.setMinutes(m);
        }
        const scheduledAtIso = candDate.toISOString();

        // 1. Curate panel if panel members exist
        if (assessorIds.length > 0 && leadAssessorId) {
          await curateInterviewPanelApi(cand.applicationId, {
            assessorIds,
            leadAssessorId,
            observerIvAssessorId,
          });
        }

        // 2. If selectedPanelId is an interview sitting template, book it
        const isInterviewTemplate = interviewTemplates.some(
          (t) => t.id === selectedPanelId,
        );
        if (isInterviewTemplate) {
          await scheduleCentreInterviewFromTemplateApi(selectedPanelId, {
            applicationId: cand.applicationId,
            scheduledAt: scheduledAtIso,
            mode: selectedPanelInfo?.isOnline ? "online" : "physical",
            location: selectedPanelInfo?.isOnline
              ? undefined
              : selectedPanelInfo?.streetAddress,
            link: selectedPanelInfo?.isOnline
              ? selectedPanelInfo?.meetingLink
              : undefined,
          });
        }

        // 3. Call scheduleInterviewApi so the candidate and assessor query keys are synced
        await scheduleInterviewApi(cand.applicationId, {
          scheduledAt: scheduledAtIso,
          mode: selectedPanelInfo?.isOnline ? "online" : "physical",
          location: selectedPanelInfo?.isOnline
            ? undefined
            : selectedPanelInfo?.streetAddress || "Cstemp Centre",
          useCentreAddress: !selectedPanelInfo?.isOnline,
          link: selectedPanelInfo?.isOnline
            ? selectedPanelInfo?.meetingLink || "https://meet.google.com"
            : undefined,
        });

        // Invalidate relevant React Query caches with the exact query keys
        queryClient.invalidateQueries({
          queryKey: ["applications", "interview-schedule", cand.applicationId],
        });
        queryClient.invalidateQueries({
          queryKey: ["applications", "interview-panel", cand.applicationId],
        });
        queryClient.invalidateQueries({
          queryKey: ["applications", "stages", cand.applicationId],
        });
        queryClient.invalidateQueries({
          queryKey: ["applications", "detail", cand.applicationId],
        });
        queryClient.invalidateQueries({
          queryKey: ["centre", "applications", "detail", cand.applicationId],
        });
        queryClient.invalidateQueries({
          queryKey: ["applications", cand.applicationId],
        });
      }

      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["centre"] });
      queryClient.invalidateQueries({ queryKey: ["centre", "interviews"] });
      queryClient.invalidateQueries({
        queryKey: ["centre", "interview-bookings"],
      });
      queryClient.invalidateQueries({ queryKey: ["centre", "panels"] });

      toast({
        type: "success",
        title: "Interview Scheduled",
        description: `Successfully scheduled interview for ${candidateRows.length} candidate(s).`,
      });

      const targetCand =
        candidateRows.find((c) => c.applicationId === initialApplicationId) ||
        candidateRows[0];
      const baseDate = selectedPanelInfo?.scheduledAtDate || new Date();
      const targetDate = new Date(baseDate);
      if (targetCand?.time && targetCand.time.includes(":")) {
        const [hStr, mStr] = targetCand.time.split(":");
        const h = parseInt(hStr, 10);
        const m = parseInt(mStr, 10);
        if (!isNaN(h)) targetDate.setHours(h);
        if (!isNaN(m)) targetDate.setMinutes(m);
      }

      const scheduledInfo = {
        date: targetDate.toISOString().split("T")[0],
        time: targetCand?.time || "12:00",
        mode: selectedPanelInfo?.isOnline ? ("virtual" as const) : ("physical" as const),
        location: selectedPanelInfo?.isOnline
          ? undefined
          : selectedPanelInfo?.streetAddress || "Cstemp Centre",
        meetingLink: selectedPanelInfo?.isOnline
          ? selectedPanelInfo?.meetingLink
          : undefined,
        scheduledAt: targetDate.toISOString(),
      };

      setIsConfirmOpen(false);
      onSuccess?.(scheduledInfo);
      onClose();
    } catch (err: any) {
      toast({
        type: "error",
        title: "Failed to Schedule",
        description: err.message || "An error occurred while scheduling interview.",
      });
      setIsConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !isConfirmOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && !isConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-[28px] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-gray-100 my-auto text-left"
            >
              {/* Close Button with red cross on pale pink rounded container */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 bg-[#FCE8EC] hover:bg-[#FAD1D8] rounded-xl flex items-center justify-center text-[#A31D38] cursor-pointer absolute top-6 right-6 transition-colors select-none"
              >
                <FiX className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Modal Header */}
              <div className="text-center mb-6 pr-6">
                <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-1">
                  Schedule Interview
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm font-normal">
                  Schedule interview for selected candidates
                </p>
              </div>

              <form onSubmit={handleTriggerSubmit} className="flex flex-col gap-4">
                {/* Select Panel Field matching media_1788703578201.png */}
                <div className="flex flex-col gap-1.5">
                  <Select
                    label="Select Panel"
                    placeholder="Select"
                    value={selectedPanelId}
                    onChange={(e) => handlePanelChange(e.target.value)}
                    options={panelOptions.map((p) => ({
                      label: p.label,
                      value: p.value,
                    }))}
                  />
                </div>

                {/* Conditional Panel Information Card matching media_1788703578215.png */}
                {selectedPanelInfo && (
                  <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3.5 my-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                          Title
                        </span>
                        <span className="text-xs font-bold text-gray-900 mt-0.5">
                          {selectedPanelInfo.title}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                          Country
                        </span>
                        <span className="text-xs font-bold text-gray-900 mt-0.5">
                          {selectedPanelInfo.country}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                          Interview Mode
                        </span>
                        <span className="text-xs font-bold text-gray-900 mt-0.5">
                          {selectedPanelInfo.mode}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                          State
                        </span>
                        <span className="text-xs font-bold text-gray-900 mt-0.5">
                          {selectedPanelInfo.state}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                          Interview Date &amp; Time
                        </span>
                        <span className="text-xs font-bold text-gray-900 mt-0.5">
                          {selectedPanelInfo.dateTime}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                          {selectedPanelInfo.isOnline
                            ? "Meeting Link"
                            : "Street Address"}
                        </span>
                        {selectedPanelInfo.isOnline ? (
                          <a
                            href={
                              selectedPanelInfo.displayValue.startsWith("http")
                                ? selectedPanelInfo.displayValue
                                : `https://${selectedPanelInfo.displayValue}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-[#A31D38] hover:underline truncate mt-0.5"
                          >
                            {selectedPanelInfo.displayValue}
                          </a>
                        ) : (
                          <span className="text-xs font-bold text-gray-900 mt-0.5 truncate">
                            {selectedPanelInfo.displayValue}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditional Trade & Candidates Section matching media_1788703578215.png */}
                {selectedPanelInfo && (
                  <>
                    {/* Select Trade */}
                    <div className="flex flex-col gap-1.5">
                      <Select
                        label="Select Trade"
                        placeholder={isLoadingTrades ? "Loading trades..." : "Select"}
                        value={selectedTrade}
                        loading={isLoadingTrades}
                        onChange={(e) => setSelectedTrade(e.target.value)}
                        options={tradeOptions.map((t) => ({
                          label: t,
                          value: t,
                        }))}
                      />
                    </div>

                    {/* Select Candidates Section */}
                    <div className="flex flex-col gap-2.5">
                      <label className="text-xs font-semibold text-gray-700">
                        Select Candidates
                      </label>

                      {/* Existing Added Candidate Rows */}
                      <div className="flex flex-col gap-2">
                        {candidateRows.map((cand) => (
                          <div
                            key={cand.id}
                            className="flex items-center gap-2 w-full"
                          >
                            <div className="flex-1 h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-900 font-medium flex items-center truncate">
                              {cand.name}
                            </div>

                            <div className="relative flex items-center w-28 shrink-0">
                              <input
                                type="time"
                                value={cand.time}
                                onChange={(e) =>
                                  handleUpdateCandidateTime(
                                    cand.id,
                                    e.target.value,
                                  )
                                }
                                className="w-full h-11 px-2.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-xs sm:text-sm text-gray-800 outline-none focus:border-[#F59E0B] transition-all font-medium text-center cursor-pointer"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveCandidate(cand.id)}
                              aria-label="Remove Candidate"
                              className="w-11 h-11 bg-[#FCE8EC] hover:bg-[#FAD1D8] text-[#A31D38] rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                            >
                              <FiX className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add New Candidate Input Row */}
                      <div className="flex items-center gap-2 w-full pt-1">
                        <div className="flex-1">
                          <Select
                            placeholder="Select"
                            value={candidatePickerId}
                            onChange={(e) =>
                              setCandidatePickerId(e.target.value)
                            }
                            options={unselectedApplications}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleAddCandidate}
                          aria-label="Add Candidate"
                          className="w-11 h-11 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors shadow-xs"
                        >
                          <FiPlus className="w-5 h-5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Submit button: Schedule Interview */}
                <button
                  type="submit"
                  disabled={!selectedPanelId || isSubmitting}
                  className={`w-full font-bold text-sm sm:text-base h-12.5 rounded-xl mt-3 transition-all select-none ${
                    selectedPanelId
                      ? "bg-[#F59E0B] hover:bg-[#D97706] text-white cursor-pointer shadow-md shadow-amber-500/20 active:scale-[0.99]"
                      : "bg-[#F59E0B]/50 text-white cursor-not-allowed"
                  }`}
                >
                  Schedule Interview
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal matching media_1788703578238.png */}
      <AnimatePresence>
        {isConfirmOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-[28px] p-8 sm:p-10 max-w-md w-full flex flex-col items-center text-center shadow-2xl relative border border-gray-100"
            >
              {/* Glowing Warning Triangle Icon */}
              <div className="relative mb-5 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center relative">
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-b from-[#F59E0B] via-[#D97706] to-[#B45309] flex items-center justify-center shadow-lg shadow-amber-500/30 text-white">
                    <FiAlertTriangle className="w-9 h-9 stroke-[2.5]" />
                  </div>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-2">
                Are you sure?
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm font-normal mb-8 max-w-xs">
                Confirm you want to schedule interview
              </p>

              <div className="flex flex-col gap-3 w-full">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalConfirm}
                  className="w-full bg-[#F59E0B] hover:bg-[#D97706] active:scale-[0.99] text-white font-bold text-sm sm:text-base h-12 rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Scheduling..." : "Yes, Create"}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsConfirmOpen(false)}
                  className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold text-sm sm:text-base h-12 rounded-xl transition-all cursor-pointer"
                >
                  No
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
