"use client";

import { useMemo } from "react";
import { MOCK_COMPETENCY_TASKS } from "@/features/assessment-centre/utils/constants";
import {
  useGetSelfAssessment,
  useGetApplicationById,
} from "@/src/features/shared/applications/hooks";

interface Props {
  id?: string;
  candidateName?: string;
}

export function useSelfAssessmentFormState({
  id = "",
  candidateName = "Candidate",
}: Props) {
  const { data: selfAssessment, isLoading: isLoadingSelfAssessment } =
    useGetSelfAssessment(id);
  const { data: appDetail } = useGetApplicationById(id);

  const personalDetails =
    (selfAssessment as any)?.frozenPersonalInformation?.personalDetails ||
    (selfAssessment as any)?.personalInformation ||
    appDetail?.personalInformation?.personalDetails;

  const contactInfo =
    (selfAssessment as any)?.frozenPersonalInformation?.contactInformation ||
    (selfAssessment as any)?.personalInformation?.contactInformation ||
    appDetail?.personalInformation?.contactInformation;

  const residentialAddress =
    (selfAssessment as any)?.frozenPersonalInformation?.residentialAddress ||
    appDetail?.personalInformation?.residentialAddress;

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
    (appDetail as any)?.passportUrl ||
    "";

  const rawCompetencies = useMemo(() => {
    return Array.isArray(selfAssessment?.competencies) &&
      selfAssessment.competencies.length > 0
      ? selfAssessment.competencies
      : MOCK_COMPETENCY_TASKS.map((task, idx) => ({
          index: idx,
          title: task,
          confidence: "high",
          evidence: "yes",
          experience: "",
        }));
  }, [selfAssessment]);

  const reflectionData = (selfAssessment?.reflection as any) || {};
  const declarationData = (selfAssessment?.declaration as any) || {};
  const formCandidateName = candidateName || "Candidate";
  const formDownloadName = `Self_Assessment_Form_${formCandidateName.replace(/\s+/g, "_")}`;
  const formTitle = `Candidate Self Assessment Form - ${formCandidateName}`;

  return {
    selfAssessment,
    isLoadingSelfAssessment,
    appDetail,
    personalDetails,
    contactInfo,
    residentialAddress,
    resolvedFullName,
    resolvedPassportUrl,
    rawCompetencies,
    reflectionData,
    declarationData,
    formCandidateName,
    formDownloadName,
    formTitle,
  };
}
