"use client";

import { useState } from "react";
import {
  useGetApplicationById,
  useGetApplicationStages,
  useReviewApplication,
} from "@/src/features/shared/applications/hooks";

interface Props {
  id?: string;
  candidateName?: string;
  onAcceptApplication?: () => void;
}

export function useCandidateFormState({
  id = "",
  candidateName = "Candidate",
  onAcceptApplication,
}: Props) {
  const { data: appDetail, isLoading: isLoadingDetail } = useGetApplicationById(id);
  const { data: stages = [] } = useGetApplicationStages(id);
  const reviewMutation = useReviewApplication();

  const [isAccepted, setIsAccepted] = useState(false);
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
    appDetail?.candidate?.photo?.url ||
    (appDetail as any)?.candidate?.photoAssetId ||
    personalDetails?.passportUrl ||
    (personalDetails as any)?.photoUrl ||
    (appDetail as any)?.candidate?.passportUrl ||
    (appDetail as any)?.candidate?.avatar ||
    (appDetail as any)?.candidate?.photoUrl ||
    (appDetail as any)?.passportUrl ||
    "";

  const formCandidateName =
    candidateName ||
    (appDetail as any)?.candidateName ||
    (appDetail as any)?.user?.fullName ||
    "Candidate";

  const formDownloadName = `Application_Form_${formCandidateName.replace(/\s+/g, "_")}`;
  const formTitle = `Candidate Application Form - ${formCandidateName}`;

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

  return {
    appDetail,
    isLoadingDetail,
    stages,
    reviewMutation,
    isAccepted,
    isConfirmAcceptOpen,
    setIsConfirmAcceptOpen,
    isConfirmRejectOpen,
    setIsConfirmRejectOpen,
    rejectReason,
    setRejectReason,
    isAcceptSuccessOpen,
    setIsAcceptSuccessOpen,
    personalDetails,
    contactInfo,
    residentialAddress,
    evidenceCandidate,
    declaration,
    resolvedFullName,
    resolvedPassportUrl,
    formCandidateName,
    formDownloadName,
    formTitle,
    handleAccept,
    handleReject,
  };
}
