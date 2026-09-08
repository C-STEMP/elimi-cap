"use client";

import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/src/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useGetApplications } from "@/src/features/shared/applications/hooks";
import {
  useGetCentreInterviews,
  useGetCentrePanels,
} from "@/src/features/shared/centre/hooks";
import { useGetAllTrades } from "@/src/features/shared/reference/hooks";
import { scheduleCentreInterviewFromTemplateApi } from "@/src/features/shared/centre/api/centre.api";
import {
  scheduleInterviewApi,
  curateInterviewPanelApi,
} from "@/src/features/shared/applications/api/application.api";

export interface CandidateSlot {
  id: string;
  applicationId: string;
  name: string;
  tradeName: string;
  time: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data?: any) => void;
  initialApplicationId?: string;
  initialCandidateName?: string;
  initialTradeName?: string;
}

export function useScheduleInterviewState({
  isOpen,
  onClose,
  onSuccess,
  initialApplicationId,
  initialCandidateName,
  initialTradeName,
}: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications = [] } = useGetApplications();
  const { data: interviewTemplates = [], isLoading: isLoadingInterviews } =
    useGetCentreInterviews();
  const { data: panels = [] } = useGetCentrePanels();
  const { data: backendTrades = [], isLoading: isLoadingTrades } = useGetAllTrades();

  const [selectedInterviewId, setSelectedInterviewId] = useState("");
  const [selectedTrade, setSelectedTrade] = useState("All Trades");
  const [candidateRows, setCandidateRows] = useState<CandidateSlot[]>([]);
  const [candidatePickerId, setCandidatePickerId] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // List of interview options for the dropdown
  const interviewOptions = useMemo(() => {
    return interviewTemplates.map((t) => {
      const scheduled = t.scheduledAt ? new Date(t.scheduledAt) : null;
      const dateStr = scheduled
        ? scheduled.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "Unscheduled";
      const timeStr = scheduled
        ? scheduled.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";
      const panelName = t.panel?.name || "No Panel";
      return {
        label: `${t.name} (${panelName} • ${dateStr} ${timeStr})`,
        value: t.id,
        item: t,
      };
    });
  }, [interviewTemplates]);

  // Selected interview card details
  const selectedInterview = useMemo(() => {
    if (!selectedInterviewId) return null;
    return interviewTemplates.find((t) => t.id === selectedInterviewId) || null;
  }, [selectedInterviewId, interviewTemplates]);

  const selectedInterviewInfo = useMemo(() => {
    if (!selectedInterview) return null;
    const scheduledDate = selectedInterview.scheduledAt
      ? new Date(selectedInterview.scheduledAt)
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
    const isOnline = selectedInterview.mode === "online";
    const mode = isOnline ? "Online" : "Physical";
    const displayValue = isOnline
      ? selectedInterview.link || "—"
      : selectedInterview.location || "—";
    const panel = selectedInterview.panel || panels.find((p) => p.id === selectedInterview.panelId);
    const panelName = panel?.name || selectedInterview.panel?.name || "—";
    const panelMemberCount = panel?.members?.length || (panel as any)?.assessorIds?.length || 0;

    return {
      title: selectedInterview.name,
      panelName,
      panelMemberCount,
      mode,
      isOnline,
      dateTime: `${dateStr} - ${timeStr}`,
      scheduledAtDate: scheduledDate,
      displayValue,
    };
  }, [selectedInterview, panels]);

  // Candidate applications strictly in interview stage
  const schedulableApplications = useMemo(() => {
    return applications.filter((app: any) => {
      if (app.status === "certified" || app.status === "rejected" || app.status === "withdrawn") {
        return false;
      }
      return app.currentStageKey === "interview";
    });
  }, [applications]);

  // Trade options built from schedulable applications + backend trades
  const tradeOptions = useMemo(() => {
    const set = new Set<string>();
    schedulableApplications.forEach((a: any) => {
      const name = a?.trade?.name || (typeof a?.trade === "string" ? a.trade : null);
      if (name && !/^[0-9a-f-]{20,}$/i.test(name)) set.add(name);
    });
    backendTrades.forEach((t) => {
      if (t.name) set.add(t.name);
    });
    return ["All Trades", ...Array.from(set)];
  }, [schedulableApplications, backendTrades]);

  // Unselected candidates matching the selected trade filter
  const unselectedCandidates = useMemo(() => {
    const selectedIds = new Set(candidateRows.map((c) => c.applicationId));
    return schedulableApplications
      .filter((app) => !selectedIds.has(app.id))
      .filter((app: any) => {
        if (selectedTrade === "All Trades") return true;
        const appTrade = app?.trade?.name || (typeof app?.trade === "string" ? app.trade : "");
        return appTrade?.toLowerCase() === selectedTrade.toLowerCase();
      })
      .map((app: any) => {
        const name =
          app.candidate?.name ||
          `${app.candidate?.firstName || ""} ${app.candidate?.lastName || ""}`.trim() ||
          `Candidate (${app.id.slice(0, 8)})`;
        const trade = app?.trade?.name || (typeof app?.trade === "string" ? app.trade : "General");
        const stageLabel = app.currentStageKey ? ` [${app.currentStageKey.replace(/_/g, " ")}]` : "";
        return {
          label: `${name} — ${trade}${stageLabel}`,
          value: app.id,
          name,
          trade,
        };
      });
  }, [schedulableApplications, candidateRows, selectedTrade]);

  // Initialize / reset on open
  useEffect(() => {
    if (!isOpen) return;

    if (interviewTemplates.length > 0) {
      setSelectedInterviewId((prev) => prev || interviewTemplates[0].id);
    }
    setSelectedTrade(initialTradeName || "All Trades");
    setCandidatePickerId("");

    if (initialApplicationId) {
      const app = applications.find((a) => a.id === initialApplicationId) as any;
      const name =
        initialCandidateName ||
        app?.candidate?.name ||
        `${app?.candidate?.firstName || ""} ${app?.candidate?.lastName || ""}`.trim() ||
        "Candidate";
      const trade = app?.trade?.name || (typeof app?.trade === "string" ? app.trade : "General");
      setCandidateRows([
        {
          id: `slot-${initialApplicationId}`,
          applicationId: initialApplicationId,
          name,
          tradeName: trade,
          time: "10:00",
        },
      ]);
    } else {
      setCandidateRows([]);
    }
  }, [isOpen, initialApplicationId, initialCandidateName, initialTradeName]);

  // Pick first interview if interviewTemplates load after modal opens
  useEffect(() => {
    if (isOpen && interviewTemplates.length > 0 && !selectedInterviewId) {
      setSelectedInterviewId(interviewTemplates[0].id);
    }
  }, [isOpen, interviewTemplates, selectedInterviewId]);

  const handleSelectCandidate = (appId: string) => {
    if (!appId) return;
    const found = unselectedCandidates.find((c) => c.value === appId);
    if (!found) return;
    setCandidateRows((prev) => {
      if (prev.some((r) => r.applicationId === appId)) return prev;
      return [
        ...prev,
        {
          id: `slot-${Date.now()}`,
          applicationId: appId,
          name: found.name,
          tradeName: found.trade,
          time: "10:00",
        },
      ];
    });
    setCandidatePickerId("");
  };

  const handleAddCandidate = () => {
    if (!candidatePickerId) {
      toast({
        type: "info",
        title: "Select Candidate",
        description: "Please choose a candidate from the dropdown first.",
      });
      return;
    }
    handleSelectCandidate(candidatePickerId);
  };

  const handleRemoveCandidate = (id: string) =>
    setCandidateRows((prev) => prev.filter((r) => r.id !== id));

  const handleUpdateCandidateTime = (id: string, time: string) =>
    setCandidateRows((prev) => prev.map((r) => (r.id === id ? { ...r, time } : r)));

  const handleTriggerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterviewId) {
      toast({
        type: "error",
        title: "Interview Required",
        description: "Please select an interview from the list.",
      });
      return;
    }
    if (candidateRows.length === 0) {
      toast({
        type: "error",
        title: "Candidates Required",
        description: "Please select at least one candidate for this interview.",
      });
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleFinalConfirm = async () => {
    setIsSubmitting(true);
    try {
      const interview = selectedInterview;
      const panel = interview?.panel || panels.find((p) => p.id === interview?.panelId);
      const members = panel?.members || [];
      const leadMember = members.find((m) => m.isLead);
      const observerMember = members.find((m) => m.isObserver);
      const regularMembers = members.filter((m) => !m.isObserver);

      const assessorIds: string[] =
        (panel as any)?.assessorIds ||
        (regularMembers.length > 0 ? regularMembers.map((m) => m.assessorId) : members.map((m) => m.assessorId));
      const leadAssessorId: string =
        (panel as any)?.leadAssessorId || leadMember?.assessorId || assessorIds[0];
      const observerIvAssessorId: string | undefined =
        (panel as any)?.observerIvAssessorId || observerMember?.assessorId;

      for (const cand of candidateRows) {
        const baseDate = selectedInterviewInfo?.scheduledAtDate || new Date();
        const candDate = new Date(baseDate);
        if (cand.time?.includes(":")) {
          const [h, m] = cand.time.split(":").map(Number);
          if (!isNaN(h)) candDate.setHours(h);
          if (!isNaN(m)) candDate.setMinutes(m);
        }
        const scheduledAtIso = candDate.toISOString();

        // 1. Curate panel on application if panel has all 3 required assessors
        if (assessorIds.length >= 3 && leadAssessorId) {
          try {
            await curateInterviewPanelApi(cand.applicationId, {
              assessorIds,
              leadAssessorId,
              observerIvAssessorId,
            });
          } catch (e) {
            console.warn("curateInterviewPanelApi error:", e);
          }
        }

        // 2. Schedule interview on template (POST /centre/interviews/{id}/schedule)
        await scheduleCentreInterviewFromTemplateApi(selectedInterviewId, {
          applicationId: cand.applicationId,
          scheduledAt: scheduledAtIso,
          mode: interview?.mode || "physical",
          location: interview?.location || undefined,
          link: interview?.link || undefined,
          useCentreAddress: interview?.useCentreAddress ?? true,
        });

        // 3. Sync to application record (POST /applications/{id}/interview/schedule)
        try {
          await scheduleInterviewApi(cand.applicationId, {
            scheduledAt: scheduledAtIso,
            mode: interview?.mode || "physical",
            location: interview?.location || "Centre Address",
            useCentreAddress: interview?.useCentreAddress ?? true,
            link: interview?.link || undefined,
          });
        } catch (e) {
          console.warn("scheduleInterviewApi sync error:", e);
        }
      }

      ["applications", "centre"].forEach((k) =>
        queryClient.invalidateQueries({ queryKey: [k] }),
      );
      queryClient.invalidateQueries({ queryKey: ["centre", "interviews"] });
      queryClient.invalidateQueries({ queryKey: ["centre", "interview-bookings"] });

      toast({
        type: "success",
        title: "Interview Scheduled",
        description: `Successfully scheduled ${candidateRows.length} candidate(s) for the interview.`,
      });

      setIsConfirmOpen(false);
      onSuccess?.();
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

  return {
    selectedInterviewId,
    setSelectedInterviewId,
    selectedInterview,
    selectedInterviewInfo,
    selectedTrade,
    setSelectedTrade,
    candidateRows,
    candidatePickerId,
    setCandidatePickerId,
    isConfirmOpen,
    setIsConfirmOpen,
    isSubmitting,
    interviewOptions,
    isLoadingInterviews,
    tradeOptions,
    isLoadingTrades,
    unselectedCandidates,
    handleSelectCandidate,
    handleAddCandidate,
    handleRemoveCandidate,
    handleUpdateCandidateTime,
    handleTriggerSubmit,
    handleFinalConfirm,
  };
}

