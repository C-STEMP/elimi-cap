"use client";

import { Avatar } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Loader } from "@/src/components/ui/loader";
import { CandidateFormCard } from "@/src/features/assessment-centre/features/Applications/components/CandidateFormCard";
import { SelfAssessmentFormCard } from "@/src/features/assessment-centre/features/Applications/components/SelfAssessmentFormCard";
import { AssessorAssessmentFormDocumentView } from "@/src/features/assessor/features/Applications/components/assessment-forms/AssessorAssessmentFormDocumentView";
import { FormHeaderActions } from "@/src/features/assessor/features/Applications/components/form/FormHeaderActions";
import { getSharedApplicationApi } from "@/src/features/shared/applications/api/core.api";
import type {
  ApplicationDossier,
  InterviewForm,
} from "@/src/features/shared/applications/api/types";
import { PreviewEvidenceModal } from "@/src/features/shared/evidence-vault/components/PreviewEvidenceModal";
import type { EvidenceRecord } from "@/src/features/shared/evidence-vault/utils/evidenceConstants";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiAward,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiExternalLink,
  FiEye,
  FiFileText,
  FiFolder,
  FiLayers,
  FiMapPin,
  FiShield,
  FiUsers,
  FiX,
} from "react-icons/fi";

type TabKey =
  | "overview"
  | "application_form"
  | "payment"
  | "evidence_vault"
  | "interview"
  | "verification";

const ASSESSMENT_FORM_NAMES: Record<string, string> = {
  records: "Interview Question Bank & Record Sheet",
  assessment_grid: "RPL Assessment Grid / Mapping Form",
  practical_observation: "Practical Observation Record",
  skill_demonstration: "Skills Demonstration Records Form",
};

export default function SharedApplicationDossierPage() {
  const params = useParams();
  const token = (params?.token as string) || "";

  const [dossier, setDossier] = useState<ApplicationDossier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const [previewItem, setPreviewItem] = useState<EvidenceRecord | null>(null);

  const [activeFormModal, setActiveFormModal] = useState<InterviewForm | null>(
    null,
  );

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setError("Invalid or missing share token.");
      return;
    }

    getSharedApplicationApi(token)
      .then((data) => {
        setDossier(data);
        setIsLoading(false);
      })
      .catch((err: any) => {
        setError(
          err?.message ||
            "Unable to load shared application dossier. The link may have expired or been revoked.",
        );
        setIsLoading(false);
      });
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6">
        <Loader tip="Verifying and retrieving shared dossier..." />
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-200">
          <FiAlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Dossier Unavailable
        </h2>
        <p className="text-gray-600 text-sm max-w-md mb-6 leading-relaxed">
          {error ||
            "This shared application link is invalid, expired, or revoked by the assessment centre."}
        </p>
      </div>
    );
  }

  const {
    application,
    stages = [],
    appeals = [],
    interview,
    evidence,
    assessors = [],
  } = dossier;

  const candidateName =
    (application as any)?.candidate?.name ||
    `${(application as any)?.candidate?.firstName || ""} ${(application as any)?.candidate?.lastName || ""}`.trim() ||
    "Candidate";

  const candidatePhotoUrl =
    (application as any)?.candidate?.photo?.url ||
    (application as any)?.candidate?.photoAssetId ||
    (application as any)?.personalInformation?.personalDetails?.photoUrl ||
    "";

  const tradeName =
    (application as any)?.trade?.name ||
    (application as any)?.trade ||
    (application as any)?.sector?.name ||
    "Cosmetology";

  const paymentStage = stages.find((s) => s.stageKey === "payment");
  const ivStage = stages.find(
    (s) =>
      s.stageKey === "internal_verification" ||
      s.stageKey === "internal_verifier" ||
      s.stageKey === "iv_review",
  );
  const evStage = stages.find(
    (s) =>
      s.stageKey === "external_verification" ||
      s.stageKey === "external_verifier" ||
      s.stageKey === "ev",
  );

  const interviewSchedule = (interview as any)?.schedule;
  const interviewPanel = (interview as any)?.panel;
  const interviewForms: InterviewForm[] = (interview as any)?.forms || [];
  const interviewEvaluations: any[] = (interview as any)?.evaluations || [];

  const generalEvidence: any[] = (evidence as any)?.general || [];
  const selfAssessmentData = (evidence as any)?.selfAssessment?.data || null;

  const tabs: {
    id: TabKey;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: "overview",
      label: "Overview & Stages",
      icon: <FiLayers className="w-4 h-4" />,
    },
    {
      id: "application_form",
      label: "Application Form",
      icon: <FiFileText className="w-4 h-4" />,
    },
    {
      id: "payment",
      label: "Payment",
      icon: <FiCreditCard className="w-4 h-4" />,
    },
    {
      id: "evidence_vault",
      label: "Evidence Vault",
      icon: <FiFolder className="w-4 h-4" />,
    },
    {
      id: "interview",
      label: "Interview & Forms",
      icon: <FiAward className="w-4 h-4" />,
    },
    {
      id: "verification",
      label: "Verification & Panel",
      icon: <FiUsers className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#1A1A1A] py-8 px-4 sm:px-6 lg:px-8 font-sans select-text">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Top Header Card */}
        <div className="bg-[#8A1538] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6 z-10">
            <Avatar
              src={candidatePhotoUrl}
              name={candidateName}
              className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-white/40 shadow-md shrink-0"
              alt={candidateName}
            />
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
                  Official Dossier
                </span>
                <span className="bg-emerald-500/20 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-400/30">
                  <FiShield className="w-3 h-3" /> Token Verified
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {candidateName}
              </h1>
              <p className="text-white/80 text-xs sm:text-sm font-medium">
                Trade: {tradeName} &bull; Type: {application.type || "RPL"}{" "}
                &bull; Centre:{" "}
                {(application as any)?.centre?.name ||
                  "Elimi Assessment Centre"}
              </p>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-4 sm:p-5 flex flex-col items-start sm:items-end gap-1 shrink-0 z-10 backdrop-blur-xs w-full sm:w-auto">
            <span className="text-xs text-white/70 font-semibold uppercase tracking-wider">
              Overall Status
            </span>
            <span className="text-lg sm:text-xl font-bold text-white capitalize">
              {application.status === "certified"
                ? "Certified Competent"
                : application.status.replace("_", " ")}
            </span>
            <span className="text-xs text-white/80 mt-0.5">
              Submitted:{" "}
              {application.submittedAt
                ? new Date(application.submittedAt).toLocaleDateString("en-US")
                : new Date(application.createdAt).toLocaleDateString("en-US")}
            </span>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="bg-white flex items-center justify-between rounded-2xl p-2 border border-gray-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none no-print">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-[#8A1538] text-white shadow-xs"
                    : "text-gray-600 hover:text-black hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & STAGES */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6">
            {/* Quick Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Assessment Type
                </span>
                <span className="text-base font-bold text-gray-900">
                  {application.type || "RPL"}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Recognition of Prior Learning
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Assessment Centre
                </span>
                <span className="text-base font-bold text-gray-900 truncate">
                  {(application as any)?.centre?.name ||
                    "Elimi Assessment Centre"}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Accredited TVET Centre
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Internal Verification
                </span>
                <span
                  className={`text-base font-bold flex items-center gap-1.5 ${
                    ivStage?.status === "successful"
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  <FiCheckCircle className="w-4 h-4" />
                  {ivStage?.status === "successful"
                    ? "Endorsed / Competent"
                    : "In Progress"}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {(application as any)?.internalVerifier?.name
                    ? `Verifier: ${(application as any).internalVerifier.name}`
                    : "Verified Assessment"}
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  External Verification
                </span>
                <span
                  className={`text-base font-bold flex items-center gap-1.5 ${
                    evStage?.status === "successful"
                      ? "text-emerald-700"
                      : evStage?.status === "under_review" ||
                          evStage?.status === "in_progress"
                        ? "text-amber-700"
                        : "text-gray-500"
                  }`}
                >
                  <FiShield className="w-4 h-4" />
                  {evStage?.status === "successful"
                    ? "Approved"
                    : evStage?.status === "under_review" ||
                        evStage?.status === "in_progress"
                      ? "Under EV Review"
                      : "Not Started"}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Awarding Body Sign-off
                </span>
              </div>
            </div>

            {/* Stages Progression List */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FiAward className="w-5 h-5 text-[#8A1538]" /> Stage
                  Progression & Verification
                </h2>
                <span className="text-xs font-semibold text-gray-500">
                  {stages.length} Milestones Tracked
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {stages.map((stage, idx) => {
                  const statusStr = stage.status as string;
                  const isDone =
                    statusStr === "successful" ||
                    statusStr === "certified" ||
                    statusStr === "approved";
                  const isCurrent =
                    statusStr === "in_progress" || statusStr === "under_review";

                  return (
                    <div
                      key={stage.stageKey || idx}
                      className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isDone
                              ? "bg-emerald-100 text-emerald-700"
                              : isCurrent
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {isDone ? (
                            <FiCheckCircle className="w-5 h-5" />
                          ) : (
                            <FiClock className="w-5 h-5" />
                          )}
                        </div>

                        <div className="flex flex-col">
                          <span className="text-sm sm:text-base font-bold text-gray-900 capitalize">
                            {stage.label || stage.stageKey.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs text-gray-500">
                            {stage.enteredAt
                              ? `Entered on: ${new Date(
                                  stage.enteredAt,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}`
                              : "Stage pending"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <span
                          className={`text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider ${
                            isDone
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isCurrent
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {statusStr.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Appeals Record if any */}
            {appeals && appeals.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col gap-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FiFileText className="w-5 h-5 text-amber-600" /> Appeals &
                  Review Log
                </h2>
                <div className="flex flex-col gap-3">
                  {appeals.map((appeal) => (
                    <div
                      key={appeal.id}
                      className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-900 capitalize">
                          Status: {appeal.status.replace(/_/g, " ")}
                        </span>
                        <span className="text-amber-700">
                          {appeal.createdAt
                            ? new Date(appeal.createdAt).toLocaleDateString(
                                "en-US",
                              )
                            : ""}
                        </span>
                      </div>
                      <p className="text-xs text-amber-950 font-medium leading-relaxed">
                        &ldquo;{appeal.comment}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPLICATION FORM */}
        {activeTab === "application_form" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Candidate Application Form (NBTE/RPL/01)
                </h3>
                <p className="text-xs text-gray-500">
                  Submitted personal details, occupational background,
                  qualification units, and declarations.
                </p>
              </div>
              <FormHeaderActions
                formName={`Application_Form_${candidateName.replace(/\s+/g, "_")}`}
                elementId="printable-application-card"
              />
            </div>

            <CandidateFormCard
              appDetail={application}
              formCandidateName={candidateName}
              resolvedPassportUrl={candidatePhotoUrl}
              className="w-full flex flex-col gap-6 printable-application-card"
            />
          </div>
        )}

        {/* TAB 3: PAYMENT */}
        {activeTab === "payment" && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1E7F4C]/10 text-[#1E7F4C] flex items-center justify-center">
                  <FiCreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Payment & Verification
                  </h3>
                  <p className="text-xs text-gray-500">
                    Candidate assessment fee transaction record
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider ${
                  paymentStage?.status === "successful"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}
              >
                {paymentStage?.status === "successful"
                  ? "Completed / Paid"
                  : "Pending"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-gray-100 flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Payment Status
                </span>
                <span className="text-base font-bold text-emerald-700 flex items-center gap-1.5">
                  <FiCheckCircle className="w-4 h-4" />
                  {paymentStage?.status === "successful"
                    ? "Successful"
                    : "Pending"}
                </span>
                <span className="text-xs text-gray-400">
                  Direct candidate settlement
                </span>
              </div>

              <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-gray-100 flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Payment Date
                </span>
                <span className="text-base font-bold text-gray-900">
                  {paymentStage?.enteredAt
                    ? new Date(paymentStage.enteredAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )
                    : application.submittedAt
                      ? new Date(application.submittedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )
                      : "Verified"}
                </span>
                <span className="text-xs text-gray-400">Timestamp logged</span>
              </div>

              <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-gray-100 flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Receipt / Invoice
                </span>
                <span className="text-base font-bold text-gray-900">
                  Electronic Confirmation
                </span>
                <span className="text-xs text-gray-400">
                  Verified through Centre Portal
                </span>
              </div>
            </div>

            <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-gray-100 flex flex-col gap-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Payment Details Note
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                The candidate successfully completed the mandatory RPL / NSQ
                assessment fee payment. The transaction enabled the assessment
                centre to assign a designated facilitator and schedule the
                candidate for formal interview and observation.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: EVIDENCE VAULT & SELF ASSESSMENT */}
        {activeTab === "evidence_vault" && (
          <div className="flex flex-col gap-6">
            {/* General Evidence Documents */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FiFolder className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Uploaded Evidence Files
                    </h3>
                    <p className="text-xs text-gray-500">
                      Portfolio of evidence submitted by candidate
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {generalEvidence.length} Document(s)
                </span>
              </div>

              {generalEvidence.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm italic">
                  No independent evidence artifacts uploaded.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generalEvidence.map((doc: any, i: number) => {
                    const docUrl = doc.asset?.url || doc.url || "";
                    return (
                      <div
                        key={doc.id || i}
                        className="bg-[#F8F9FA] border border-gray-200/70 rounded-2xl p-4 flex flex-col justify-between gap-4 hover:shadow-xs transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#8A1538] flex items-center justify-center shrink-0">
                            <FiFileText className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate">
                              {doc.documentName || `Evidence Document ${i + 1}`}
                            </h4>
                            <span className="text-[11px] text-gray-500">
                              Type: {doc.evidenceType || "Portfolio Evidence"}
                            </span>
                            <span className="text-[10px] text-gray-400 mt-1">
                              {doc.createdAt
                                ? new Date(doc.createdAt).toLocaleDateString(
                                    "en-US",
                                  )
                                : ""}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                          {docUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewItem({
                                  id: String(doc.id || ""),
                                  name: String(
                                    doc.documentName || "Evidence Document",
                                  ),
                                  size: "Uploaded Asset",
                                  status: "Approved",
                                  statusBg: "bg-[#1E7F4C]/10",
                                  statusText: "text-[#1E7F4C]",
                                  url: docUrl,
                                  assetId: doc.assetId,
                                })
                              }
                              className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                              <FiEye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          )}
                          {docUrl && (
                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5"
                            >
                              <FiExternalLink className="w-3.5 h-3.5" />
                              <span>Open</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Self-Assessment Form (NBTE/RPL/02) */}
            {selfAssessmentData && (
              <div className="flex flex-col gap-4">
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Self-Assessment of Competency (NBTE/RPL/02)
                    </h3>
                    <p className="text-xs text-gray-500">
                      Candidate self-rating against standards, reflections, and
                      declarations
                    </p>
                  </div>
                  <FormHeaderActions
                    formName={`Self_Assessment_${candidateName.replace(/\s+/g, "_")}`}
                    elementId="printable-self-assessment-card"
                  />
                </div>

                <div id="printable-self-assessment-card">
                  <SelfAssessmentFormCard
                    resolvedPassportUrl={candidatePhotoUrl}
                    formCandidateName={candidateName}
                    resolvedFullName={candidateName}
                    personalDetails={
                      (application as any)?.personalInformation
                        ?.personalDetails ||
                      selfAssessmentData?.frozenPersonalInformation ||
                      {}
                    }
                    residentialAddress={
                      (application as any)?.personalInformation
                        ?.residentialAddress || {}
                    }
                    contactInfo={
                      (application as any)?.personalInformation
                        ?.contactInformation || {}
                    }
                    rawCompetencies={selfAssessmentData?.competencies || []}
                    reflectionData={selfAssessmentData?.reflection || {}}
                    declarationData={selfAssessmentData?.declaration || {}}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: INTERVIEW & ASSESSMENT FORMS */}
        {activeTab === "interview" && (
          <div className="flex flex-col gap-6">
            {/* Interview Event & Schedule Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                  Panel Interview &amp; Practical Demonstration
                </span>
                <h3 className="text-xl font-bold text-gray-900">
                  {interviewSchedule?.mode === "online"
                    ? "Online Interview"
                    : "Physical Assessment"}
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-600 mt-1 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <FiCalendar className="w-4 h-4 text-gray-400" />
                    {interviewSchedule?.scheduledAt
                      ? new Date(
                          interviewSchedule.scheduledAt,
                        ).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Scheduled"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FiClock className="w-4 h-4 text-gray-400" />
                    {interviewSchedule?.scheduledAt
                      ? new Date(
                          interviewSchedule.scheduledAt,
                        ).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "TBD"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FiMapPin className="w-4 h-4 text-gray-400" />
                    {interviewSchedule?.location || "C-STEMP Centre"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3.5 py-1 rounded-full uppercase">
                  Interview Evaluated
                </span>
              </div>
            </div>

            {/* Assessment Forms List */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Standard Assessment Forms
                  </h3>
                  <p className="text-xs text-gray-500">
                    Official NBTE instruments completed and signed off during
                    the assessment
                  </p>
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {interviewForms.length} Form(s)
                </span>
              </div>

              {interviewForms.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm italic">
                  No interview assessment forms recorded.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {interviewForms.map((form) => {
                    const title =
                      ASSESSMENT_FORM_NAMES[form.formType] ||
                      form.formType.replace(/_/g, " ").toUpperCase();
                    const isCandidateSigned = Boolean(form.candidateSignedAt);
                    const isCompleted = form.status === "completed";

                    return (
                      <div
                        key={form.id}
                        className="bg-[#F8F9FA] rounded-2xl p-5 border border-gray-200/80 flex flex-col justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <FiFileText className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate">
                              {title}
                            </h4>
                            <span className="text-xs text-gray-500 capitalize">
                              Format: {form.formType.replace(/_/g, " ")}
                            </span>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {isCandidateSigned && (
                                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <FiCheck className="w-3 h-3" /> Candidate
                                  Signed
                                </span>
                              )}
                              {isCompleted && (
                                <span className="text-[10px] font-semibold bg-[#8A1538]/10 text-[#8A1538] px-2 py-0.5 rounded-full">
                                  Completed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end border-t border-gray-200/60 pt-3">
                          <Button
                            type="button"
                            variant="amber"
                            size="sm"
                            onClick={() => setActiveFormModal(form)}
                            className="cursor-pointer text-xs font-bold px-4 py-2 rounded-xl"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                            <span>View Full Form</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Panel Evaluations & Feedbacks */}
            {interviewEvaluations.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col gap-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FiUsers className="w-5 h-5 text-[#8A1538]" /> Panel
                  Evaluations &amp; Sign-Offs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {interviewEvaluations.map((ev, i) => {
                    const matchedAssessor = assessors.find(
                      (a: any) =>
                        a.id === ev.assessorId ||
                        a.assessorId === ev.assessorId,
                    );
                    const rawName = (matchedAssessor as any)?.name;
                    const displayName: string =
                      typeof rawName === "string" && rawName
                        ? rawName
                        : `Assessor ${i + 1}`;
                    return (
                      <div
                        key={String(ev.panelMemberId || i)}
                        className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-100 flex flex-col gap-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={
                              typeof (matchedAssessor as any)?.photo?.url ===
                              "string"
                                ? (matchedAssessor as any).photo.url
                                : typeof (matchedAssessor as any)
                                      ?.photoAssetId === "string"
                                  ? (matchedAssessor as any).photoAssetId
                                  : ""
                            }
                            name={displayName}
                            className="w-9 h-9 shrink-0 border border-gray-200"
                            alt={displayName}
                          />
                          <div className="flex flex-col min-w-0">
                            <h4 className="text-xs font-bold text-gray-900 truncate">
                              {displayName}
                            </h4>
                            <span className="text-[10px] text-gray-500">
                              {ev.signedAt
                                ? `Signed: ${new Date(ev.signedAt).toLocaleDateString("en-US")}`
                                : "Signed"}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-700 italic bg-white p-3 rounded-xl border border-gray-100">
                          &ldquo;
                          {String(ev.feedback || "Evaluated and endorsed.")}
                          &rdquo;
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: VERIFICATION & PANEL MEMBERS */}
        {activeTab === "verification" && (
          <div className="flex flex-col gap-6">
            {/* Panel & Assessors Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Assessment Panel &amp; Roles
                  </h3>
                  <p className="text-xs text-gray-500">
                    Lead Panelist, Assessors, and Quality Assurance personnel
                    assigned to this candidate
                  </p>
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {assessors.length} Verified Member(s)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {assessors.map((assessor: any, idx: number) => {
                  const isLead = (interviewPanel?.members || []).some(
                    (m: any) =>
                      (m.assessorId === assessor.id ||
                        m.userId === assessor.id) &&
                      m.isLead,
                  );
                  const isObserver = (interviewPanel?.members || []).some(
                    (m: any) =>
                      (m.assessorId === assessor.id ||
                        m.userId === assessor.id) &&
                      m.isObserver,
                  );
                  const role = isLead
                    ? "Lead Panelist"
                    : isObserver
                      ? "Internal Verifier"
                      : "Panel Member";

                  return (
                    <div
                      key={assessor.id || idx}
                      className="bg-[#F8F9FA] rounded-2xl p-5 border border-gray-200/70 flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={
                            assessor.photo?.url ||
                            assessor.photoAssetId ||
                            assessor.avatar ||
                            "/images/facilitator_ngozi.jpg"
                          }
                          name={assessor.name}
                          className="w-12 h-12 border border-gray-200 shrink-0"
                          alt={assessor.name}
                        />
                        <div className="flex flex-col min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate">
                            {assessor.name}
                          </h4>
                          <span className="text-xs font-semibold text-[#8A1538]">
                            {role}
                          </span>
                          <span className="text-[11px] text-gray-500 truncate mt-0.5">
                            {assessor.email || "Accredited Assessor"}
                          </span>
                        </div>
                      </div>

                      {assessor.qualifications &&
                        assessor.qualifications.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-gray-200/60">
                            {assessor.qualifications.map((q: string) => (
                              <span
                                key={q}
                                className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                              >
                                {q}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quality Assurance Verification Summary */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col gap-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
                Internal &amp; External Verification Status
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-gray-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Internal Verifier (IV)
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                        ivStage?.status === "successful"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {ivStage?.status === "successful"
                        ? "Competent / Approved"
                        : "In Progress"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Internal verification confirms that assessment processes
                    adhered to approved national criteria and standards prior to
                    dossier release.
                  </p>
                  {(application as any)?.internalVerifier?.name && (
                    <div className="text-xs text-gray-800 font-semibold pt-1 border-t border-gray-200/60">
                      IV Sign-Off: {(application as any).internalVerifier.name}
                    </div>
                  )}
                </div>

                <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-gray-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      External Verifier (EV)
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                        evStage?.status === "successful"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {evStage?.status === "successful"
                        ? "Competent / Certified"
                        : evStage?.status === "under_review" ||
                            evStage?.status === "in_progress"
                          ? "Under EV Review"
                          : "Pending"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    External verification conducted by the Awarding Body or
                    sector lead to finalize national certification.
                  </p>
                  <div className="text-xs text-gray-500 font-medium pt-1 border-t border-gray-200/60">
                    Status:{" "}
                    {evStage?.status
                      ? evStage.status.replace(/_/g, " ").toUpperCase()
                      : "AWAITING REVIEW"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Full Inspection of Assessment Form */}
        {activeFormModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-5xl my-auto max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#8A1538]/10 text-[#8A1538] flex items-center justify-center">
                    <FiFileText className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900">
                    {ASSESSMENT_FORM_NAMES[activeFormModal.formType] ||
                      activeFormModal.formType}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveFormModal(null)}
                  className="p-1.5 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-8 overflow-y-auto flex-1">
                <AssessorAssessmentFormDocumentView
                  applicationId={application.id}
                  formId={activeFormModal.formType}
                  candidateName={candidateName}
                  formData={(activeFormModal.data as any) || {}}
                  onBack={() => setActiveFormModal(null)}
                  formRecord={activeFormModal}
                  applicationTrade={tradeName}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal: Evidence Document Preview */}
        {previewItem && (
          <PreviewEvidenceModal
            item={previewItem}
            applicationId={application.id}
            onClose={() => setPreviewItem(null)}
          />
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 py-4">
          Powered by Elimí Competency Assessment Platform (CAP) &bull; Verified
          Public Audit Dossier
        </div>
      </div>
    </div>
  );
}
