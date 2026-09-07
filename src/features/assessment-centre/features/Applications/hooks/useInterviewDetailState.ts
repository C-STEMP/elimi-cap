"use client";

import { useState, useMemo } from "react";
import { useGetApplications } from "@/src/features/shared/applications/hooks";
import {
  useGetCentreInterviewDetail,
  useGetCentreInterviewBookings,
  useGetCentrePanels,
  useGetCentreStaff,
  useGetCentreProfile,
} from "@/src/features/shared/centre/hooks";
import { useGetAllTrades } from "@/src/features/shared/reference/hooks";
import { type InterviewRowData } from "../components/ViewInterviewDetailModal";

export function useInterviewDetailState(interview: InterviewRowData) {
  const { data: applications = [] } = useGetApplications();
  const { data: interviewDetail } = useGetCentreInterviewDetail(interview.id);
  const { data: bookings = [] } = useGetCentreInterviewBookings();
  const { data: panels = [] } = useGetCentrePanels();
  const { data: staff = [] } = useGetCentreStaff();
  const { data: centreProfile } = useGetCentreProfile();
  const { data: availableTrades = [] } = useGetAllTrades();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<string>("All");
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<string>("All");
  const [selectedStage, setSelectedStage] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  const resolvedPanel = useMemo(() => {
    if (interviewDetail?.panel) return interviewDetail.panel;
    if (interviewDetail?.panelId) {
      return panels.find((p) => p.id === interviewDetail.panelId) || null;
    }
    return null;
  }, [interviewDetail, panels]);

  const findStaffMatch = (assessorIdOrName?: string) => {
    if (!assessorIdOrName) return null;
    return (
      staff.find(
        (s) =>
          s.id === assessorIdOrName ||
          s.name?.toLowerCase() === assessorIdOrName.toLowerCase(),
      ) || null
    );
  };

  const leadAssessor = useMemo(() => {
    const member =
      resolvedPanel?.members?.find((m) => m.isLead) || resolvedPanel?.members?.[0];
    const match = findStaffMatch(member?.assessorId || interview.leadPanelist);
    return {
      name: match?.name || member?.name || interview.leadPanelist || staff[0]?.name || "Lead Panelist",
      email: match?.email || (member as any)?.email || staff[0]?.email || "",
      avatar: (match as any)?.avatar || (match as any)?.photoUrl || "/images/facilitator_ngozi.jpg",
    };
  }, [resolvedPanel, interview.leadPanelist, staff]);

  const memberAssessor = useMemo(() => {
    const member =
      resolvedPanel?.members?.find((m) => !m.isLead && !m.isObserver) || resolvedPanel?.members?.[1];
    const match = findStaffMatch(member?.assessorId || interview.panelMember);
    return {
      name: match?.name || member?.name || interview.panelMember || staff[1]?.name || "Panel Member",
      email: match?.email || (member as any)?.email || staff[1]?.email || "",
      avatar: (match as any)?.avatar || (match as any)?.photoUrl || "/images/facilitator_ngozi.jpg",
    };
  }, [resolvedPanel, interview.panelMember, staff]);

  const ivAssessor = useMemo(() => {
    const member =
      resolvedPanel?.members?.find((m) => m.isObserver) || resolvedPanel?.members?.[2];
    const match = findStaffMatch(member?.assessorId || interview.internalVerifier);
    return {
      name: match?.name || member?.name || interview.internalVerifier || staff[2]?.name || "Internal Verifier",
      email: match?.email || (member as any)?.email || staff[2]?.email || "",
      avatar: (match as any)?.avatar || (match as any)?.photoUrl || "/images/facilitator_ngozi.jpg",
    };
  }, [resolvedPanel, interview.internalVerifier, staff]);

  const candidatesList = useMemo(() => {
    const interviewBookings = bookings.filter((b) => b.centreInterviewId === interview.id);
    if (interviewBookings.length > 0) {
      return interviewBookings.map((b) => {
        const candidateName =
          b.candidate?.name ||
          `${(b.candidate as any)?.firstName || ""} ${(b.candidate as any)?.lastName || ""}`.trim() ||
          `Candidate (${b.application?.id?.slice(0, 8) || b.id.slice(0, 8)})`;
        const trade = b.application?.trade?.name || b.application?.type || "General Trade";
        const stage =
          b.application?.currentStageKey === "interview"
            ? "Interview Stage"
            : b.application?.currentStageKey === "folder_arrangement"
              ? "Folder Arrangement"
              : b.application?.currentStageKey
                ? b.application.currentStageKey.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
                : "Interview Stage";
        const dateObj = b.scheduledAt ? new Date(b.scheduledAt) : new Date();
        return {
          id: b.application?.id || b.id,
          candidateName,
          trade,
          assessmentType: b.application?.type?.toUpperCase() || "RPL",
          stage,
          interviewDate: dateObj.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
          interviewTime: dateObj.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        };
      });
    }

    if (applications && applications.length > 0) {
      return applications.map((app: any, idx: number) => {
        const raw = app as any;
        const candidateName =
          raw.candidate?.name ||
          `${raw.candidate?.firstName || ""} ${raw.candidate?.lastName || ""}`.trim() ||
          `Candidate (${app.id.slice(0, 8)})`;
        const trade = raw.trade?.name || (typeof raw.trade === "string" ? raw.trade : null) || app.type || "General Trade";
        const stage =
          raw.currentStageKey === "folder_arrangement"
            ? "Folder Arrangement"
            : raw.currentStageKey === "interview"
              ? "Interview Stage"
              : raw.currentStageKey
                ? raw.currentStageKey.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
                : "Interview Stage";
        const baseDate = interviewDetail?.scheduledAt || interview.scheduledAt;
        const interviewDate = baseDate
          ? new Date(baseDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
          : "—";
        const hour = 12 + (idx % 4);
        return {
          id: app.id,
          candidateName,
          trade,
          assessmentType: app.type?.toUpperCase() || "RPL",
          stage,
          interviewDate,
          interviewTime: `${hour > 12 ? hour - 12 : hour}:00pm`,
        };
      });
    }

    return [];
  }, [bookings, applications, interview, interviewDetail]);

  const tradeOptions = useMemo(() => {
    const set = new Set<string>();
    candidatesList.forEach((c) => { if (c.trade) set.add(c.trade); });
    availableTrades.forEach((t: { name: string }) => set.add(t.name));
    return Array.from(set).filter(Boolean);
  }, [candidatesList, availableTrades]);

  const stageOptions = useMemo(() => {
    const set = new Set<string>();
    candidatesList.forEach((c) => { if (c.stage) set.add(c.stage); });
    return Array.from(set).filter(Boolean);
  }, [candidatesList]);

  const filteredCandidates = useMemo(() => {
    return candidatesList.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        c.candidateName.toLowerCase().includes(q) ||
        c.trade.toLowerCase().includes(q) ||
        c.stage.toLowerCase().includes(q);
      const matchesTrade = selectedTrade === "All" || c.trade.toLowerCase() === selectedTrade.toLowerCase();
      const matchesType = selectedAssessmentType === "All" || c.assessmentType.toLowerCase() === selectedAssessmentType.toLowerCase();
      const matchesStage = selectedStage === "All" || c.stage.toLowerCase().includes(selectedStage.toLowerCase());
      return matchesSearch && matchesTrade && matchesType && matchesStage;
    });
  }, [candidatesList, searchQuery, selectedTrade, selectedAssessmentType, selectedStage]);

  const toggleSelectAll = () => {
    setSelectedCandidateIds(
      selectedCandidateIds.length === filteredCandidates.length ? [] : filteredCandidates.map((c) => c.id)
    );
  };

  const toggleSelectRow = (id: string) => {
    setSelectedCandidateIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return {
    interviewDetail,
    centreProfile,
    leadAssessor,
    memberAssessor,
    ivAssessor,
    searchQuery,
    setSearchQuery,
    selectedTrade,
    setSelectedTrade,
    selectedAssessmentType,
    setSelectedAssessmentType,
    selectedStage,
    setSelectedStage,
    viewMode,
    setViewMode,
    selectedCandidateIds,
    tradeOptions,
    stageOptions,
    filteredCandidates,
    toggleSelectAll,
    toggleSelectRow,
  };
}
