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
import { useResolveAssets } from "@/src/features/shared/storage/hooks";

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
  const [isLockedByCandidate, setIsLockedByCandidate] = useState(false);
  const [panelistTab, setPanelistTab] = useState<"my_record" | "lead_form">("my_record");

  const { data: applicationData } = useGetApplicationById(applicationId);

  const isInterviewForm =
    formId === "interview_record" || formId === "records";
  const isInterviewStage =
    !viewOnly &&
    Boolean(
      !applicationData?.currentStageKey ||
        applicationData.currentStageKey === "interview" ||
        applicationData.currentStageKey === "direct_observation" ||
        applicationData.currentStageKey === "observation" ||
        (applicationData as any)?.stage === "interview",
    );

  const shouldFetchInterviewData = Boolean(
    applicationId &&
      applicationData &&
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
  const seatedPanelMember =
    interviewPanel?.members?.find(
      (m: any) => !m.isLead && !m.isObserver && isMemberMatch(m),
    ) ||
    interviewPanel?.members?.find(
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
    interviewPanel?.members?.some(
      (m: any) => !m.isLead && !m.isObserver && isMemberMatch(m),
    ),
  );
  const isMatchIV = Boolean(
    isObserverUser || (ivMember && isMemberMatch(ivMember)),
  );

  const currentUserRole: "lead" | "panel" | "iv" = React.useMemo(() => {
    if (isMatchIV) return "iv";
    if (!effectiveIsLead || isMatchPanelMember) return "panel";
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

  const { data: formsBundle, refetch: refetchFormsBundle } = useGetInterviewFormsBundle(applicationId, {
    enabled: Boolean(applicationId),
  });
  const remoteForms = formsBundle?.forms;
  const panelistRecords = formsBundle?.panelistRecords;
  const updateFormMutation = useUpdateInterviewForm(applicationId);

  React.useEffect(() => {
    if (applicationId) {
      refetchFormsBundle();
    }
  }, [applicationId, refetchFormsBundle]);

  const matchedCanonicalForm = remoteForms?.find((f) => f.formType === formType);
  const currentAssessorId = (user as any)?.assessorId || (user as any)?.profileId || user?.id;

  const candidateSigAssetId =
    matchedCanonicalForm?.candidateSignatureAssetId ||
    (matchedCanonicalForm?.data as any)?.candidateSignatureAssetId ||
    (applicationData as any)?.candidate?.signature?.assetId ||
    (applicationData as any)?.candidate?.signatureAssetId ||
    (applicationData as any)?.candidateSignature?.assetId ||
    (applicationData as any)?.candidateSignatureAssetId ||
    (applicationData as any)?.signature?.assetId ||
    (applicationData as any)?.signatureAssetId ||
    (applicationData as any)?.frozenProfile?.signature?.assetId ||
    null;

  const candidateSignatureMode =
    matchedCanonicalForm?.signatureMode ||
    (matchedCanonicalForm?.data as any)?.signatureMode ||
    null;

  const candidateTypedName =
    matchedCanonicalForm?.typedSignatureName ||
    (matchedCanonicalForm?.data as any)?.typedSignatureName ||
    null;

  const rawCandidateDirectUrl =
    (matchedCanonicalForm as any)?.candidateSignatureUrl ||
    (matchedCanonicalForm?.data as any)?.candidateSignatureUrl ||
    (applicationData as any)?.candidate?.signature?.url ||
    (applicationData as any)?.candidate?.signatureUrl ||
    (applicationData as any)?.candidateSignature?.url ||
    (applicationData as any)?.signature?.url ||
    (applicationData as any)?.frozenProfile?.signature?.url ||
    null;

  const candidateDirectSigUrl =
    candidateSignatureMode !== "typed" &&
    typeof rawCandidateDirectUrl === "string" &&
    (rawCandidateDirectUrl.startsWith("http://") ||
      rawCandidateDirectUrl.startsWith("https://") ||
      rawCandidateDirectUrl.startsWith("data:image/") ||
      rawCandidateDirectUrl.startsWith("/"))
      ? rawCandidateDirectUrl
      : null;

  const candidateSignedAt =
    matchedCanonicalForm?.candidateSignedAt ||
    (matchedCanonicalForm?.data as any)?.candidateSignedAt ||
    null;

  const isCandidateSigned = Boolean(
    candidateSignedAt ||
    matchedCanonicalForm?.candidateSignedAt ||
    (matchedCanonicalForm?.data as any)?.candidateSignedAt ||
    (matchedCanonicalForm as any)?.isCandidateSigned ||
    (matchedCanonicalForm?.status === "completed" &&
      Boolean(matchedCanonicalForm?.candidateSignedAt || candidateSigAssetId))
  );

  const candidateAssetIdsToResolve = React.useMemo(() => {
    return candidateSigAssetId && !candidateDirectSigUrl && candidateSigAssetId !== "default"
      ? [candidateSigAssetId]
      : [];
  }, [candidateSigAssetId, candidateDirectSigUrl]);

  const { data: resolvedCandidateAssets } = useResolveAssets(candidateAssetIdsToResolve);

  const resolvedCandidateSignatureUrl =
    candidateDirectSigUrl ||
    (Array.isArray(resolvedCandidateAssets)
      ? resolvedCandidateAssets.find((a) => a.assetId === candidateSigAssetId)?.url
      : (resolvedCandidateAssets as any)?.[0]?.url) ||
    null;

  const myPanelistRecord = React.useMemo(() => {
    if (!panelistRecords?.length) return undefined;
    return panelistRecords.find(
      (r) =>
        r.formType === formType &&
        (r.assessorId === currentAssessorId ||
          (matchedPanelMember?.assessorId &&
            r.assessorId === matchedPanelMember.assessorId) ||
          isMemberMatch({ assessorId: r.assessorId }) ||
          (!matchedPanelMember && isObserverUser && r.isObserver)),
    );
  }, [
    panelistRecords,
    formType,
    currentAssessorId,
    matchedPanelMember,
    isMemberMatch,
    isObserverUser,
  ]);

  const hasLeadFormAvailable = Boolean(
    matchedCanonicalForm &&
      matchedCanonicalForm.data &&
      Object.keys(matchedCanonicalForm.data).length > 0,
  );

  const isLeadLocked = Boolean(
    effectiveIsLead && (isCandidateSigned || isLockedByCandidate),
  );

  // Lead is blocked after candidate signoff or on 409; non-lead panelists & IV observer
  // upsert their own personal record (not blocked by candidate signature).
  const effectiveReadOnly =
    viewOnly ||
    isReadOnly ||
    (effectiveIsLead && isLeadLocked) ||
    (!effectiveIsLead && panelistTab === "lead_form");

  const activeFormData = React.useMemo(() => {
    if (effectiveIsLead) {
      return matchedCanonicalForm?.data || {};
    }
    if (panelistTab === "lead_form") {
      return matchedCanonicalForm?.data || {};
    }
    return myPanelistRecord?.data || {};
  }, [
    effectiveIsLead,
    panelistTab,
    matchedCanonicalForm?.data,
    myPanelistRecord?.data,
  ]);

  const badgeLabel = React.useMemo(() => {
    if (effectiveIsLead) {
      return "Official form";
    }
    if (panelistTab === "lead_form") {
      return "Lead’s form (Read-only reference)";
    }
    return "My record (not shared with the candidate)";
  }, [effectiveIsLead, panelistTab]);

  const submitLabel = React.useMemo(() => {
    if (effectiveIsLead) {
      return updateFormMutation.isPending
        ? "Submitting..."
        : "Submit Official Form";
    }
    return updateFormMutation.isPending ? "Saving..." : "Save My Record";
  }, [effectiveIsLead, updateFormMutation.isPending]);

  const headerTabs = React.useMemo(() => {
    if (effectiveIsLead || !hasLeadFormAvailable) return null;

    return (
      <div className="w-full bg-[#f4f5f7] p-1.5 rounded-2xl flex items-center gap-1.5 border border-gray-200/80 shadow-2xs mb-2">
        <button
          type="button"
          onClick={() => setPanelistTab("my_record")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            panelistTab === "my_record"
              ? "bg-white text-gray-900 shadow-sm border border-gray-200/60"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
          }`}
        >
          <span>My record</span>
          <span className="hidden sm:inline text-[11px] font-normal text-gray-500">
            (not shared with candidate)
          </span>
        </button>
        <button
          type="button"
          onClick={() => setPanelistTab("lead_form")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            panelistTab === "lead_form"
              ? "bg-white text-gray-900 shadow-sm border border-gray-200/60"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
          }`}
        >
          <span>Lead’s form</span>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Read-only
          </span>
        </button>
      </div>
    );
  }, [effectiveIsLead, hasLeadFormAvailable, panelistTab]);

  const bannerNotice = React.useMemo(() => {
    if (effectiveIsLead && isLeadLocked) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-900 text-xs sm:text-sm font-semibold mb-2">
          <span>
            🔒 The candidate has signed this official form. It is locked and
            read-only.
          </span>
        </div>
      );
    }
    return null;
  }, [effectiveIsLead, isLeadLocked]);

  const handleRequestSubmit = (data: Record<string, any>) => {
    if (effectiveReadOnly) return;
    setPendingFormData(data);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false);
    if (effectiveReadOnly) return;
    try {
      const now = new Date().toISOString();
      const uName = user?.fullName || (user as any)?.name || "";
      const baseData = activeFormData || {};

      const isAssessorSigned = Boolean(
        pendingFormData?.assessorSigned ?? (baseData as any)?.assessorSigned,
      );
      const isLeadSigned = Boolean(
        pendingFormData?.leadPanelistSigned ??
          pendingFormData?.assessorSigned ??
          (baseData as any)?.leadPanelistSigned ??
          (baseData as any)?.assessorSigned,
      );

      const resolvedSigAssetId =
        pendingFormData?.assessorSignature?.assetId ||
        pendingFormData?.assessorSignatureAssetId ||
        pendingFormData?.leadPanelistSignatureAssetId ||
        pendingFormData?.panelMemberSignatureAssetId ||
        pendingFormData?.internalVerifierSignatureAssetId ||
        (baseData as any)?.assessorSignature?.assetId ||
        (baseData as any)?.assessorSignatureAssetId ||
        "";

      const resolvedSigUrl =
        pendingFormData?.assessorSignature?.url ||
        pendingFormData?.assessorSignatureUrl ||
        pendingFormData?.leadPanelistSignatureUrl ||
        pendingFormData?.panelMemberSignatureUrl ||
        pendingFormData?.internalVerifierSignatureUrl ||
        (baseData as any)?.assessorSignature?.url ||
        (baseData as any)?.assessorSignatureUrl ||
        undefined;

      const resolvedSignerName =
        pendingFormData?.assessorSignature?.name ||
        pendingFormData?.assessorName ||
        uName ||
        (baseData as any)?.assessorSignature?.name ||
        (baseData as any)?.assessorName ||
        "Assessor";

      const resolvedSignedAt =
        pendingFormData?.assessorSignature?.signedAt ||
        pendingFormData?.assessorSignedAt ||
        pendingFormData?.leadPanelistSignedAt ||
        pendingFormData?.panelMemberSignedAt ||
        pendingFormData?.internalVerifierSignedAt ||
        now;

      const sigObj = {
        assetId: resolvedSigAssetId,
        name: resolvedSignerName,
        signedAt: resolvedSignedAt,
        ...(resolvedSigUrl ? { url: resolvedSigUrl } : {}),
      };

      const payloadData: Record<string, any> = {
        ...baseData,
        ...(pendingFormData || {}),
        assessorName: resolvedSignerName,
        assessorSigned: true,
        assessorSignedAt: resolvedSignedAt,
        assessorSignature: sigObj,
      };

      if (resolvedSigAssetId) {
        payloadData.assessorSignatureAssetId = resolvedSigAssetId;
      }
      if (resolvedSigUrl) {
        payloadData.assessorSignatureUrl = resolvedSigUrl;
      }

      if (effectiveIsLead) {
        payloadData.submittedAt = now;
        payloadData.status = "submitted";
        payloadData.leadSignature = sigObj;
        payloadData.leadPanelistSigned = isLeadSigned;
        if (isLeadSigned) {
          payloadData.leadPanelistSignedAt = resolvedSignedAt;
          payloadData.leadPanelistName = resolvedSignerName;
          if (resolvedSigAssetId) {
            payloadData.leadPanelistSignatureAssetId = resolvedSigAssetId;
          }
          if (resolvedSigUrl) {
            payloadData.leadPanelistSignatureUrl = resolvedSigUrl;
          }
        }
      } else {
        // Non-lead panelist or IV observer personal record
        payloadData.submittedAt = now;
        payloadData.status = "submitted";
        if (isObserverUser) {
          payloadData.internalVerifierSignature = sigObj;
          payloadData.internalVerifierSigned = true;
          payloadData.internalVerifierSignedAt = resolvedSignedAt;
          payloadData.internalVerifierName = resolvedSignerName;
        } else {
          payloadData.panelMemberSignature = sigObj;
          payloadData.panelMemberSigned = true;
          payloadData.panelMemberSignedAt = resolvedSignedAt;
          payloadData.panelMemberName = resolvedSignerName;
        }
      }

      await updateFormMutation.mutateAsync({
        formType,
        data: payloadData,
      });

      setIsSuccessModalOpen(true);
    } catch (err: any) {
      if (
        err?.statusCode === 409 ||
        err?.status === 409 ||
        err?.error?.code === 409 ||
        err?.code === "conflict"
      ) {
        if (effectiveIsLead) {
          setIsLockedByCandidate(true);
          toast({
            type: "error",
            title: "Form Locked",
            description:
              "The candidate has already signed this form. The official form is now locked and read-only.",
          });
          return;
        }
      }
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

  if (effectiveIsCandidate || (viewOnly && isReadOnly)) {
    return (
      <AssessorAssessmentFormDocumentView
        applicationId={applicationId}
        formId={formId}
        candidateName={candidateName}
        formData={matchedCanonicalForm?.data}
        onBack={onBack}
        isCandidate={effectiveIsCandidate}
        formRecord={matchedCanonicalForm}
        panelistRecords={panelistRecords}
        interviewPanel={interviewPanel}
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
            key={`skills_demo-${panelistTab}`}
            candidateName={candidateName}
            onBack={onBack}
            onSubmit={handleRequestSubmit}
            formData={activeFormData}
            canonicalForm={matchedCanonicalForm}
            candidateSignedAt={candidateSignedAt}
            candidateSignatureAssetId={candidateSigAssetId}
            candidateSignatureUrl={resolvedCandidateSignatureUrl}
            candidateSignatureMode={candidateSignatureMode}
            candidateTypedName={candidateTypedName}
            isCandidateSigned={isCandidateSigned}
            isReadOnly={effectiveReadOnly}
            applicationTrade={resolvedTrade}
            unitLabels={unitLabels}
            scopedUnits={scopedUnits}
            mappingUnits={mappingUnits}
            levelLabel={levelLabel}
            defaultAssessorName={defaultAssessorName}
            defaultDate={defaultDate}
            defaultSite={defaultSite}
            badgeLabel={badgeLabel}
            headerTabs={headerTabs}
            bannerNotice={bannerNotice}
            submitLabel={submitLabel}
          />
        );
      case "assessment_mapping":
        return (
          <AssessmentMappingForm
            key={`assessment_mapping-${panelistTab}`}
            candidateName={candidateName}
            onBack={onBack}
            onSubmit={handleRequestSubmit}
            formData={activeFormData}
            canonicalForm={matchedCanonicalForm}
            candidateSignedAt={candidateSignedAt}
            candidateSignatureAssetId={candidateSigAssetId}
            candidateSignatureUrl={resolvedCandidateSignatureUrl}
            candidateSignatureMode={candidateSignatureMode}
            candidateTypedName={candidateTypedName}
            isCandidateSigned={isCandidateSigned}
            isReadOnly={effectiveReadOnly}
            applicationTrade={resolvedTrade}
            unitLabels={unitLabels}
            scopedUnits={scopedUnits}
            mappingUnits={mappingUnits}
            levelLabel={levelLabel}
            defaultAssessorName={defaultAssessorName}
            defaultDate={defaultDate}
            defaultSite={defaultSite}
            badgeLabel={badgeLabel}
            headerTabs={headerTabs}
            bannerNotice={bannerNotice}
            submitLabel={submitLabel}
          />
        );
      case "observation_checklist":
        return (
          <PracticalObservationForm
            key={`observation_checklist-${panelistTab}`}
            candidateName={candidateName}
            onBack={onBack}
            onSubmit={handleRequestSubmit}
            formData={activeFormData}
            canonicalForm={matchedCanonicalForm}
            candidateSignedAt={candidateSignedAt}
            candidateSignatureAssetId={candidateSigAssetId}
            candidateSignatureUrl={resolvedCandidateSignatureUrl}
            candidateSignatureMode={candidateSignatureMode}
            candidateTypedName={candidateTypedName}
            isCandidateSigned={isCandidateSigned}
            isReadOnly={effectiveReadOnly}
            applicationTrade={resolvedTrade}
            unitLabels={unitLabels}
            scopedUnits={scopedUnits}
            mappingUnits={mappingUnits}
            levelLabel={levelLabel}
            defaultAssessorName={defaultAssessorName}
            defaultDate={defaultDate}
            defaultSite={defaultSite}
            badgeLabel={badgeLabel}
            headerTabs={headerTabs}
            bannerNotice={bannerNotice}
            submitLabel={submitLabel}
          />
        );
      case "interview_record":
      default:
        return (
          <InterviewRecordForm
            key={`interview_record-${panelistTab}`}
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
            badgeLabel={badgeLabel}
            headerTabs={headerTabs}
            bannerNotice={bannerNotice}
            submitLabel={submitLabel}
            panelistRecords={panelistRecords}
            canonicalForm={matchedCanonicalForm}
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
        title={effectiveIsLead ? "Submit Official Form?" : "Save My Record?"}
        description={
          effectiveIsLead
            ? "Confirm you want to submit this official form to the candidate."
            : "Confirm you want to save your record. This record is private and not shared with the candidate."
        }
        confirmLabel={effectiveIsLead ? "Yes, Submit" : "Yes, Save"}
      />

      <FormSubmittedSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessContinue}
        title={
          effectiveIsLead
            ? "Form Submitted Successfully"
            : "Record Saved Successfully"
        }
        description={
          effectiveIsLead
            ? "You have successfully submitted the official assessment form."
            : "You have successfully saved your private panelist record."
        }
      />
    </div>
  );
};
