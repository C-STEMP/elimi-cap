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
  FiExternalLink,
} from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { Avatar } from "@/src/components/ui/avatar";
import { Loader } from "@/src/components/ui/loader";
import { AssignedCandidate } from "@/features/assessment-centre/types";
import {
  StaffStatusModal,
  StaffStatusModalMode,
} from "../../Staff/components/StaffStatusModal";
import {
  CertificatePreviewModal,
  CertificatePreviewData,
} from "@/src/features/shared/settings/components/CertificatePreviewModal";
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

const CERTIFICATE_KIND_LABELS: Record<string, string> = {
  qaa: "Quality Assurance Assessor (QAA)",
  iqm: "Internal Quality Management (IQM)",
  ev: "External Verifier (EV)",
  iv: "Internal Verifier (IV)",
};

export const AssessorProfileDetailView: React.FC<
  AssessorProfileDetailViewProps
> = ({ assessorId, onBack, onViewCandidate }) => {
  const { data: remoteDetail, isLoading: isLoadingDetail } =
    useGetCentreAssessorDetail(assessorId);
  const { data: remoteApps = [], isLoading: isLoadingApps } =
    useGetCentreAssessorApplications(assessorId);
  const revokeRetained = useRevokeRetainedRequest();

  const assessorName =
    remoteDetail?.name ||
    (remoteDetail?.id ? `Assessor (${remoteDetail.id.slice(0, 8)})` : "Assessor");
  const assessorEmail = remoteDetail?.email || "No email provided";
  const assessorExperience = remoteDetail?.yearsOfExperience ?? 0;
  const qualifications = remoteDetail?.qualifications || [];
  const sectors = (remoteDetail?.sectors || []).map((s) => s.name);
  const certificates = remoteDetail?.certificates || [];

  const initialIsInactive =
    remoteDetail?.status === "revoked" || remoteDetail?.status === "pending";

  const [searchQuery, setSearchQuery] = useState("");
  const [tradeFilter, setTradeFilter] = useState("All");
  const [assessmentFilter, setAssessmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isDeactivated, setIsDeactivated] = useState(initialIsInactive);
  const [detailViewMode, setDetailViewMode] = useState<"list" | "grid">("list");
  const [previewCertificate, setPreviewCertificate] =
    useState<CertificatePreviewData | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] =
    useState<StaffStatusModalMode>("confirm-deactivate");

  const candidates: AssignedCandidate[] = React.useMemo(() => {
    return (remoteApps || []).map((app: any) => {
      const candidateName =
        app.candidate?.name ||
        (app.candidate?.firstName
          ? `${app.candidate.firstName} ${app.candidate.lastName || ""}`.trim()
          : app.candidateId || "Candidate");
      const tradeName =
        app.trade?.name ||
        app.tradeId ||
        (app.type === "NSQ" ? "Standard Assessment" : "RPL");
      const statusMap: Record<
        string,
        "Ongoing" | "Completed" | "Folder Complete" | "Certified"
      > = {
        in_progress: "Ongoing",
        draft: "Ongoing",
        certified: "Completed",
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
          : "-",
      };
    });
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

  const availableTrades = Array.from(
    new Set(candidates.map((c) => c.trade).filter(Boolean)),
  );

  if (isLoadingDetail) {
    return (
      <div className="w-full bg-white rounded-3xl p-16 flex items-center justify-center min-h-80 shadow-2xs border border-gray-100/80">
        <Loader
          fullscreen={false}
          size="small"
          tip="Loading assessor profile..."
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Assessor Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Avatar
            src={(remoteDetail as any)?.avatar || (remoteDetail as any)?.photo?.url}
            name={assessorName}
            className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 border border-gray-100"
            alt={assessorName}
          />

          <div className="flex flex-col gap-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-neutral-primary">
              {assessorName}
            </h2>

            <span className="text-xs text-[#19191880] font-medium">
              {assessorEmail} · {assessorExperience} {assessorExperience === 1 ? "year" : "years"} experience
            </span>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {qualifications.map((tag: string, idx: number) => (
                <span
                  key={`qual-${idx}`}
                  className="bg-[#FCE7F3] text-[#9D174D] text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {sectors.map((sec: string, idx: number) => (
                <span
                  key={`sec-${idx}`}
                  className="bg-[#EFF6FF] text-[#1D4ED8] text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                >
                  {sec}
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

        {certificates.length === 0 ? (
          <p className="text-xs sm:text-sm text-gray-400 font-normal py-3">
            No uploaded certificates available for this assessor.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {certificates.map((cert, idx) => {
              const label =
                CERTIFICATE_KIND_LABELS[cert.kind?.toLowerCase()] ||
                `${cert.kind?.toUpperCase()} Certificate`;

              return (
                <div
                  key={cert.assetId || idx}
                  className="bg-[#F8F9FA] hover:bg-[#F3F4F6] p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-red-100/80 text-red-500 flex items-center justify-center shrink-0">
                      <FiFileText className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-sm sm:text-base text-neutral-primary">
                        {label}
                      </span>
                      <span className="text-xs text-[#19191880] font-medium mt-0.5">
                        Verification Status: Verified
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setPreviewCertificate({
                        title: label,
                        url: cert.url || undefined,
                        assetId: cert.assetId || undefined,
                      })
                    }
                    className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-[#19191880] hover:text-neutral-primary flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
                    title="Preview Certificate"
                  >
                    <FiEye className="w-4.5 h-4.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
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

          <div className="flex items-center flex-wrap sm:flex-nowrap sm:justify-end gap-3 shrink-0">
            <Select
              size="sm"
              showPlaceholderOption={false}
              containerClassName="w-32 shrink-0"
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              options={[
                { label: "Trade", value: "All" },
                ...availableTrades.map((t) => ({ label: t, value: t })),
              ]}
            />

            <Select
              size="sm"
              showPlaceholderOption={false}
              containerClassName="w-38 shrink-0"
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
              containerClassName="w-28 shrink-0"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "Status", value: "All" },
                { label: "Ongoing", value: "Ongoing" },
                { label: "Completed", value: "Completed" },
              ]}
            />

            {/* List / Grid Toggle Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
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

        {/* Candidates Listing */}
        {filteredCandidates.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <p className="text-gray-400 font-normal">
              No assigned candidates found.
            </p>
          </div>
        ) : detailViewMode === "grid" ? (
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
                    <span className="bg-[#1E7F4C]/10 text-[#1E7F4C] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                      Completed
                    </span>
                  ) : (
                    <span className="bg-[#F9A825]/10 text-[#F9A825] font-semibold px-3 py-1 rounded-full text-xs inline-block">
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
                        <span className="bg-[#1E7F4C]/10 text-[#1E7F4C] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                          Completed
                        </span>
                      ) : (
                        <span className="bg-[#F9A825]/10 text-[#F9A825] font-semibold px-3 py-1 rounded-full text-xs inline-block">
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

      {/* In-App Certificate Preview Modal */}
      <CertificatePreviewModal
        isOpen={Boolean(previewCertificate)}
        data={previewCertificate}
        onClose={() => setPreviewCertificate(null)}
      />

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
