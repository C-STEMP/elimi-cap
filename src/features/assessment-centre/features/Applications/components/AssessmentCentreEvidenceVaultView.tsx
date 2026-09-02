"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiDownload,
  FiFileText,
} from "react-icons/fi";
import { ASSETS_URL } from "@/assets";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { Loader } from "@/src/components/ui/loader";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetEvidenceVault,
  useGetSelfAssessment,
  useGetApplicationById,
  useReviewApplication,
  APPLICATION_QUERY_KEYS,
} from "@/src/features/shared/applications/hooks";
import { PreviewEvidenceModal } from "@/src/features/shared/evidence-vault/components/PreviewEvidenceModal";
import type { EvidenceRecord } from "@/src/features/shared/evidence-vault/utils/evidenceConstants";

interface EvidenceVaultViewProps {
  id?: string;
  candidateName?: string;
  onBack: () => void;
  onOpenSelfAssessmentForm: () => void;
}

export const AssessmentCentreEvidenceVaultView: React.FC<
  EvidenceVaultViewProps
> = ({
  id = "",
  candidateName = "Candidate",
  onBack,
  onOpenSelfAssessmentForm,
}) => {
  const { toast } = useToast();
  const { data: remoteEvidenceItems = [], isLoading: isLoadingEvidence } =
    useGetEvidenceVault(id);
  const { data: selfAssessment } = useGetSelfAssessment(id);
  const { data: appDetail } = useGetApplicationById(id);

  const queryClient = useQueryClient();
  const reviewMutation = useReviewApplication();
  const [previewItem, setPreviewItem] = useState<EvidenceRecord | null>(null);
  const [approvedItemIds, setApprovedItemIds] = useState<Record<string, boolean>>({});
  const [isApproving, setIsApproving] = useState<boolean>(false);

  // Read persisted facilitator
  const persistedFacilitator = React.useMemo(() => {
    if (typeof window === "undefined" || !id) return null;
    try {
      const stored =
        localStorage.getItem(`elimi_assigned_facilitator_${id}`) ||
        localStorage.getItem("elimi_assigned_facilitator_active");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, [id]);

  const activeFacilitator =
    (appDetail as any)?.facilitator ||
    (appDetail as any)?.assessor ||
    (appDetail as any)?.metadata?.facilitator ||
    persistedFacilitator ||
    null;

  // Calculate required/expected count from declared candidate evidence
  const declaredEvidence = (appDetail as any)?.evidenceCandidateCanProvide;
  const declaredCount = declaredEvidence
    ? Object.entries(declaredEvidence).filter(
        ([k, v]) => v === true && k !== "other" && k !== "otherText",
      ).length
    : 0;
  const expectedCount = Math.max(declaredCount, 1);

  // Read persisted evidence items from localStorage as fallback
  const persistedEvidence: any[] = React.useMemo(() => {
    if (typeof window === "undefined" || !id) return [];
    try {
      const stored = localStorage.getItem(`elimi_evidence_vault_${id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, [id]);

  // Combine remote general evidence with persisted items, giving priority to remote backend status
  const evidenceItems = React.useMemo(() => {
    const list: any[] = [];
    const seenNames = new Set<string>();
    const seenIds = new Set<string>();

    (remoteEvidenceItems || [])
      .filter(
        (item: any) =>
          item.kind === "general" ||
          (!item.kind && (item.documentName || item.name || item.assetId)),
      )
      .forEach((item: any) => {
        const docName = (
          item.documentName ||
          item.name ||
          item.title ||
          item.filename ||
          item.originalName ||
          ""
        ).trim();
        if (!docName) return;
        const norm = docName.toLowerCase();
        seenNames.add(norm);
        if (item.id) seenIds.add(item.id);
        if (item.assetId) seenIds.add(item.assetId);
        list.push({ ...item, documentName: docName });
      });

    persistedEvidence
      .filter(
        (item: any) =>
          item.kind === "general" || (!item.kind && item.documentName),
      )
      .forEach((item: any) => {
        const docName = (
          item.documentName ||
          item.name ||
          item.title ||
          item.filename ||
          item.originalName ||
          ""
        ).trim();
        if (!docName) return;
        const norm = docName.toLowerCase();
        if (
          seenNames.has(norm) ||
          (item.id && seenIds.has(item.id)) ||
          (item.assetId && seenIds.has(item.assetId))
        ) {
          return;
        }
        seenNames.add(norm);
        if (item.id) seenIds.add(item.id);
        if (item.assetId) seenIds.add(item.assetId);
        list.push({ ...item, documentName: docName });
      });

    return list;
  }, [remoteEvidenceItems, persistedEvidence]);

  const isAllUploaded = evidenceItems.length >= expectedCount;
  const hasUnapprovedItems = evidenceItems.some((item) => {
    const isApprovedBackend =
      item.status === "approved" || item.status === "accepted";
    const isApprovedLocal =
      Boolean(approvedItemIds[item.id]) ||
      Boolean(approvedItemIds[item.assetId]) ||
      Boolean(approvedItemIds[item.documentName]);
    return !isApprovedBackend && !isApprovedLocal;
  });

  const handleApproveEvidence = async (record: EvidenceRecord | any) => {
    const targetKey = record.id || record.assetId || record.name || record.documentName;
    setIsApproving(true);
    try {
      // 1. Call backend review API first
      if (id) {
        await reviewMutation.mutateAsync({
          id,
          payload: {
            decision: "approve",
            stageKey: "folder_arrangement",
            feedback: `Evidence "${record.name || record.documentName || "document"}" approved by assessment centre.`,
          },
        });

        queryClient.invalidateQueries({
          queryKey: APPLICATION_QUERY_KEYS.evidence(id),
        });
        queryClient.invalidateQueries({
          queryKey: APPLICATION_QUERY_KEYS.stages(id),
        });
        queryClient.invalidateQueries({
          queryKey: APPLICATION_QUERY_KEYS.detail(id),
        });
        queryClient.invalidateQueries({
          queryKey: APPLICATION_QUERY_KEYS.all,
        });
      }

      // 2. Only on success, update state and previewItem
      if (targetKey) {
        setApprovedItemIds((prev) => ({ ...prev, [targetKey]: true }));
      }

      if (previewItem) {
        setPreviewItem((prev) =>
          prev
            ? {
                ...prev,
                status: "Approved",
                statusBg: "bg-[#E6F4EA]",
                statusText: "text-[#1E7F4C]",
              }
            : null,
        );
      }

      toast({
        type: "success",
        title: "Evidence Approved",
        description: `Successfully approved "${record.name || record.documentName || "Evidence document"}".`,
      });
    } catch (err: any) {
      console.error("Backend review approval error:", err);
      toast({
        type: "error",
        title: "Cannot Approve",
        description:
          err?.response?.data?.error?.message ||
          err?.message ||
          "Could not approve document. Please ensure a facilitator is assigned.",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleApproveAllEvidence = async () => {
    if (evidenceItems.length === 0) return;
    setIsApproving(true);
    try {
      // 1. Call backend review API first
      if (id) {
        await reviewMutation.mutateAsync({
          id,
          payload: {
            decision: "approve",
            stageKey: "folder_arrangement",
            feedback: "All evidence items approved by assessment centre.",
          },
        });

        queryClient.invalidateQueries({
          queryKey: APPLICATION_QUERY_KEYS.evidence(id),
        });
        queryClient.invalidateQueries({
          queryKey: APPLICATION_QUERY_KEYS.stages(id),
        });
        queryClient.invalidateQueries({
          queryKey: APPLICATION_QUERY_KEYS.detail(id),
        });
        queryClient.invalidateQueries({
          queryKey: APPLICATION_QUERY_KEYS.all,
        });
      }

      // 2. Only on success, mark all as approved in state
      const newApprovedMap: Record<string, boolean> = {};
      evidenceItems.forEach((item: any) => {
        const key = item.id || item.assetId || item.documentName || item.name;
        if (key) newApprovedMap[key] = true;
      });
      setApprovedItemIds((prev) => ({ ...prev, ...newApprovedMap }));

      toast({
        type: "success",
        title: "All Evidence Approved",
        description: `Successfully approved all ${evidenceItems.length} evidence document(s).`,
      });
    } catch (err: any) {
      console.error("Backend approve all error:", err);
      toast({
        type: "error",
        title: "Approval Failed",
        description:
          err?.response?.data?.error?.message ||
          err?.message ||
          "Could not approve evidence. Please ensure a facilitator is assigned.",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const [currentMonth, setCurrentMonth] = useState("July");
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    const idx = months.indexOf(currentMonth);
    setCurrentMonth(months[(idx - 1 + 12) % 12]);
  };

  const handleNextMonth = () => {
    const idx = months.indexOf(currentMonth);
    setCurrentMonth(months[(idx + 1) % 12]);
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">
          {/* Section 1: Resources */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-extrabold text-black tracking-tight">
              Resources
            </h2>

            {/* Resource Card 1: Self-Assessment Form Template */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <FiFileText className="w-6 h-6 text-[#a31d38]" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-black tracking-tight truncate">
                    Self-Assessment Form
                  </h3>
                  <span className="text-xs text-gray-400 font-normal">
                    {selfAssessment?.submittedAt
                      ? `Submitted on ${new Date(selfAssessment.submittedAt).toLocaleDateString("en-GB")}`
                      : "Candidate Competency Self-Assessment"}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                onClick={onOpenSelfAssessmentForm}
                variant="outline"
                size="sm"
                className="bg-white! text-[#fbab2a]! border border-gray-200! hover:bg-gray-50! font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-none! shrink-0"
              >
                View
              </Button>
            </div>

            {/* Resource Card 2: Third Party Reports */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <FiFileText className="w-6 h-6 text-[#a31d38]" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-black tracking-tight truncate">
                    Third Party Reports
                  </h3>
                  <span className="text-xs text-gray-400 font-normal">
                    Employer & Supervisor References
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  toast({
                    type: "info",
                    title: "Third Party Reports",
                    description: "No third party report document attached.",
                  })
                }
                className="bg-[#F8F9FA] border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs shrink-0"
              >
                <span>Download</span>
                <FiDownload className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Section 2: Evidence */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-extrabold text-black tracking-tight">
              Evidence Items ({evidenceItems.length})
            </h2>

            {isLoadingEvidence ? (
              <div className="p-8 flex justify-center">
                <Loader tip="Loading evidence items..." />
              </div>
            ) : evidenceItems.length > 0 ? (
              evidenceItems.map((item, idx) => {
                const statusStr = (item.status as string)?.toLowerCase() || "";
                const isApproved =
                  statusStr === "approved" ||
                  statusStr === "accepted" ||
                  statusStr === "successful";
                const isAttention =
                  statusStr === "rejected" ||
                  statusStr === "needs_attention" ||
                  statusStr === "attention_required";
                const isSubmitted = statusStr === "submitted";

                const title =
                  item.documentName ||
                  item.name ||
                  item.title ||
                  item.filename ||
                  item.originalName ||
                  `Evidence Document #${idx + 1}`;
                const fileFeedback = item.feedback || item.reviewComment;
                const displaySize =
                  item.size || item.fileSize || "Uploaded document";

                const isItemApproved =
                  isApproved ||
                  Boolean(approvedItemIds[item.id]) ||
                  Boolean(approvedItemIds[item.assetId]);

                const displayStatus = isItemApproved
                  ? "Approved"
                  : isAttention
                    ? "Attention Required"
                    : isSubmitted
                      ? "Submitted"
                      : item.status
                        ? item.status.replace(/_/g, " ")
                        : "Pending";

                const badgeBg = isItemApproved
                  ? "bg-[#E6F4EA]"
                  : isAttention
                    ? "bg-[#FCE8EB]"
                    : isSubmitted
                      ? "bg-[#FEF3C7]"
                      : "bg-[#FEF3C7]";
                const badgeText = isItemApproved
                  ? "text-[#1E7F4C]"
                  : isAttention
                    ? "text-[#A31D38]"
                    : isSubmitted
                      ? "text-[#92400E]"
                      : "text-[#92400E]";

                return (
                  <div
                    key={item.id || idx}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex flex-col gap-3 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                          <FiFileText className="w-6 h-6 text-[#a31d38]" />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-base sm:text-lg font-bold text-black tracking-tight truncate">
                              {title}
                            </h3>
                            <span
                              className={`text-xs font-semibold px-3 py-0.5 rounded-full capitalize ${badgeBg} ${badgeText}`}
                            >
                              {displayStatus}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 font-normal">
                            {displaySize}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const record: EvidenceRecord = {
                            id: item.id || `ev-${idx}`,
                            name: title,
                            size: displaySize,
                            status: isItemApproved ? "Approved" : displayStatus === "Submitted" ? "Pending" : "Pending",
                            statusBg: badgeBg,
                            statusText: badgeText,
                            assetId: item.assetId,
                            url: item.url,
                            dataUrl: item.dataUrl,
                            mimeType: item.mimeType,
                            evidenceType:
                              item.evidenceType || "General Evidence",
                          };
                          setPreviewItem(record);
                        }}
                        className="bg-white border border-gray-200 hover:bg-gray-50 text-[#fbab2a] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl cursor-pointer shrink-0 transition-colors shadow-none"
                      >
                        View
                      </button>
                    </div>

                    {fileFeedback && (
                      <div className="bg-[#FCE8EB] border border-[#F87171]/30 rounded-2xl p-4 flex flex-col gap-1 text-xs text-[#A31D38] font-medium leading-relaxed mt-1">
                        <div className="flex items-start gap-2">
                          <span className="text-sm">•</span>
                          <span>{fileFeedback}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-400 font-normal">
                No uploaded evidence files found for this candidate.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (col-span-4): Calendar + Upcoming Events + Facilitator Widget */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
          {/* 1. Dark Calendar Widget */}
          <div className="bg-[#18181b] text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-col gap-4 select-none">
            <div className="flex items-center justify-between text-white px-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                aria-label="Previous Month"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-bold text-sm sm:text-base tracking-wide">
                {currentMonth}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                aria-label="Next Month"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400">
              {daysOfWeek.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 text-center gap-y-2 text-xs font-semibold text-gray-200">
              {daysInMonth.map((day) => (
                <span
                  key={day}
                  className="p-1 rounded-full hover:bg-white/15 cursor-pointer transition-colors"
                >
                  {day}
                </span>
              ))}
            </div>
          </div>

          {/* 2. Upcoming Events Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center gap-3 py-8">
            <h3 className="text-base font-extrabold text-black self-start tracking-tight mb-2">
              Upcoming Events
            </h3>

            <div className="w-12 h-12 rounded-full bg-[#fde8ec] text-[#b3261e] flex items-center justify-center">
              <FiCalendar className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <span className="text-xs sm:text-sm font-bold text-black">
                No upcoming events
              </span>
              <span className="text-xs text-gray-400 font-normal">
                Your scheduled events will appear here
              </span>
            </div>
          </div>

          {/* 3. Facilitator Card */}
          {activeFacilitator ? (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-4">
              <h3 className="text-sm sm:text-base font-extrabold text-black tracking-tight">
                Facilitator
              </h3>

              <div className="flex items-center gap-3 bg-[#F8F9FA] rounded-2xl p-3 border border-gray-100">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-200">
                  <Image
                    src={activeFacilitator.avatar || ASSETS_URL.userAvatar}
                    alt="Facilitator Avatar"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-xs sm:text-sm font-extrabold text-black truncate">
                    {activeFacilitator.name || "Assigned Facilitator"}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 font-medium truncate">
                    Facilitator · {activeFacilitator.trade || (appDetail as any)?.trade?.name || "RPL"} (Level 3)
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span className="bg-[#FCE8EB] text-[#A31D38] text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {activeFacilitator.trade || (appDetail as any)?.trade?.name || "RPL"}
                    </span>
                    <span className="bg-[#FCE8EB] text-[#A31D38] text-[9px] font-bold px-2 py-0.5 rounded-full">
                      RPL Coordinator
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-black tracking-tight">
                Facilitator
              </h3>
              <p className="text-xs text-gray-400 font-normal leading-relaxed">
                No facilitator assigned to this candidate yet.
              </p>
            </div>
          )}
        </div>
      </div>

      <PreviewEvidenceModal
        item={previewItem}
        applicationId={id}
        onClose={() => setPreviewItem(null)}
        onApprove={handleApproveEvidence}
        isApproving={isApproving}
      />
    </div>
  );
};
