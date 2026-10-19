"use client";

import React, { useState, useMemo } from "react";
import { FiMapPin, FiVideo, FiPlus, FiTrash2 } from "react-icons/fi";
import { type InductionRowData } from "./ViewInductionDetailModal";
import { SittingCandidatesSection } from "./SittingCandidatesSection";
import { useGetApplications } from "@/src/features/shared/applications/hooks";
import {
  useGetCentreProfile,
  useGetCentreInductionById,
  useGetCentreInductions,
  useAddCentreInductionCandidates,
  useRemoveCentreInductionCandidate,
  useDeleteCentreInduction,
} from "@/src/features/shared/centre/hooks";
import { useGetAllTrades } from "@/src/features/shared/reference/hooks";
import { Select } from "@/src/components/ui/select";
import { useToast } from "@/src/components/ui/toast";
import { ConfirmDeleteInductionModal } from "./ConfirmDeleteInductionModal";

interface Props {
  induction: InductionRowData;
  onBack: () => void;
  onSelectCandidate: (candidateName: string, id?: string) => void;
}

export const InductionDetailView: React.FC<Props> = ({
  induction,
  onBack,
  onSelectCandidate,
}) => {
  const { data: applications = [] } = useGetApplications();
  const { data: centreProfile } = useGetCentreProfile();
  const { data: availableTrades = [] } = useGetAllTrades();
  const { data: inductionDetail } = useGetCentreInductionById(induction.id);
  const { data: allInductions = [] } = useGetCentreInductions();
  const addCandidatesMutation = useAddCentreInductionCandidates();
  const removeCandidateMutation = useRemoveCentreInductionCandidate();
  const deleteInductionMutation = useDeleteCentreInduction();
  const { toast } = useToast();

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<string>("All");
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<string>("All");
  const [selectedStage, setSelectedStage] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [candidateToAddId, setCandidateToAddId] = useState<string>("");

  const effectiveScheduledAt = inductionDetail?.scheduledAt || induction.scheduledAt;
  const effectiveMode = inductionDetail?.mode || induction.mode;
  const effectiveTitle =
    inductionDetail?.title || inductionDetail?.name || induction.title;
  const effectiveLink = inductionDetail?.link || induction.link;
  const effectiveLocation = inductionDetail?.location || induction.location;

  const isVirtual =
    effectiveMode?.toLowerCase() === "virtual" ||
    effectiveMode?.toLowerCase() === "online";

  const sharedDate = effectiveScheduledAt
    ? new Date(effectiveScheduledAt).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
    : induction.scheduledDate || "—";

  const sharedTime = effectiveScheduledAt
    ? new Date(effectiveScheduledAt).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : induction.scheduledTime || "—";

  const dateFormatted = effectiveScheduledAt
    ? `${sharedDate} - ${sharedTime}`
    : induction.scheduledDate
      ? `${induction.scheduledDate}${induction.scheduledTime ? ` - ${induction.scheduledTime}` : ""}`
      : "—";

  const rawAttendees = useMemo(() => {
    if (Array.isArray(inductionDetail?.attendees)) {
      return inductionDetail.attendees;
    }
    if (Array.isArray((inductionDetail as any)?.candidates)) {
      return (inductionDetail as any).candidates;
    }
    if (Array.isArray((induction as any).attendees)) {
      return (induction as any).attendees;
    }
    if (Array.isArray(induction.candidates)) {
      return induction.candidates;
    }
    return [];
  }, [inductionDetail, induction]);

  const candidatesList = useMemo(() => {
    return rawAttendees.map((attendee: any) => {
      const appId = attendee.applicationId || attendee.id;
      const matchedApp = applications.find((a: any) => a.id === appId) as any;

      const candidateName =
        attendee.candidateName ||
        attendee.candidate?.name ||
        (attendee.candidate?.firstName
          ? `${attendee.candidate.firstName} ${attendee.candidate.lastName || ""}`.trim()
          : null) ||
        matchedApp?.candidate?.name ||
        (matchedApp?.candidate?.firstName
          ? `${matchedApp.candidate.firstName} ${matchedApp.candidate.lastName || ""}`.trim()
          : null) ||
        "Candidate";

      const trade =
        attendee.trade?.name ||
        (typeof attendee.trade === "string" ? attendee.trade : null) ||
        matchedApp?.trade?.name ||
        (typeof matchedApp?.trade === "string" ? matchedApp.trade : null) ||
        "General Trade";

      const rawStageKey = attendee.currentStageKey || matchedApp?.currentStageKey;
      const stage = rawStageKey
        ? rawStageKey
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l: string) => l.toUpperCase())
        : "Induction";

      const assessmentType =
        (attendee.type || matchedApp?.type || "RPL").toUpperCase();

      return {
        id: appId,
        candidateName,
        trade,
        assessmentType,
        stage,
        interviewDate: sharedDate,
        interviewTime: sharedTime,
      };
    });
  }, [rawAttendees, applications, sharedDate, sharedTime]);

  const alreadyInductedAppIds = useMemo(() => {
    const ids = new Set<string>();
    rawAttendees.forEach((c: any) => {
      const appId = c.applicationId || c.id;
      if (appId) ids.add(appId);
    });
    allInductions.forEach((ind: any) => {
      const list = ind.attendees || ind.candidates;
      if (Array.isArray(list)) {
        list.forEach((c: any) => {
          const appId = c.applicationId || c.id;
          if (appId) ids.add(appId);
        });
      }
    });
    return ids;
  }, [rawAttendees, allInductions]);

  const eligibleToAddOptions = useMemo(() => {
    return applications
      .filter((app: any) => {
        const appType = (app.type || app.assessmentType || "RPL").toUpperCase();
        if (appType !== "RPL") return false;
        if (app.status === "rejected" || app.status === "withdrawn") return false;
        if (alreadyInductedAppIds.has(app.id)) return false;

        const isPaidExplicit =
          app.paymentStatus === "paid" ||
          app.paymentStatus === "successful" ||
          app.isPaid === true ||
          app.payment?.status === "successful" ||
          app.payment?.status === "paid";
        const isPastPaymentStage = Boolean(
          app.currentStageKey &&
            ![
              "draft",
              "submitted",
              "application_form",
              "application_review",
              "payment",
            ].includes(app.currentStageKey),
        );
        return isPaidExplicit || isPastPaymentStage;
      })
      .map((app: any) => {
        const name =
          app.candidate?.name ||
          `${app.candidate?.firstName || ""} ${app.candidate?.lastName || ""}`.trim() ||
          "Candidate";
        const tradeName =
          app.trade?.name ||
          (typeof app.trade === "string" ? app.trade : null) ||
          "General";
        return {
          label: `${name} — ${tradeName}`,
          value: app.id,
        };
      });
  }, [applications, alreadyInductedAppIds]);

  const handleAddCandidateToInduction = async () => {
    if (!candidateToAddId) return;
    try {
      await addCandidatesMutation.mutateAsync({
        inductionId: induction.id,
        applicationIds: [candidateToAddId],
      });
      setCandidateToAddId("");
    } catch {
      // handled by mutation hook
    }
  };

  const handleRemoveSelectedCandidates = async () => {
    if (selectedCandidateIds.length === 0) return;
    try {
      await Promise.all(
        selectedCandidateIds.map((applicationId) =>
          removeCandidateMutation.mutateAsync({
            inductionId: induction.id,
            applicationId,
          }),
        ),
      );
      setSelectedCandidateIds([]);
    } catch {
      // handled by mutation hook
    }
  };

  const tradeOptions = useMemo(() => {
    const set = new Set<string>();
    candidatesList.forEach((c: { trade: string }) => {
      if (c.trade) set.add(c.trade);
    });
    availableTrades.forEach((t: { name: string }) => set.add(t.name));
    return Array.from(set).filter(Boolean);
  }, [candidatesList, availableTrades]);

  const stageOptions = useMemo(() => {
    const set = new Set<string>();
    candidatesList.forEach((c: { stage: string }) => {
      if (c.stage) set.add(c.stage);
    });
    return Array.from(set).filter(Boolean);
  }, [candidatesList]);

  const filteredCandidates = useMemo(() => {
    return candidatesList.filter(
      (c: {
        id: string;
        candidateName: string;
        trade: string;
        assessmentType: string;
        stage: string;
        interviewDate: string;
        interviewTime: string;
      }) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          !searchQuery.trim() ||
          c.candidateName.toLowerCase().includes(q) ||
          c.trade.toLowerCase().includes(q) ||
          c.stage.toLowerCase().includes(q);
        const matchesTrade =
          selectedTrade === "All" ||
          c.trade.toLowerCase() === selectedTrade.toLowerCase();
        const matchesType =
          selectedAssessmentType === "All" ||
          c.assessmentType.toLowerCase() === selectedAssessmentType.toLowerCase();
        const matchesStage =
          selectedStage === "All" ||
          c.stage.toLowerCase().includes(selectedStage.toLowerCase());
        return matchesSearch && matchesTrade && matchesType && matchesStage;
      },
    );
  }, [
    candidatesList,
    searchQuery,
    selectedTrade,
    selectedAssessmentType,
    selectedStage,
  ]);

  const toggleSelectAll = () => {
    setSelectedCandidateIds(
      selectedCandidateIds.length === filteredCandidates.length
        ? []
        : filteredCandidates.map((c: { id: string }) => c.id),
    );
  };

  const toggleSelectRow = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleDeleteInduction = async () => {
    try {
      await deleteInductionMutation.mutateAsync(induction.id);
      setIsConfirmDeleteOpen(false);
      toast({
        type: "success",
        title: "Induction Deleted",
        description: "The scheduled induction has been successfully deleted.",
      });
      onBack();
    } catch (err: any) {
      toast({
        type: "error",
        title: "Delete Failed",
        description: err?.message || "Failed to delete scheduled induction.",
      });
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-2xs flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Induction Details
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-gray-950">
              {effectiveTitle || "Induction Session"}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsConfirmDeleteOpen(true)}
            disabled={deleteInductionMutation.isPending}
            className="h-9 px-3.5 border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 disabled:opacity-50"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
            <span>Delete Induction</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Title
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-950">
              {effectiveTitle || "Induction Session"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Interview Mode
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-950 flex items-center gap-1.5">
              {isVirtual ? (
                <>
                  <FiVideo className="w-4 h-4 text-[#A31D38]" />
                  <span>Virtual</span>
                </>
              ) : (
                <>
                  <FiMapPin className="w-4 h-4 text-emerald-600" />
                  <span>Physical</span>
                </>
              )}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Induction Date &amp; Time (Shared)
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-950">
              {dateFormatted}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Country
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-950">
              {induction.country || centreProfile?.address?.country || "Nigeria"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              State
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-950">
              {induction.state || centreProfile?.address?.state || "—"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              {isVirtual ? "Meeting Link" : "Street Address"}
            </span>
            {isVirtual ? (
              <a
                href={effectiveLink || "#"}
                target="_blank"
                rel="noreferrer"
                className="text-sm sm:text-base font-bold text-[#A31D38] hover:underline truncate"
              >
                {effectiveLink || "—"}
              </a>
            ) : (
              <span className="text-sm sm:text-base font-bold text-gray-950 truncate">
                {induction.streetAddress ||
                  effectiveLocation ||
                  centreProfile?.formattedAddress ||
                  centreProfile?.address?.address ||
                  "—"}
              </span>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:max-w-md">
            <div className="flex-1">
              <Select
                placeholder={
                  eligibleToAddOptions.length > 0
                    ? "Add paid RPL candidate to this induction..."
                    : "No unassigned paid RPL candidates available"
                }
                value={candidateToAddId}
                onChange={(e) => setCandidateToAddId(e.target.value)}
                options={eligibleToAddOptions}
              />
            </div>
            <button
              type="button"
              onClick={handleAddCandidateToInduction}
              disabled={!candidateToAddId || addCandidatesMutation.isPending}
              className="h-11 px-4 bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
            >
              <FiPlus className="w-4 h-4 stroke-[2.5]" />
              <span>{addCandidatesMutation.isPending ? "Adding..." : "Add Candidate"}</span>
            </button>
          </div>

          {selectedCandidateIds.length > 0 && (
            <button
              type="button"
              onClick={handleRemoveSelectedCandidates}
              disabled={removeCandidateMutation.isPending}
              className="h-10 px-4 bg-[#FCE8EC] hover:bg-[#FAD1D8] text-[#A31D38] font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors self-end sm:self-auto"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>
                {removeCandidateMutation.isPending
                  ? "Removing..."
                  : `Remove Selected (${selectedCandidateIds.length})`}
              </span>
            </button>
          )}
        </div>
      </div>

      <SittingCandidatesSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTrade={selectedTrade}
        setSelectedTrade={setSelectedTrade}
        selectedAssessmentType={selectedAssessmentType}
        setSelectedAssessmentType={setSelectedAssessmentType}
        selectedStage={selectedStage}
        setSelectedStage={setSelectedStage}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedCandidateIds={selectedCandidateIds}
        tradeOptions={tradeOptions}
        stageOptions={stageOptions}
        filteredCandidates={filteredCandidates}
        toggleSelectAll={toggleSelectAll}
        toggleSelectRow={toggleSelectRow}
        onSelectCandidate={onSelectCandidate}
      />

      <ConfirmDeleteInductionModal
        isOpen={isConfirmDeleteOpen}
        isSubmitting={deleteInductionMutation.isPending}
        count={1}
        inductionTitle={effectiveTitle}
        onConfirm={handleDeleteInduction}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </div>
  );
};

