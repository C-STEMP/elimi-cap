"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiArrowLeft, FiCheckCircle, FiClock, FiFileText, FiEdit3 } from "react-icons/fi";
import { ASSETS_URL } from "@/src/assets";
import { FormHeaderActions } from "../form/FormHeaderActions";
import { CandidateInterviewFormModal } from "@/src/features/candidate/features/Application/components/CandidateInterviewFormModal";
import type { InterviewForm } from "@/src/features/shared/applications/api/types";
import {
  useUpdateInterviewForm,
  useGetInterviewPanel,
} from "@/src/features/shared/applications/hooks";
import { useToast } from "@/src/components/ui/toast";
import { useAppSelector } from "@/src/store/hooks";
import { getAutoFilledUnitTitleCode } from "./utils";

interface AssessorAssessmentFormDocumentViewProps {
  applicationId?: string;
  formId: string;
  candidateName: string;
  formData?: Record<string, any>;
  onBack: () => void;
  isCandidate?: boolean;
  formRecord?: InterviewForm | null;
  applicationTrade?: string;
}

const FORM_TITLES: Record<string, { title: string; subtitle: string; code: string }> = {
  skills_demo: {
    title: "Skills Demonstration Records Form",
    subtitle: "Assessor record of occupational performance demonstration against designated occupational standards.",
    code: "NBTE/RPL/SDR-01",
  },
  skill_demonstration: {
    title: "Skills Demonstration Records Form",
    subtitle: "Assessor record of occupational performance demonstration against designated occupational standards.",
    code: "NBTE/RPL/SDR-01",
  },
  observation_checklist: {
    title: "Practical Observation Record",
    subtitle: "Assessor on-site observation of real-time occupational tasks under industrial conditions.",
    code: "NBTE/RPL/POR-02",
  },
  practical_observation: {
    title: "Practical Observation Record",
    subtitle: "Assessor on-site observation of real-time occupational tasks under industrial conditions.",
    code: "NBTE/RPL/POR-02",
  },
  interview_record: {
    title: "Interview Question Bank & Record Sheet",
    subtitle: "Structured oral questioning instrument assessing theoretical knowledge, safety protocols, and problem-solving.",
    code: "NBTE/RPL/IQB-03",
  },
  records: {
    title: "Interview Question Bank & Record Sheet",
    subtitle: "Structured oral questioning instrument assessing theoretical knowledge, safety protocols, and problem-solving.",
    code: "NBTE/RPL/IQB-03",
  },
  assessment_mapping: {
    title: "RPL Assessment Grid / Mapping Form",
    subtitle: "Matrix linking candidate evidence artifacts to National Occupational Standards and Performance Criteria.",
    code: "NBTE/RPL/AGM-04",
  },
  assessment_grid: {
    title: "RPL Assessment Grid / Mapping Form",
    subtitle: "Matrix linking candidate evidence artifacts to National Occupational Standards and Performance Criteria.",
    code: "NBTE/RPL/AGM-04",
  },
};

const FORM_BACKEND_MAP: Record<
  string,
  "skill_demonstration" | "assessment_grid" | "practical_observation" | "records"
> = {
  skills_demo: "skill_demonstration",
  skill_demonstration: "skill_demonstration",
  observation_checklist: "practical_observation",
  practical_observation: "practical_observation",
  interview_record: "records",
  records: "records",
  assessment_mapping: "assessment_grid",
  assessment_grid: "assessment_grid",
};

export const AssessorAssessmentFormDocumentView: React.FC<
  AssessorAssessmentFormDocumentViewProps
> = ({
  applicationId,
  formId,
  candidateName,
  formData: initialFormData,
  onBack,
  isCandidate = false,
  formRecord,
  applicationTrade,
}) => {
  const { toast } = useToast();
  const user = useAppSelector((state) => state.auth.user);
  const [formData, setFormData] = useState<Record<string, any> | undefined>(initialFormData);

  React.useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const { data: interviewPanel } = useGetInterviewPanel(applicationId || "");
  const updateFormMutation = useUpdateInterviewForm(applicationId || "");
  const [isSigningRole, setIsSigningRole] = useState<string | null>(null);

  const currentAssessorId = (user as any)?.assessorId || (user as any)?.profileId || user?.id;
  const currentAssessorEmail = user?.email?.toLowerCase();

  const isMemberMatch = (m: any) => {
    if (!m) return false;
    const mAssessorId = (m.assessorId || m.userId || m.id || "").toString().toLowerCase().trim();
    const mEmail = (m.email || "").toLowerCase().trim();
    const mName = (m.name || "").toLowerCase().trim();

    if (currentAssessorEmail && mEmail && mEmail === currentAssessorEmail) return true;
    if (currentAssessorId && (mAssessorId === currentAssessorId.toString().toLowerCase().trim())) return true;
    if (user?.id && (mAssessorId === user.id.toLowerCase().trim())) return true;
    const userNames = [
      user?.fullName,
      (user as any)?.name,
      (user as any)?.firstName,
      (user as any)?.lastName,
      `${(user as any)?.firstName || ""} ${(user as any)?.lastName || ""}`.trim(),
    ].filter(Boolean).map((n) => (n as string).toLowerCase().trim());

    if (mName && userNames.some((n) => n === mName || n.includes(mName) || mName.includes(n))) return true;
    return false;
  };

  const leadMember = interviewPanel?.members?.find((m: any) => m.isLead);
  const panelMember = interviewPanel?.members?.find((m: any) => !m.isLead && !m.isObserver);
  const ivMember = interviewPanel?.members?.find((m: any) => m.isObserver);

  const isAssessorUser = !isCandidate && Boolean(
    user?.role?.toLowerCase()?.includes("assessor") ||
    user?.role?.toLowerCase()?.includes("centre") ||
    user?.role?.toLowerCase()?.includes("center") ||
    user?.role?.toLowerCase()?.includes("facilitator") ||
    user?.role?.toLowerCase()?.includes("admin")
  );

  const isMatchLead = Boolean(leadMember && isMemberMatch(leadMember));
  const isMatchIV = Boolean(ivMember && isMemberMatch(ivMember));
  const isMatchPanelMember = Boolean(panelMember && isMemberMatch(panelMember));

  const canSignLead = isAssessorUser && (
    leadMember ? isMatchLead : true
  );

  const canSignPanelMember = isAssessorUser && (
    panelMember ? isMatchPanelMember : (!isMatchLead && !isMatchIV)
  );

  const canSignIV = isAssessorUser && (
    ivMember
      ? isMatchIV
      : user?.role?.toLowerCase()?.includes("iv") ||
        user?.role?.toLowerCase()?.includes("verifier")
  );

  const handleSignAsRole = async (role: "lead" | "assessor") => {
    if (!applicationId) {
      toast({ type: "error", title: "Missing Application", description: "Application ID is required to sign." });
      return;
    }
    setIsSigningRole(role);
    try {
      const now = new Date().toISOString();
      const uName = user?.fullName || (user as any)?.name || "";
      const updatedData: Record<string, any> = {
        ...(formData || {}),
        leadPanelistSigned: true,
        leadPanelistSignedAt: now,
        assessorSigned: true,
        assessorSignedAt: now,
      };

      if (uName) {
        updatedData.leadPanelistName = uName;
        updatedData.assessorName = uName;
      }

      await updateFormMutation.mutateAsync({
        formType: FORM_BACKEND_MAP[formId] || "records",
        data: updatedData,
      });

      setFormData(updatedData);

      toast({
        type: "success",
        title: "Form Signed",
        description: `Successfully signed form as ${isInterviewRecord ? "Lead Panelist" : "Assessor"}.`,
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Signature Failed",
        description: err?.message || "Failed to append signature.",
      });
    } finally {
      setIsSigningRole(null);
    }
  };

  const [isCandidateSignModalOpen, setIsCandidateSignModalOpen] = useState(false);
  const isInterviewRecord =
    formId === "records" ||
    formId === "interview_record" ||
    FORM_BACKEND_MAP[formId] === "records";
  const meta = FORM_TITLES[formId] || FORM_TITLES.records;
  const candidateFullName =
    formData?.candidateFullName || candidateName || "Candidate";
  const assessorName =
    formData?.assessorName || formData?.interviewerNames || "Assessor";
  const unitTitleCode =
    formData?.unitTitleCode ||
    formData?.levelAppliedFor ||
    getAutoFilledUnitTitleCode(applicationTrade, formId) ||
    "Standard Assessment";
  const dateStr =
    formData?.demonstrationDate ||
    formData?.observationDate ||
    formData?.interviewDate ||
    formData?.dateCollected ||
    "Not specified";
  const locationStr =
    formData?.location ||
    formData?.observationSite ||
    formData?.workplaceContext ||
    "Not specified";

  const isCandidateSigned = Boolean(
    formData?.candidateSignedAt || formRecord?.candidateSignedAt,
  );

  const safeFormName = `${meta.title.replace(/\s+/g, "_")}_${candidateFullName.replace(/\s+/g, "_")}`;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-6 px-4 sm:px-6 select-text">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap no-print">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-neutral-primary hover:bg-gray-50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs whitespace-nowrap shrink-0 self-start"
        >
          <FiArrowLeft className="w-4 h-4 text-gray-500" />
          Back to Application
        </button>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap justify-end">
          {isCandidate && !isCandidateSigned && (
            <button
              type="button"
              onClick={() => setIsCandidateSignModalOpen(true)}
              className="bg-[#8A1538] hover:bg-[#72112d] text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0"
            >
              <FiEdit3 className="w-3.5 h-3.5 shrink-0" />
              <span>Sign Document</span>
            </button>
          )}
          <FormHeaderActions
            formName={safeFormName}
            elementId="printable-assessment-form"
          />
        </div>
      </div>

      {/* Printable Document Container */}
      <div
        id="printable-assessment-form"
        className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xs flex flex-col gap-8 w-full printable-container"
      >
        {/* Document Header */}
        <div className="flex flex-col items-center text-center gap-2 border-b border-gray-100 pb-6">
          <div className="flex justify-center mb-1">
            <Image
              src={ASSETS_URL.logoIcon2}
              alt="ELIMI Logo"
              width={120}
              height={48}
              className="w-auto h-9 object-contain"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <span className="text-[11px] font-bold tracking-widest text-[#8A1538] uppercase">
            {meta.code}
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-neutral-primary tracking-tight uppercase max-w-2xl leading-tight">
            {meta.title}
          </h2>
          <p className="text-xs text-neutral-secondary max-w-lg">
            {meta.subtitle}
          </p>
        </div>

        {/* Section 1: Particulars */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[11px] font-bold text-neutral-primary uppercase tracking-widest border-b border-gray-100 pb-2">
            Assessment Information & Particulars
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-[#F8F9FA] rounded-2xl p-4 border border-gray-100 text-xs">
            <div>
              <span className="font-semibold text-neutral-secondary block mb-0.5">Candidate Name:</span>
              <span className="font-bold text-neutral-primary text-sm">{candidateFullName}</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-secondary block mb-0.5">Assessor / Interviewer:</span>
              <span className="font-bold text-neutral-primary text-sm">{assessorName}</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-secondary block mb-0.5">Unit / Level:</span>
              <span className="font-bold text-neutral-primary text-sm">{unitTitleCode}</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-secondary block mb-0.5">Assessment Date:</span>
              <span className="font-medium text-neutral-primary">{dateStr}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold text-neutral-secondary block mb-0.5">Location / Facility / Workplace:</span>
              <span className="font-medium text-neutral-primary">{locationStr}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Form Content */}
        {renderFormContent(formId, formData)}

        {/* Section 3: Signatures */}
        <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
          <h3 className="text-[11px] font-bold text-neutral-primary uppercase tracking-widest border-b border-gray-100 pb-2">
            Signatures & Verification
          </h3>
          {/* Section 3: Signatures & Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Lead Panelist / Assessor */}
            <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-100 flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-neutral-secondary">
                {isInterviewRecord ? "Lead Panelist:" : "Assessor:"}
              </span>
              {formData?.leadPanelistSigned || formData?.assessorSigned || formData?.leadPanelistSignedAt || formData?.assessorSignedAt ? (
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                  <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Signed
                    {formData?.leadPanelistName ? ` by ${formData.leadPanelistName}` : formData?.assessorName ? ` by ${formData.assessorName}` : ""}
                    {formData?.leadPanelistSignedAt || formData?.assessorSignedAt ? ` · ${new Date(formData.leadPanelistSignedAt || formData.assessorSignedAt).toLocaleDateString("en-GB")}` : ""}
                  </span>
                </div>
              ) : canSignLead ? (
                <button
                  type="button"
                  disabled={Boolean(isSigningRole)}
                  onClick={() => handleSignAsRole(isInterviewRecord ? "lead" : "assessor")}
                  className="h-9 bg-[#FFF8EB] border border-[#FBAB2A] hover:bg-[#FDEED5] text-[#FBAB2A] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <FiEdit3 className="w-3.5 h-3.5" />
                  {isSigningRole ? "Signing..." : isInterviewRecord ? "Sign as Lead Panelist" : "Sign as Assessor"}
                </button>
              ) : (
                <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                  <FiClock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Pending Signature</span>
                </div>
              )}
            </div>

            {/* Candidate */}
            <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-100 flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-neutral-secondary">Candidate:</span>
              {isCandidateSigned ? (
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                  <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Signed · {new Date(formData?.candidateSignedAt || formRecord?.candidateSignedAt || Date.now()).toLocaleDateString("en-GB")}</span>
                </div>
              ) : isCandidate ? (
                <button
                  type="button"
                  onClick={() => setIsCandidateSignModalOpen(true)}
                  className="h-9 bg-[#FFF8EB] border border-[#FBAB2A] hover:bg-[#FDEED5] text-[#FBAB2A] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <FiEdit3 className="w-3.5 h-3.5" />
                  Sign Document
                </button>
              ) : (
                <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                  <FiClock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Awaiting Signature</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {applicationId && (
        <CandidateInterviewFormModal
          isOpen={isCandidateSignModalOpen}
          onClose={() => setIsCandidateSignModalOpen(false)}
          applicationId={applicationId}
          formType={FORM_BACKEND_MAP[formId] || "records"}
          formTitle={meta.title}
          formRecord={formRecord}
          candidateName={candidateFullName}
        />
      )}
    </div>
  );
};

function renderFormContent(formId: string, formData?: Record<string, any>) {
  switch (formId) {
    case "skills_demo":
    case "skill_demonstration":
      return (
        <div className="flex flex-col gap-6">
          {/* Demonstration Details */}
          {(formData?.taskDemonstrated ||
            formData?.workplaceDescription ||
            formData?.toolsUsed) && (
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-neutral-primary uppercase tracking-wide">
                Demonstration Details
              </h4>
              <div className="grid grid-cols-1 gap-3 bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 text-xs">
                {formData?.taskDemonstrated && (
                  <div>
                    <span className="font-semibold text-neutral-secondary block mb-1">
                      Task Demonstrated:
                    </span>
                    <p className="text-neutral-primary font-medium whitespace-pre-wrap">
                      {formData.taskDemonstrated}
                    </p>
                  </div>
                )}
                {formData?.workplaceDescription && (
                  <div>
                    <span className="font-semibold text-neutral-secondary block mb-1">
                      Workplace Setup Description:
                    </span>
                    <p className="text-neutral-primary font-medium whitespace-pre-wrap">
                      {formData.workplaceDescription}
                    </p>
                  </div>
                )}
                {formData?.toolsUsed && (
                  <div>
                    <span className="font-semibold text-neutral-secondary block mb-1">
                      Tools &amp; Materials Used:
                    </span>
                    <p className="text-neutral-primary font-medium whitespace-pre-wrap">
                      {formData.toolsUsed}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Criteria Checklist Table */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-neutral-primary uppercase tracking-wide">
              Demonstration Criteria &amp; Standards Checklist
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] text-neutral-secondary font-bold border-b border-gray-200">
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">Criterion / Standard</th>
                    <th className="p-3 w-28 text-center">Demonstrated</th>
                    <th className="p-3">Assessor Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.isArray(formData?.criteria) &&
                  formData.criteria.length > 0 ? (
                    formData.criteria.map((item: any, idx: number) => (
                      <tr key={item.id || idx} className="hover:bg-gray-50/50">
                        <td className="p-3 text-center text-neutral-secondary font-bold">
                          {idx + 1}
                        </td>
                        <td className="p-3 font-semibold text-neutral-primary">
                          {item.title}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              item.demonstrated
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {item.demonstrated ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="p-3 text-neutral-secondary italic">
                          {item.comments || "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-400 italic">
                        No criteria items recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Verdict & Technical Notes */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-neutral-primary uppercase tracking-wide">
              Verdict &amp; Technical Notes
            </h4>
            <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-neutral-secondary">
                  Verdict:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    formData?.verdict === "Competent"
                      ? "bg-[#1E7F4C] text-white"
                      : "bg-[#8A1538] text-white"
                  }`}
                >
                  {formData?.verdict || "Competent"}
                </span>
              </div>
              {formData?.technicalNotes && (
                <div>
                  <span className="font-semibold text-neutral-secondary block mb-1">
                    Technical Notes:
                  </span>
                  <p className="text-neutral-primary font-medium whitespace-pre-wrap">
                    {formData.technicalNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case "observation_checklist":
    case "practical_observation":
      return (
        <div className="flex flex-col gap-6">
          {/* Checklist Table */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-neutral-primary uppercase tracking-wide">
              Observation Criteria &amp; Standards Checklist
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] text-neutral-secondary font-bold border-b border-gray-200">
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">Standard / Task</th>
                    <th className="p-3 w-28 text-center">Demonstrated</th>
                    <th className="p-3">Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.isArray(formData?.checklist) &&
                  formData.checklist.length > 0 ? (
                    formData.checklist.map((item: any, idx: number) => (
                      <tr key={item.id || idx} className="hover:bg-gray-50/50">
                        <td className="p-3 text-center text-neutral-secondary font-bold">
                          {idx + 1}
                        </td>
                        <td className="p-3 font-semibold text-neutral-primary">
                          {item.title}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              item.demonstrated
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {item.demonstrated ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="p-3 text-neutral-secondary italic">
                          {item.comments || "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-400 italic">
                        No checklist items recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Verdict & Notes */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-neutral-primary uppercase tracking-wide">
              Practical Observation Verdict &amp; Notes
            </h4>
            <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-neutral-secondary">
                  Verdict:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    formData?.verdict === "Competent"
                      ? "bg-[#1E7F4C] text-white"
                      : "bg-[#8A1538] text-white"
                  }`}
                >
                  {formData?.verdict || "Competent"}
                </span>
              </div>
              {formData?.observationNotes && (
                <div>
                  <span className="font-semibold text-neutral-secondary block mb-1">
                    Detailed Observation Notes:
                  </span>
                  <p className="text-neutral-primary font-medium whitespace-pre-wrap">
                    {formData.observationNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case "interview_record":
    case "records":
      return (
        <div className="flex flex-col gap-6">
          {/* Question Bank & Live Responses */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-neutral-primary uppercase tracking-wide">
              Question Bank &amp; Live Responses
            </h4>
            <div className="flex flex-col gap-3">
              {Array.isArray(formData?.questions) &&
              formData.questions.length > 0 ? (
                formData.questions.map((q: any, idx: number) => (
                  <div
                    key={q.id || idx}
                    className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-100 flex flex-col gap-1.5 text-xs"
                  >
                    <span className="font-bold text-neutral-primary">
                      {idx + 1}. {q.question}
                    </span>
                    <p className="text-neutral-secondary pl-3 border-l-2 border-[#8A1538] py-0.5 whitespace-pre-wrap font-medium">
                      {q.candidateResponse || (
                        <span className="italic text-gray-400">
                          No response recorded
                        </span>
                      )}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic bg-[#F8F9FA] p-4 rounded-xl">
                  No interview questions recorded.
                </p>
              )}
            </div>
          </div>

          {/* Overall Assessment */}
          {(formData?.strengths || formData?.areasForDevelopment) && (
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-neutral-primary uppercase tracking-wide">
                Overall Assessment
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 text-xs">
                {formData?.strengths && (
                  <div>
                    <span className="font-semibold text-neutral-secondary block mb-1">
                      Strengths Identified:
                    </span>
                    <p className="text-neutral-primary font-medium whitespace-pre-wrap">
                      {formData.strengths}
                    </p>
                  </div>
                )}
                {formData?.areasForDevelopment && (
                  <div>
                    <span className="font-semibold text-neutral-secondary block mb-1">
                      Areas for Development:
                    </span>
                    <p className="text-neutral-primary font-medium whitespace-pre-wrap">
                      {formData.areasForDevelopment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );

    case "assessment_mapping":
    case "assessment_grid":
      return (
        <div className="flex flex-col gap-6">
          {/* Occupational Units & Mapping Grid */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-neutral-primary uppercase tracking-wide">
              Occupational Units &amp; Competency Grid
            </h4>
            <div className="flex flex-col gap-3.5">
              {Array.isArray(formData?.units) && formData.units.length > 0 ? (
                formData.units.map((unit: any, idx: number) => (
                  <div
                    key={unit.id || idx}
                    className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-primary text-sm">
                        Unit #{idx + 1}: {unit.occupationalUnit || "Untitled Unit"}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                          unit.status === "Satisfied"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {unit.status || "Satisfied"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {unit.performanceCriteria && (
                        <div>
                          <span className="font-semibold text-neutral-secondary block mb-0.5">
                            Performance Criteria:
                          </span>
                          <p className="text-neutral-primary font-medium">
                            {unit.performanceCriteria}
                          </p>
                        </div>
                      )}
                      {unit.typeOfEvidence && (
                        <div>
                          <span className="font-semibold text-neutral-secondary block mb-0.5">
                            Type of Evidence:
                          </span>
                          <p className="text-neutral-primary font-medium">
                            {unit.typeOfEvidence}
                          </p>
                        </div>
                      )}
                    </div>

                    {unit.description && (
                      <div className="text-xs">
                        <span className="font-semibold text-neutral-secondary block mb-0.5">
                          Description:
                        </span>
                        <p className="text-neutral-primary font-medium whitespace-pre-wrap">
                          {unit.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic bg-[#F8F9FA] p-4 rounded-xl">
                  No competency units recorded.
                </p>
              )}
            </div>
          </div>

          {/* Overall Comments */}
          {formData?.overallComments && (
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-neutral-primary uppercase tracking-wide">
                Overall Grid Summary
              </h4>
              <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 text-xs">
                <p className="text-neutral-primary font-medium whitespace-pre-wrap">
                  {formData.overallComments}
                </p>
              </div>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}
