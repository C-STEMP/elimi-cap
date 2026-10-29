"use client";

import React, { useState } from "react";
import { SkillsDemonstrationForm } from "./SkillsDemonstrationForm";
import { AssessmentMappingForm } from "./AssessmentMappingForm";
import { PracticalObservationForm } from "./PracticalObservationForm";
import { InterviewRecordForm } from "./InterviewRecordForm";
import { ConfirmSubmitFormModal } from "./ConfirmSubmitFormModal";
import { FormSubmittedSuccessModal } from "./FormSubmittedSuccessModal";
import { AssessorAssessmentFormDocumentView } from "./AssessorAssessmentFormDocumentView";

import {
  useGetInterviewFormsBundle,
  useGetInterviewPanel,
  useUpdateInterviewForm,
  useGetApplicationById,
  useGetInterviewSchedule,
  useGetApplicationAssessmentMapping,
} from "@/src/features/shared/applications/hooks";
import { usePanelMemberMatch } from "@/src/features/assessor/hooks";
import { useToast } from "@/src/components/ui/toast";
import {
  useGetUnitsByTrade,
  useGetTradeDetail,
} from "@/src/features/shared/reference/hooks";
import {
  resolveAppliedTradeLevel,
  getRplScopedUnits,
} from "@/src/features/shared/applications/utils/rplTradeLevel";
import { toUnitLabel } from "./utils";
import { useAppSelector } from "@/src/store/hooks";

interface AssessorAssessmentFormViewProps {
  applicationId: string;
  formId: string;
  candidateName: string;
  onBack: () => void;
  isReadOnly?: boolean;
  isCandidate?: boolean;
  isLeadPanelist?: boolean;
  applicationTrade?: string;
  /** Observers outside the interview (e.g. the centre) — read-only, no sign controls. */
  viewOnly?: boolean;
}

const FORM_MAP: Record<
  string,
  "skill_demonstration" | "assessment_grid" | "practical_observation" | "records"
> = {
  skills_demo: "skill_demonstration",
  skill_demonstration: "skill_demonstration",
  assessment_mapping: "assessment_grid",
  assessment_grid: "assessment_grid",
  observation_checklist: "practical_observation",
  practical_observation: "practical_observation",
  interview_record: "records",
  records: "records",
};

export const AssessorAssessmentFormView: React.FC<
  AssessorAssessmentFormViewProps
> = ({
  applicationId,
  formId,
  candidateName,
  onBack,
  isReadOnly = false,
  isCandidate = false,
  isLeadPanelist,
  applicationTrade,
  viewOnly = false,
}) => {
  const { toast } = useToast();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<Record<string, any> | null>(null);

  const { data: applicationData } = useGetApplicationById(applicationId);

  const isAssessmentMapping =
    formId === "assessment_mapping" || formId === "assessment_grid";
  const isInterviewForm =
    formId === "interview_record" || formId === "records";
  const isInterviewStage =
    !viewOnly && applicationData?.currentStageKey === "interview";

  const shouldFetchInterviewData = Boolean(
    applicationId &&
      applicationData &&
      !isAssessmentMapping &&
      (isInterviewStage || isInterviewForm),
  );

  const { data: interviewPanel } = useGetInterviewPanel(applicationId, {
    enabled: shouldFetchInterviewData,
  });
  const { data: interviewSchedule } = useGetInterviewSchedule(applicationId, {
    enabled: shouldFetchInterviewData,
  });
  const isMemberMatch = usePanelMemberMatch();
  const user = useAppSelector((state) => state.auth.user);

  const isCandidateUser = user?.role?.toLowerCase() === "candidate";
  const effectiveIsCandidate = isCandidate || isCandidateUser;

  const leadMember = interviewPanel?.members?.find((m: any) => m.isLead);
  const seatedPanelMember = interviewPanel?.members?.find(
    (m: any) => !m.isLead && !m.isObserver,
  );
  const matchedPanelMember = interviewPanel?.members?.find((m: any) =>
    isMemberMatch(m),
  );
  const ivMember = interviewPanel?.members?.find((m: any) => m.isObserver);
  const isObserverUser = Boolean(
    user?.role?.toLowerCase() === "iv" ||
      user?.role?.toLowerCase() === "verifier" ||
      (ivMember && isMemberMatch(ivMember)),
  );

  const effectiveIsLead =
    isLeadPanelist !== undefined
      ? isLeadPanelist
      : !effectiveIsCandidate &&
        !viewOnly &&
        Boolean(
          (leadMember && isMemberMatch(leadMember)) ||
            (!leadMember &&
              (applicationData as any)?.role?.toLowerCase()?.includes("lead")),
        );

  const isMatchPanelMember = Boolean(
    seatedPanelMember && isMemberMatch(seatedPanelMember),
  );
  const isMatchIV = Boolean(
    isObserverUser || (ivMember && isMemberMatch(ivMember)),
  );

  const currentUserRole: "lead" | "panel" | "iv" = React.useMemo(() => {
    if (isMatchIV) return "iv";
    if (isMatchPanelMember && !effectiveIsLead) return "panel";
    return "lead";
  }, [isMatchIV, isMatchPanelMember, effectiveIsLead]);

  const leadName =
    leadMember?.name ||
    (effectiveIsLead ? user?.fullName || (user as any)?.name : "") ||
    "Lead Panelist";
  const panelMemberName =
    seatedPanelMember?.name ||
    (!effectiveIsLead && !isMatchIV
      ? user?.fullName || (user as any)?.name
      : "") ||
    "Panel Member";
  const ivName =
    ivMember?.name ||
    (isMatchIV ? user?.fullName || (user as any)?.name : "") ||
    "Internal Verifier";

  const resolvedTrade =
    applicationTrade ||
    applicationData?.trade?.name ||
    (typeof (applicationData as any)?.trade === "string" ? (applicationData as any).trade : "") ||
    "";

  const tradeId =
    applicationData?.tradeId ||
    (applicationData?.trade as any)?.id ||
    "";
  const { data: tradeDetail } = useGetTradeDetail(tradeId);

  const { levelNumber, levelLabel } = resolveAppliedTradeLevel(
    applicationData,
    tradeDetail,
  );

  const { data: rawTradeUnits = [] } = useGetUnitsByTrade(
    tradeId,
    levelNumber,
  );

  const scopedUnits = React.useMemo(
    () =>
      getRplScopedUnits({
        tradeUnits: rawTradeUnits,
        tradeDetail,
        levelNumber,
        preferredUnitIds: applicationData?.unitIds,
      }),
    [rawTradeUnits, tradeDetail, levelNumber, applicationData?.unitIds],
  );

  const { data: assessmentMapping } =
    useGetApplicationAssessmentMapping(applicationId);
  const mappingUnits = assessmentMapping?.units ?? [];

  // Signing these forms is an "interview stage" action on the backend — once
  // the application has moved on (e.g. to external verification), signing
  // always fails, so the sign controls must not be offered any more.
  const formType = FORM_MAP[formId] || "records";

  const unitLabels = React.useMemo(() => {
    const unitsToUse = scopedUnits.length > 0 ? scopedUnits : rawTradeUnits;
    const preferred = new Set(applicationData?.unitIds ?? []);
    return [...unitsToUse]
      .sort((a, b) => Number(preferred.has(b.id)) - Number(preferred.has(a.id)))
      .map(toUnitLabel);
  }, [scopedUnits, rawTradeUnits, applicationData?.unitIds]);

  const defaultAssessorName = React.useMemo(() => {
    const currentAssessorName = user?.fullName || (user as any)?.name || "";
    if (effectiveIsLead && leadMember?.name) return leadMember.name;
    if (matchedPanelMember?.name) return matchedPanelMember.name;
    return currentAssessorName;
  }, [user, effectiveIsLead, leadMember, matchedPanelMember]);

  const defaultInterviewerNames = React.useMemo(() => {
    const names =
      interviewPanel?.members?.map((m: any) => m.name).filter(Boolean) ?? [];
    if (names.length > 0) return names.join(", ");
    return user?.fullName || (user as any)?.name || "";
  }, [interviewPanel?.members, user]);

  const defaultDate = React.useMemo(() => {
    if (interviewSchedule?.scheduledAt) {
      try {
        return new Date(interviewSchedule.scheduledAt)
          .toISOString()
          .split("T")[0];
      } catch {
        // fallback
      }
    }
    return new Date().toISOString().split("T")[0];
  }, [interviewSchedule?.scheduledAt]);

  const defaultSite = React.useMemo(() => {
    if (interviewSchedule?.location) return interviewSchedule.location;
    if (interviewSchedule?.mode === "online") return "Online Assessment";
    if (applicationData?.centre?.name) return applicationData.centre.name;
    return "Assessment Centre";
  }, [interviewSchedule, applicationData?.centre?.name]);

  const { data: formsBundle } = useGetInterviewFormsBundle(applicationId, {
    enabled: shouldFetchInterviewData,
  });
  const remoteForms = formsBundle?.forms;
  const panelistRecords = formsBundle?.panelistRecords;
  const updateFormMutation = useUpdateInterviewForm(applicationId);

  const matchedCanonicalForm = remoteForms?.find((f) => f.formType === formType);
  const myPanelistRecord = React.useMemo(() => {
    if (!panelistRecords?.length) return undefined;
    return panelistRecords.find(
      (r) =>
        r.formType === formType &&
        (isMemberMatch({ assessorId: r.assessorId }) ||
          (matchedPanelMember?.assessorId &&
            r.assessorId === matchedPanelMember.assessorId) ||
          (!matchedPanelMember && isObserverUser && r.isObserver)),
    );
  }, [
    panelistRecords,
    formType,
    isMemberMatch,
    matchedPanelMember,
    isObserverUser,
  ]);

  const isCandidateSigned = Boolean(matchedCanonicalForm?.candidateSignedAt);
  const isNonLeadSeatedMember =
    !effectiveIsCandidate && !viewOnly && !isReadOnly && !effectiveIsLead;

  // Lead is blocked after candidate signoff; non-lead panelists & IV observer
  // upsert their own optional InterviewFormRecord (not candidate-signed).
  const effectiveReadOnly =
    viewOnly ||
    isReadOnly ||
    (effectiveIsLead && isCandidateSigned);

  const activeFormData = isNonLeadSeatedMember
    ? myPanelistRecord?.data
    : matchedCanonicalForm?.data;

  const handleRequestSubmit = (data: Record<string, any>) => {
    if (effectiveReadOnly) return;
    setPendingFormData(data);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false);
    try {
      const now = new Date().toISOString();
      const uName = user?.fullName || (user as any)?.name || "";
      const baseData = effectiveIsLead
        ? matchedCanonicalForm?.data || {}
        : myPanelistRecord?.data || {};

      const isAssessorSigned = Boolean(
        pendingFormData?.assessorSigned ?? (baseData as any)?.assessorSigned
      );
      const isLeadSigned = Boolean(
        pendingFormData?.leadPanelistSigned ??
          pendingFormData?.assessorSigned ??
          (baseData as any)?.leadPanelistSigned ??
          (baseData as any)?.assessorSigned
      );

      await updateFormMutation.mutateAsync({
        formType,
        data: {
          ...baseData,
          ...(pendingFormData || {}),
          submittedAt: now,
          status: "submitted",
          assessorSigned: isAssessorSigned,
          assessorSignedAt: isAssessorSigned
            ? pendingFormData?.assessorSignedAt ||
              (baseData as any)?.assessorSignedAt ||
              now
            : undefined,
          assessorName:
            pendingFormData?.assessorName ||
            uName ||
            (baseData as any)?.assessorName,
          assessorSignatureAssetId: isAssessorSigned
            ? pendingFormData?.assessorSignatureAssetId ||
              (baseData as any)?.assessorSignatureAssetId
            : undefined,
          assessorSignatureUrl: isAssessorSigned
            ? pendingFormData?.assessorSignatureUrl ||
              (baseData as any)?.assessorSignatureUrl
            : undefined,
          ...(effectiveIsLead
            ? {
                leadPanelistSigned: isLeadSigned,
                leadPanelistSignedAt: isLeadSigned
                  ? pendingFormData?.leadPanelistSignedAt ||
                    pendingFormData?.assessorSignedAt ||
                    (baseData as any)?.leadPanelistSignedAt ||
                    now
                  : undefined,
                leadPanelistName:
                  pendingFormData?.leadPanelistName ||
                  pendingFormData?.assessorName ||
                  uName ||
                  (baseData as any)?.leadPanelistName,
                leadPanelistSignatureAssetId: isLeadSigned
                  ? pendingFormData?.leadPanelistSignatureAssetId ||
                    pendingFormData?.assessorSignatureAssetId ||
                    (baseData as any)?.leadPanelistSignatureAssetId
                  : undefined,
                leadPanelistSignatureUrl: isLeadSigned
                  ? pendingFormData?.leadPanelistSignatureUrl ||
                    pendingFormData?.assessorSignatureUrl ||
                    (baseData as any)?.leadPanelistSignatureUrl
                  : undefined,
              }
            : {}),
        },
      });
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      toast({
        type: "error",
        title: "Submission Error",
        description: err?.message || "Failed to submit assessment form.",
      });
    }
  };

  const handleSuccessContinue = () => {
    setIsSuccessModalOpen(false);
    onBack();
  };

  if (effectiveReadOnly || effectiveIsCandidate) {
    return (
      <AssessorAssessmentFormDocumentView
        applicationId={applicationId}
        formId={formId}
        candidateName={candidateName}
        formData={matchedCanonicalForm?.data}
        onBack={onBack}
        isCandidate={effectiveIsCandidate}
        formRecord={matchedCanonicalForm}
        applicationTrade={resolvedTrade}
        unitLabels={unitLabels}
        isInterviewStage={isInterviewStage}
      />
    );
  }

  const renderForm = () => {
    switch (formId) {
      case "skills_demo":
        return (
          <SkillsDemonstrationForm
            candidateName={candidateName}
            onBack={onBack}
            onSubmit={handleRequestSubmit}
            formData={activeFormData}
            isReadOnly={effectiveReadOnly}
            applicationTrade={resolvedTrade}
            unitLabels={unitLabels}
            scopedUnits={scopedUnits}
            mappingUnits={mappingUnits}
            levelLabel={levelLabel}
            defaultAssessorName={defaultAssessorName}
            defaultDate={defaultDate}
            defaultSite={defaultSite}
          />
        );
      case "assessment_mapping":
        return (
          <AssessmentMappingForm
            candidateName={candidateName}
            onBack={onBack}
            onSubmit={handleRequestSubmit}
            formData={activeFormData}
            isReadOnly={effectiveReadOnly}
            applicationTrade={resolvedTrade}
            unitLabels={unitLabels}
            scopedUnits={scopedUnits}
            mappingUnits={mappingUnits}
            levelLabel={levelLabel}
            defaultAssessorName={defaultAssessorName}
            defaultDate={defaultDate}
            defaultSite={defaultSite}
          />
        );
      case "observation_checklist":
        return (
          <PracticalObservationForm
            candidateName={candidateName}
            onBack={onBack}
            onSubmit={handleRequestSubmit}
            formData={activeFormData}
            isReadOnly={effectiveReadOnly}
            applicationTrade={resolvedTrade}
            unitLabels={unitLabels}
            scopedUnits={scopedUnits}
            mappingUnits={mappingUnits}
            levelLabel={levelLabel}
            defaultAssessorName={defaultAssessorName}
            defaultDate={defaultDate}
            defaultSite={defaultSite}
          />
        );
      case "interview_record":
      default:
        return (
          <InterviewRecordForm
            candidateName={candidateName}
            onBack={onBack}
            onSubmit={handleRequestSubmit}
            formData={activeFormData}
            isReadOnly={effectiveReadOnly}
            applicationTrade={resolvedTrade}
            unitLabels={unitLabels}
            scopedUnits={scopedUnits}
            mappingUnits={mappingUnits}
            levelLabel={levelLabel}
            defaultInterviewerNames={defaultInterviewerNames}
            defaultDate={defaultDate}
            leadMemberName={leadName}
            panelMemberName={panelMemberName}
            internalVerifierName={ivName}
            currentUserRole={currentUserRole}
          />
        );
    }
  };

  return (
    <div className="w-full flex flex-col">
      {renderForm()}

      <ConfirmSubmitFormModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSubmit}
      />

      <FormSubmittedSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessContinue}
      />
    </div>
  );
};
