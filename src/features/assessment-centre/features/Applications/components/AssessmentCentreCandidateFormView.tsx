"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiCheck, FiDownload, FiPrinter } from "react-icons/fi";
import { ASSETS_URL } from "@/assets";
import { Button } from "@/src/components/ui/button";
import { PassportUpload } from "@/src/components/ui/passport-upload";
import { Loader } from "@/src/components/ui/loader";
import { downloadFormElement, printFormElement } from "@/src/lib/formPrintDownload";
import { Avatar } from "@/src/components/ui/avatar";
import {
  useGetApplicationById,
  useGetApplicationHistory,
  useGetApplicationStages,
  useReviewApplication,
} from "@/src/features/shared/applications/hooks";

interface CandidateFormViewProps {
  id?: string;
  candidateName?: string;
  onBack: () => void;
  onAcceptApplication?: () => void;
}

export const AssessmentCentreCandidateFormView: React.FC<
  CandidateFormViewProps
> = ({ id = "", candidateName = "Candidate", onBack, onAcceptApplication }) => {
  const { data: appDetail, isLoading: isLoadingDetail } = useGetApplicationById(id);
  const { data: stages = [] } = useGetApplicationStages(id);
  const { data: appHistory = [] } = useGetApplicationHistory(id);
  const reviewMutation = useReviewApplication();

  const [feedback, setFeedback] = useState("");
  const [isAccepted, setIsAccepted] = useState(false);
  const [localComments, setLocalComments] = useState<string[]>([]);
  const [isFeedbackSuccessOpen, setIsFeedbackSuccessOpen] = useState(false);
  const [isConfirmAcceptOpen, setIsConfirmAcceptOpen] = useState(false);
  const [isConfirmRejectOpen, setIsConfirmRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isAcceptSuccessOpen, setIsAcceptSuccessOpen] = useState(false);

  const personalDetails = appDetail?.personalInformation?.personalDetails;
  const contactInfo = appDetail?.personalInformation?.contactInformation;
  const residentialAddress = appDetail?.personalInformation?.residentialAddress;
  const evidenceCandidate = appDetail?.evidenceCandidateCanProvide;
  const declaration = appDetail?.assessmentDeclaration;

  const resolvedFullName =
    personalDetails?.firstName
      ? `${personalDetails.firstName} ${personalDetails.lastName || ""}`.trim()
      : appDetail?.candidate?.name || candidateName;

  const resolvedPassportUrl =
    personalDetails?.passportUrl ||
    (personalDetails as any)?.photoUrl ||
    (personalDetails as any)?.photo ||
    (appDetail as any)?.candidate?.passportUrl ||
    (appDetail as any)?.candidate?.avatar ||
    (appDetail as any)?.candidate?.photoUrl ||
    (appDetail as any)?.passportUrl ||
    (appDetail as any)?.photoUrl ||
    (appDetail as any)?.frozenProfile?.passportUrl ||
    (appDetail as any)?.frozenProfile?.personalDetails?.passportUrl ||
    "";

  const historyComments = (appHistory as any[])
    .filter((h) => h.comment || h.feedback)
    .map((h) => h.comment || h.feedback);

  const allComments = [...localComments, ...historyComments];

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    const commentText = feedback.trim();

    if (id) {
      reviewMutation.mutate(
        {
          id,
          payload: {
            decision: "approve",
            stageKey: "application_form",
            feedback: commentText,
          },
        },
        {
          onSuccess: () => {
            setLocalComments((prev) => [commentText, ...prev]);
            setFeedback("");
            setIsFeedbackSuccessOpen(true);
          },
        },
      );
    } else {
      setLocalComments((prev) => [commentText, ...prev]);
      setFeedback("");
      setIsFeedbackSuccessOpen(true);
    }
  };

  const handleAccept = () => {
    if (id) {
      reviewMutation.mutate(
        {
          id,
          payload: {
            decision: "approve",
            stageKey: "application_form",
            feedback: "Application accepted by Assessment Centre",
          },
        },
        {
          onSuccess: () => {
            setIsConfirmAcceptOpen(false);
            setIsAccepted(true);
            setIsAcceptSuccessOpen(true);
            onAcceptApplication?.();
          },
        },
      );
    } else {
      setIsConfirmAcceptOpen(false);
      setIsAccepted(true);
      setIsAcceptSuccessOpen(true);
      onAcceptApplication?.();
    }
  };

  const handleReject = () => {
    if (id) {
      reviewMutation.mutate(
        {
          id,
          payload: {
            decision: "reject",
            stageKey: "application_form",
            feedback: rejectReason || "Application was rejected by Assessment Centre",
          },
        },
        {
          onSuccess: () => {
            setIsConfirmRejectOpen(false);
            setRejectReason("");
          },
        },
      );
    } else {
      setIsConfirmRejectOpen(false);
    }
  };

  if (isLoadingDetail && !appDetail) {
    return (
      <div className="w-full min-h-100 flex items-center justify-center">
        <Loader tip="Loading application form..." />
      </div>
    );
  }

  const formCandidateName =
    candidateName ||
    (appDetail as any)?.candidateName ||
    (appDetail as any)?.user?.fullName ||
    "Candidate";
  const formDownloadName = `Application_Form_${formCandidateName.replace(/\s+/g, "_")}`;
  const formTitle = `Candidate Application Form - ${formCandidateName}`;

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="flex items-center justify-end gap-3 no-print">
        <a
          href="#"
          download={formDownloadName}
          onClick={(e) => {
            e.preventDefault();
            downloadFormElement("printable-application-card", formDownloadName);
          }}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <span>Download</span>
          <FiDownload className="w-4 h-4 text-gray-500" />
        </a>

        <button
          type="button"
          onClick={() => printFormElement("printable-application-card", formTitle)}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <span>Print</span>
          <FiPrinter className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div id="printable-application-card" className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 printable-application-card">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm flex flex-col gap-8">
            <div className="flex flex-col items-center text-center gap-3 border-b border-gray-100 pb-6 relative">
              <div className="flex justify-center mb-1">
                <Image
                  src={ASSETS_URL.logoIcon2}
                  alt="ELIMI Logo"
                  width={100}
                  height={40}
                  className="w-auto h-8 object-contain"
                />
              </div>

              <h2 className="text-base sm:text-lg font-extrabold text-black tracking-tight max-w-lg leading-tight uppercase">
                NBTE/RPL/ 01 NSQ/RPL/QCF ASSESSMENT CENTRE CANDIDATE APPLICATION
                FORM
              </h2>

              <div className="sm:absolute sm:top-0 sm:right-0 mt-4 sm:mt-0">
                <Avatar
                  src={resolvedPassportUrl}
                  name={formCandidateName}
                  shape="rounded"
                  className="w-28 sm:w-32 h-28 sm:h-32 border-2 border-dashed border-[#a31d38]/20 bg-[#fdf2f5] p-1 shadow-2xs"
                  alt="Candidate Passport"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
                <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                  <span className="font-semibold text-black shrink-0 w-32">
                    Full Name:
                  </span>
                  <span className="text-gray-800 font-medium">
                    {resolvedFullName}
                  </span>
                </div>
                <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                  <span className="font-semibold text-black shrink-0 w-32">
                    Date of Birth:
                  </span>
                  <span className="text-gray-700">
                    {personalDetails?.dob ? new Date(personalDetails.dob).toLocaleDateString("en-GB") : "------"}
                  </span>
                </div>
                <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                  <span className="font-semibold text-black shrink-0 w-32">
                    Address:
                  </span>
                  <span className="text-gray-700">
                    {residentialAddress?.address || [residentialAddress?.lga, residentialAddress?.state, residentialAddress?.country].filter(Boolean).join(", ") || "------"}
                  </span>
                </div>
                <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                  <span className="font-semibold text-black shrink-0 w-32">
                    Phone Number:
                  </span>
                  <span className="text-gray-700">
                    {contactInfo?.phoneNumber?.number ? `${contactInfo.phoneNumber.countryCode || "+234"} ${contactInfo.phoneNumber.number}` : "------"}
                  </span>
                </div>
                <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                  <span className="font-semibold text-black shrink-0 w-32">
                    Email Address:
                  </span>
                  <span className="text-gray-700">
                    {contactInfo?.emailAddress || "------"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">
                Qualification / Unit(s) Being Applied For
              </h3>
              <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
                <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                  <span className="font-semibold text-black shrink-0 w-36">
                    Qualification Title:
                  </span>
                  <span className="text-gray-800 font-medium">
                    {appDetail?.trade?.name || appDetail?.sector?.name || `${appDetail?.type || "RPL"} Trade Qualification`}
                  </span>
                </div>
                <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                  <span className="font-semibold text-black shrink-0 w-36">
                    Individual Units:
                  </span>
                  <span className="text-gray-700 font-medium">
                    {appDetail?.unitIds && appDetail.unitIds.length > 0
                      ? `${appDetail.unitIds.length} Specified Qualification Unit(s)`
                      : "All Mandatory and Elective Units"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">
                Assessment Centre Details
              </h3>
              <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
                <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                  <span className="font-semibold text-black shrink-0 w-36">
                    Centre Name:
                  </span>
                  <span className="text-gray-800 font-medium">
                    {appDetail?.centre?.name || "Elimi Assessment Centre"}
                  </span>
                </div>
                <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                  <span className="font-semibold text-black shrink-0 w-36">
                    Registration No:
                  </span>
                  <span className="text-gray-600 font-medium">
                    {appDetail?.centre?.slug || "AC-NBTE-0042"}
                  </span>
                </div>
                <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                  <span className="font-semibold text-black shrink-0 w-36">
                    Centre Address:
                  </span>
                  <span className="text-gray-600 font-medium">
                    {(appDetail?.centre as any)?.address || "Approved TVET Assessment Facility"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">
                Evidence Summary
              </h3>
              <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm text-gray-700">
                <label className="flex items-center gap-2.5 cursor-default">
                  <input
                    type="checkbox"
                    checked={Boolean(evidenceCandidate?.resume)}
                    readOnly
                    className="w-4 h-4 accent-[#a31d38] rounded cursor-default"
                  />
                  <span className={`font-medium ${Boolean(evidenceCandidate?.resume) ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
                    Resume / CV
                  </span>
                </label>
                <label className="flex items-center gap-2.5 cursor-default">
                  <input
                    type="checkbox"
                    checked={Boolean(evidenceCandidate?.workSamples)}
                    readOnly
                    className="w-4 h-4 accent-[#a31d38] rounded cursor-default"
                  />
                  <span className={`font-medium ${Boolean(evidenceCandidate?.workSamples) ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
                    Work Samples
                  </span>
                </label>
                <label className="flex items-center gap-2.5 cursor-default">
                  <input
                    type="checkbox"
                    checked={Boolean(evidenceCandidate?.certificates || evidenceCandidate?.statementsOfAttainment)}
                    readOnly
                    className="w-4 h-4 accent-[#a31d38] rounded cursor-default"
                  />
                  <span className={`font-medium ${Boolean(evidenceCandidate?.certificates || evidenceCandidate?.statementsOfAttainment) ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
                    Certificates / Statements of Attainment
                  </span>
                </label>
                <label className="flex items-center gap-2.5 cursor-default">
                  <input
                    type="checkbox"
                    checked={Boolean(evidenceCandidate?.thirdPartyReportsOrReferences)}
                    readOnly
                    className="w-4 h-4 accent-[#a31d38] rounded cursor-default"
                  />
                  <span className={`font-medium ${Boolean(evidenceCandidate?.thirdPartyReportsOrReferences) ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
                    References / Third-Party Reports
                  </span>
                </label>
                <label className="flex items-center gap-2.5 cursor-default">
                  <input
                    type="checkbox"
                    checked={Boolean(evidenceCandidate?.jobDescriptions)}
                    readOnly
                    className="w-4 h-4 accent-[#a31d38] rounded cursor-default"
                  />
                  <span className={`font-medium ${Boolean(evidenceCandidate?.jobDescriptions) ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
                    Job Descriptions
                  </span>
                </label>
                <label className="flex items-center gap-2.5 cursor-default">
                  <input
                    type="checkbox"
                    checked={Boolean(evidenceCandidate?.photosOrVideosOfWork)}
                    readOnly
                    className="w-4 h-4 accent-[#a31d38] rounded cursor-default"
                  />
                  <span className={`font-medium ${Boolean(evidenceCandidate?.photosOrVideosOfWork) ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
                    Photos / Videos of Work
                  </span>
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={Boolean(evidenceCandidate?.other)}
                    readOnly
                    className="w-4 h-4 accent-[#a31d38] rounded cursor-default"
                  />
                  <span className={`font-medium shrink-0 ${Boolean(evidenceCandidate?.other) ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
                    Other (please specify):
                  </span>
                  <div className="flex-1 border-b border-dashed border-gray-300 py-1 text-xs text-gray-700">
                    {(evidenceCandidate as any)?.otherText || (evidenceCandidate as any)?.otherDescription || "------"}
                  </div>
                </div>
              </div>
            </div>

            {/* Current and Previous Work Experience */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">
                Current and Previous Work Experience
              </h3>
              <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
                <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                  <span className="font-semibold text-black shrink-0 w-36">
                    Current Occupation:
                  </span>
                  <span className="text-gray-700">
                    {appDetail?.currentOccupation?.occupation || "------"}
                  </span>
                </div>
                <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                  <span className="font-semibold text-black shrink-0 w-36">
                    Employer (if applicable):
                  </span>
                  <span className="text-gray-700">
                    {appDetail?.currentOccupation?.employmentHistory?.[0]?.company || "------"}
                  </span>
                </div>
                <div className="flex flex-col gap-1 border-b border-gray-200/70 pb-2">
                  <span className="font-semibold text-black">
                    Previous Relevant Experience (summarize your duties, roles, responsibilities, and how they relate to this qualification):
                  </span>
                  <p className="text-gray-700 leading-relaxed text-xs sm:text-sm mt-1">
                    {appDetail?.currentOccupation?.employmentHistory?.[0]?.keyResponsibilities || "------"}
                  </p>
                </div>
              </div>
            </div>

            {/* Why are you applying for RPL? */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">
                Why are you applying for RPL?
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
                {appDetail?.reasonForSeekingRPL ||
                  "I declare that the information provided in this application is true and correct, and that the evidence submitted is a true representation of my skills, knowledge, and experience."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 border-b border-dashed border-gray-300 pb-1 text-xs sm:text-sm">
                  <span className="font-semibold text-black shrink-0">Signature:</span>
                  <span className="text-gray-700 italic">Signature Verified</span>
                </div>
                <div className="flex items-center gap-2 border-b border-dashed border-gray-300 pb-1 text-xs sm:text-sm">
                  <span className="font-semibold text-black shrink-0">Date:</span>
                  <span className="text-gray-700">
                    {appDetail?.submittedAt
                      ? new Date(appDetail.submittedAt).toLocaleDateString("en-GB")
                      : appDetail?.createdAt
                        ? new Date(appDetail.createdAt).toLocaleDateString("en-GB")
                        : "------"}
                  </span>
                </div>
              </div>
            </div>

            {/* Assessment Declaration */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">
                Assessment Declaration
              </h3>
              <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm text-gray-700">
                <label className="flex items-center gap-2.5 cursor-default">
                  <input
                    type="checkbox"
                    checked={Boolean(declaration?.infoProvidedIsAccurate ?? true)}
                    readOnly
                    className="w-4 h-4 accent-[#a31d38] rounded"
                  />
                  <span className="font-medium">
                    I confirm that the information provided is true and accurate.
                  </span>
                </label>
                <label className="flex items-center gap-2.5 cursor-default">
                  <input
                    type="checkbox"
                    checked={Boolean(declaration?.understandsDoesNotGuaranteeCertification ?? true)}
                    readOnly
                    className="w-4 h-4 accent-[#a31d38] rounded"
                  />
                  <span className="font-medium">
                    I understand that submitting this application does not guarantee certification.
                  </span>
                </label>
                <label className="flex items-center gap-2.5 cursor-default">
                  <input
                    type="checkbox"
                    checked={Boolean(declaration?.understandsThatNeedsToProvideSufficientEvidenceToDemonstrateCompetence ?? declaration?.mustProvideSufficientEvidence ?? true)}
                    readOnly
                    className="w-4 h-4 accent-[#a31d38] rounded"
                  />
                  <span className="font-medium">
                    I understand that I must provide sufficient evidence to demonstrate my competence.
                  </span>
                </label>
                <label className="flex items-center gap-2.5 cursor-default">
                  <input
                    type="checkbox"
                    checked={Boolean(declaration?.agreesToTermsAndPrivacyPolicy ?? true)}
                    readOnly
                    className="w-4 h-4 accent-[#a31d38] rounded"
                  />
                  <span className="font-medium">
                    I agree to the ELIMI <span className="text-[#a31d38] font-bold">Terms &amp; Conditions</span> and <span className="text-[#a31d38] font-bold">Privacy Policy</span>.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 no-print">
          {/* Application Review Action Panel */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col gap-4">
            <h3 className="text-base font-extrabold text-black tracking-tight">
              Application Decision
            </h3>
            {(() => {
              const appFormStage = stages.find(
                (s) =>
                  s.stageKey === "application_form" ||
                  s.stageKey === "application_review" ||
                  s.stageKey === "application",
              );

              const isApproved = Boolean(
                isAccepted ||
                appFormStage?.status === "successful" ||
                (appFormStage?.status as string) === "approved" ||
                (appDetail?.currentStageKey &&
                  appDetail.currentStageKey !== "application_form" &&
                  appDetail.currentStageKey !== "application_review" &&
                  appDetail.currentStageKey !== "draft" &&
                  appDetail.currentStageKey !== "submitted"),
              );

              const isRejected = Boolean(
                appFormStage?.status === "rejected" ||
                appDetail?.status === "rejected",
              );

              if (isApproved) {
                return (
                  <div className="bg-[#E6F4EA] border border-[#1E7F4C]/20 rounded-2xl p-4 flex flex-col gap-1.5 text-center">
                    <span className="text-xs font-bold text-[#1E7F4C]">
                      ✓ Application Approved
                    </span>
                    <span className="text-[11px] text-gray-600">
                      This application has been approved by the centre and is active in the assessment pipeline.
                    </span>
                  </div>
                );
              }

              if (isRejected) {
                return (
                  <div className="bg-[#FCE8EB] border border-[#A31D38]/20 rounded-2xl p-4 flex flex-col gap-1.5 text-center">
                    <span className="text-xs font-bold text-[#A31D38]">
                      ✕ Application Rejected
                    </span>
                    <span className="text-[11px] text-gray-600">
                      This application has been rejected by the assessment centre.
                    </span>
                  </div>
                );
              }

              return (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-gray-500 font-normal">
                    Review the details submitted by the candidate and record your decision.
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <Button
                      type="button"
                      onClick={() => setIsConfirmAcceptOpen(true)}
                      variant="amber"
                      fullWidth
                      disabled={reviewMutation.isPending}
                      className="bg-[#1E7F4C] hover:bg-[#18663D] text-white font-bold text-sm py-3 rounded-xl shadow-md cursor-pointer"
                    >
                      Approve Application
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setIsConfirmRejectOpen(true)}
                      variant="outline"
                      fullWidth
                      disabled={reviewMutation.isPending}
                      className="border-red-200 text-red-600 hover:bg-red-50 font-bold text-sm py-3 rounded-xl cursor-pointer"
                    >
                      Reject Application
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col gap-4">
            <h3 className="text-base font-extrabold text-black tracking-tight">
              Send Feedback
            </h3>
            <form onSubmit={handleSendFeedback} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Comment
                </label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Type Here"
                  className="w-full bg-[#F4F5F7] border border-gray-200 rounded-2xl p-3 text-xs sm:text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a31d38]/20 transition-all resize-none"
                />
              </div>

              <Button
                type="submit"
                variant="amber"
                fullWidth
                disabled={reviewMutation.isPending || !feedback.trim()}
                className="bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-sm py-3 rounded-xl shadow-md cursor-pointer"
              >
                {reviewMutation.isPending ? "Sending..." : "Send Feedback"}
              </Button>
            </form>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col gap-4">
            <h3 className="text-base font-extrabold text-black tracking-tight">
              Past Comments
            </h3>
            {allComments.length > 0 ? (
              <div className="flex flex-col gap-3 max-h-60 overflow-y-auto no-scrollbar">
                {allComments.map((comment, idx) => (
                  <div
                    key={idx}
                    className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-3.5 text-xs text-gray-700 leading-relaxed"
                  >
                    {comment}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4 font-normal">
                No feedback sent yet
              </p>
            )}
          </div>
        </div>
      </div>

      {isFeedbackSuccessOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 select-text">
            <div className="w-25 h-25 mb-4 flex items-center justify-center">
              <Image
                src={ASSETS_URL.successCheckmarkImg}
                alt="Success"
                width={100}
                height={100}
                className="w-25 h-25 object-contain"
                style={{ width: 100, height: 100 }}
              />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight mb-1">
              Feedback Sent Successfully
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 font-normal mb-6">
              Your feedback to candidate was sent successfully
            </p>
            <Button
              type="button"
              onClick={() => setIsFeedbackSuccessOpen(false)}
              variant="amber"
              fullWidth
              className="h-12 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-base rounded-xl shadow-md cursor-pointer"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {isConfirmAcceptOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 select-text">
            <div className="w-25 h-25 mb-4 flex items-center justify-center">
              <Image
                src={ASSETS_URL.validationWarningIcon}
                alt="Warning"
                width={100}
                height={100}
                className="w-25 h-25 object-contain"
                style={{ width: 100, height: 100 }}
              />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight mb-1">
              Are You sure?
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 font-normal mb-6">
              Confirm you want to accept this application
            </p>
            <div className="flex flex-col gap-3 w-full">
              <Button
                type="button"
                onClick={handleAccept}
                variant="amber"
                fullWidth
                disabled={reviewMutation.isPending}
                className="h-12 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-base rounded-xl shadow-md cursor-pointer"
              >
                {reviewMutation.isPending ? "Accepting..." : "Yes, Accept"}
              </Button>
              <button
                type="button"
                onClick={() => setIsConfirmAcceptOpen(false)}
                className="h-12 w-full border border-[#fbab2a] text-[#fbab2a] hover:bg-orange-50 font-bold text-base rounded-xl transition-colors cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {isConfirmRejectOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 select-text">
            <div className="w-25 h-25 mb-4 flex items-center justify-center">
              <Image
                src={ASSETS_URL.validationWarningIcon}
                alt="Reject Warning"
                width={100}
                height={100}
                className="w-25 h-25 object-contain"
                style={{ width: 100, height: 100 }}
              />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight mb-1">
              Reject Application?
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 font-normal mb-4">
              Please provide a reason for rejecting this candidate application
            </p>
            <div className="w-full mb-4">
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Specify rejection reason..."
                className="w-full bg-[#F4F5F7] border border-gray-200 rounded-xl p-3 text-xs text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 resize-none text-left"
              />
            </div>
            <div className="flex flex-col gap-3 w-full">
              <Button
                type="button"
                onClick={handleReject}
                variant="outline"
                fullWidth
                disabled={reviewMutation.isPending}
                className="h-12 bg-red-600 hover:bg-red-700 text-white border-none font-bold text-base rounded-xl shadow-md cursor-pointer"
              >
                {reviewMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
              </Button>
              <button
                type="button"
                onClick={() => setIsConfirmRejectOpen(false)}
                className="h-12 w-full border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-base rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isAcceptSuccessOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 select-text">
            <div className="w-25 h-25 mb-4 flex items-center justify-center">
              <Image
                src={ASSETS_URL.successCheckmarkImg}
                alt="Accepted"
                width={100}
                height={100}
                className="w-25 h-25 object-contain"
                style={{ width: 100, height: 100 }}
              />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight mb-1">
              Accepted Successfully
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 font-normal mb-6">
              Candidate Application was accepted successfully
            </p>
            <Button
              type="button"
              onClick={() => setIsAcceptSuccessOpen(false)}
              variant="amber"
              fullWidth
              className="h-12 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-base rounded-xl shadow-md cursor-pointer"
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
