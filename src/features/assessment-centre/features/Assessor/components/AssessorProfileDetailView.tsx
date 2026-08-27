"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FiSearch,
  FiFileText,
  FiEye,
  FiList,
  FiGrid,
  FiX,
} from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { MOCK_ASSESSORS, MOCK_ASSIGNED_CANDIDATES } from "@/features/assessment-centre/utils/constants";
import { AssignedCandidate } from "@/features/assessment-centre/types";
import { StaffStatusModal, StaffStatusModalMode } from "../../Staff/components/StaffStatusModal";
import { ASSETS_URL } from "@/assets";

import {
  useGetCentreAssessorDetail,
  useGetCentreAssessorApplications,
  useRevokeRetainedRequest,
} from "@/src/features/shared/centre/hooks";

interface AssessorProfileDetailViewProps {
  assessorId: string;
  onBack: () => void;
  onViewCandidate?: (candidateId: string) => void;
}

export const AssessorProfileDetailView: React.FC<
  AssessorProfileDetailViewProps
> = ({ assessorId, onBack, onViewCandidate }) => {
  const fallbackAssessor =
    MOCK_ASSESSORS.find((a) => a.id === assessorId) || MOCK_ASSESSORS[0];

  const { data: remoteDetail } = useGetCentreAssessorDetail(assessorId);
  const { data: remoteApps = [] } = useGetCentreAssessorApplications(assessorId);
  const revokeRetained = useRevokeRetainedRequest();

  const assessorName =
    remoteDetail?.name ||
    remoteDetail?.email?.split("@")[0] ||
    fallbackAssessor.name;
  const assessorEmail = remoteDetail?.email || fallbackAssessor.email;
  const assessorExperience =
    remoteDetail?.yearsOfExperience ?? fallbackAssessor.experienceYears ?? 8;
  const assessorTags =
    remoteDetail?.qualifications && remoteDetail.qualifications.length > 0
      ? remoteDetail.qualifications
      : (remoteDetail?.sectors || []).map((s) => s.name).length > 0
        ? (remoteDetail?.sectors || []).map((s) => s.name)
        : fallbackAssessor.tags || [];

  const initialIsInactive =
    remoteDetail?.status === "revoked" ||
    remoteDetail?.status === "pending" ||
    fallbackAssessor.status === "Inactive";

  const [searchQuery, setSearchQuery] = useState("");
  const [tradeFilter, setTradeFilter] = useState("All");
  const [assessmentFilter, setAssessmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isDeactivated, setIsDeactivated] = useState(initialIsInactive);
  const [detailViewMode, setDetailViewMode] = useState<"list" | "grid">("list");
  const [previewCertificateUrl, setPreviewCertificateUrl] = useState<
    string | null
  >(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] =
    useState<StaffStatusModalMode>("confirm-deactivate");

  const candidates: AssignedCandidate[] = React.useMemo(() => {
    if (remoteApps && remoteApps.length > 0) {
      return remoteApps.map((app: any) => {
        const candidateName =
          app.candidate?.name ||
          (app.candidate?.firstName
            ? `${app.candidate.firstName} ${app.candidate.lastName || ""}`.trim()
            : app.candidateId || "Candidate");
        const tradeName =
          app.trade?.name || app.tradeId || (app.type === "NSQ" ? "Standard Assessment" : "RPL");
        const statusMap: Record<
          string,
          "Ongoing" | "Completed" | "Folder Complete" | "Certified"
        > = {
          in_progress: "Ongoing",
          draft: "Ongoing",
          certified: "Certified",
        };
        const roleName =
          Array.isArray(app.roles) && app.roles.length > 0
            ? app.roles[0].replace(/_/g, " ")
            : "Assessor";
        return {
          id: app.id,
          role: roleName.charAt(0).toUpperCase() + roleName.slice(1),
          candidateName,
          trade: tradeName,
          assessmentType: app.type || "RPL",
          status: statusMap[app.status] || "Ongoing",
          assignedAt: app.createdAt
            ? new Date(app.createdAt).toLocaleDateString("en-GB")
            : "07/22/2026",
        };
      });
    }
    return MOCK_ASSIGNED_CANDIDATES;
  }, [remoteApps]);

  const handleConfirmDeactivate = () => {
    const retainedId = remoteDetail?.retainedRequestId || assessorId;
    revokeRetained.mutate(retainedId, {
      onSuccess: () => {
        setIsDeactivated(true);
        setStatusModalMode("deactivated-success");
      },
      onError: () => {
        setIsDeactivated(true);
        setStatusModalMode("deactivated-success");
      },
    });
  };

  const handleConfirmActivate = () => {
    setIsDeactivated(false);
    setStatusModalMode("activated-success");
  };

  const filteredCandidates = candidates.filter((cand) => {
    const matchesSearch =
      cand.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.trade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrade = tradeFilter === "All" || cand.trade === tradeFilter;
    const matchesAssessment =
      assessmentFilter === "All" || cand.assessmentType === assessmentFilter;
    const matchesStatus =
      statusFilter === "All" || cand.status === statusFilter;
    return matchesSearch && matchesTrade && matchesAssessment && matchesStatus;
  });

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Assessor Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
            <Image
              src={ASSETS_URL.userAvatar}
              alt={assessorName}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-neutral-primary">
              {assessorName}
            </h2>

            <span className="text-xs text-[#19191880] font-medium">
              {assessorEmail} · {assessorExperience} years experience
            </span>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {assessorTags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0">
          {isDeactivated ? (
            <span className="bg-black/20 text-black font-semibold px-4 py-1.5 rounded-full text-xs inline-block">
              Inactive
            </span>
          ) : (
            <span className="bg-[#1E7F4C]/20 text-[#1E7F4C] font-semibold px-4 py-1.5 rounded-full text-xs inline-block">
              Active
            </span>
          )}
        </div>
      </div>

      {/* Certificates & Qualification Section */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-4">
        <h3 className="text-lg font-extrabold text-neutral-primary tracking-tight">
          Certificates & Qualification
        </h3>

        <div className="flex flex-col gap-3">
          <div className="bg-[#F8F9FA] hover:bg-[#F3F4F6] p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-100/80 text-red-500 flex items-center justify-center shrink-0">
                <FiFileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base text-[#191918]">
                  NSQ Level 4 Carpentry
                </span>
                <span className="text-xs text-[#19191880] font-medium mt-0.5">
                  National Board for Technical Education · 2020
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPreviewCertificateUrl("NSQ Level 4 Carpentry")}
              className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-[#19191880] hover:text-neutral-primary flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Preview Certificate"
            >
              <FiEye className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="bg-[#F8F9FA] hover:bg-[#F3F4F6] p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FiFileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base text-neutral-primary">
                  Certified Trade Assessor
                </span>
                <span className="text-xs text-[#19191880] font-medium mt-0.5">
                  Nigeria Skills Qualification Awarding Body · 2021
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setPreviewCertificateUrl("Certified Trade Assessor")
              }
              className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-[#19191880] hover:text-neutral-primary flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Preview Certificate"
            >
              <FiEye className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-6">
        <h3 className="text-xl font-extrabold text-neutral-primary tracking-tight">
          Assigned Candidates
        </h3>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#19191880]" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-gray-200/80 focus:border-[#19191880] rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-neutral-primary outline-none transition-all"
            />
          </div>

          <div className="flex items-center flex-wrap sm:justify-end gap-3">
            <Select
              size="sm"
              showPlaceholderOption={false}
              containerClassName="w-32"
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              options={[
                { label: "Trade", value: "All" },
                { label: "Masonry", value: "Masonry" },
                { label: "Carpentry", value: "Carpentry" },
                { label: "Plumbing", value: "Plumbing" },
                { label: "Painting", value: "Painting" },
              ]}
            />

            <Select
              size="sm"
              showPlaceholderOption={false}
              containerClassName="w-40"
              value={assessmentFilter}
              onChange={(e) => setAssessmentFilter(e.target.value)}
              options={[
                { label: "Assessment Type", value: "All" },
                { label: "RPL", value: "RPL" },
                { label: "NSQ", value: "NSQ" },
              ]}
            />

            <Select
              size="sm"
              showPlaceholderOption={false}
              containerClassName="w-32"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "Status", value: "All" },
                { label: "Ongoing", value: "Ongoing" },
                { label: "Completed", value: "Completed" },
              ]}
            />

            {/* List / Grid Toggle Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDetailViewMode("list")}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  detailViewMode === "list"
                    ? "bg-[#FCE8EC] text-[#a31d38] shadow-2xs"
                    : "bg-[#EAEBED] text-gray-700 hover:text-neutral-primary"
                }`}
                title="List View"
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDetailViewMode("grid")}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  detailViewMode === "grid"
                    ? "bg-[#FCE8EC] text-[#a31d38] shadow-2xs"
                    : "bg-[#EAEBED] text-gray-700 hover:text-neutral-primary"
                }`}
                title="Grid View"
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* View Mode 1: Grid Card View */}
        {detailViewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidates.map((cand) => (
              <div
                key={cand.id}
                className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs hover:shadow-xs transition-all flex items-start justify-between relative group"
              >
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-sm text-neutral-primary">
                    {cand.candidateName}
                  </span>
                  <span className="text-xs text-gray-500 font-normal">
                    Role: {cand.role}
                  </span>
                  <span className="text-xs text-gray-500 font-normal">
                    Trade: {cand.trade} • {cand.assessmentType}
                  </span>
                  <span className="text-xs text-gray-400">
                    Assigned: {cand.assignedAt}
                  </span>
                </div>

                <div className="flex flex-col items-end justify-between h-full gap-4">
                  {cand.status === "Completed" ? (
                    <span className="bg-[#D1FAE5] text-[#065F46] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                      Completed
                    </span>
                  ) : (
                    <span className="bg-[#FEF3C7] text-[#D97706] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                      Ongoing
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => onViewCandidate?.(cand.id)}
                    className="text-xs lg:text-sm text-neutral-primary font-bold underline hover:text-[#a31d38] transition-colors cursor-pointer mt-2"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* View Mode 2: Table List View */
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-175">
              <thead>
                <tr className="bg-[#F8F9FA] text-gray-500 text-xs font-semibold uppercase tracking-wider rounded-xl">
                  <th className="p-3.5 rounded-l-xl">Role</th>
                  <th className="p-3.5">Candidate Name</th>
                  <th className="p-3.5">Trade</th>
                  <th className="p-3.5">Assessment Type</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Assigned at</th>
                  <th className="p-3.5 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium text-neutral-primary">
                {filteredCandidates.map((cand) => (
                  <tr
                    key={cand.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-3.5 text-neutral-secondary">
                      {cand.role}
                    </td>
                    <td className="p-3.5 font-bold text-neutral-primary">
                      {cand.candidateName}
                    </td>
                    <td className="p-3.5 text-neutral-secondary">
                      {cand.trade}
                    </td>
                    <td className="p-3.5 text-neutral-secondary">
                      {cand.assessmentType}
                    </td>
                    <td className="p-3.5">
                      {cand.status === "Completed" ? (
                        <span className="bg-[#D1FAE5] text-[#065F46] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                          Completed
                        </span>
                      ) : (
                        <span className="bg-[#FEF3C7] text-[#D97706] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                          Ongoing
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-neutral-secondary">
                      {cand.assignedAt}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onViewCandidate?.(cand.id)}
                        className="text-neutral-primary font-bold text-xs underline hover:text-[#a31d38] transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {previewCertificateUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-300 select-none"
          onClick={() => setPreviewCertificateUrl(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewCertificateUrl(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>
            <FiFileText className="w-16 h-16 text-red-400 mb-4" />
            <h3 className="text-lg font-extrabold text-neutral-primary mb-1">
              {previewCertificateUrl}
            </h3>
            <p className="text-xs text-[#19191880] mb-6">Certificate Preview</p>
            <div className="w-full bg-[#F8F9FA] rounded-2xl p-8 border border-gray-100 flex items-center justify-center min-h-48">
              <span className="text-sm text-[#19191880] font-medium">
                Certificate document preview
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPreviewCertificateUrl(null)}
              className="mt-6 w-full h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Staff / Assessor Status Modal */}
      <StaffStatusModal
        isOpen={isStatusModalOpen}
        mode={statusModalMode}
        staffName={assessorName}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirmDeactivate={handleConfirmDeactivate}
        onConfirmActivate={handleConfirmActivate}
      />
    </div>
  );
};
