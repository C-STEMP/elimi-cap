"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetApplicationById,
  useReviewApplication,
  APPLICATION_QUERY_KEYS,
} from "@/src/features/shared/applications/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Loader } from "@/src/components/ui/loader";
import { AssessmentCentreHeader } from "@/src/features/assessment-centre/features/Dashboard/components/AssessmentCentreHeader";
import { ApplicationsHeader } from "@/src/features/assessment-centre/features/Applications/components/ApplicationsHeader";
import { ApplicationDetail } from "@/src/features/assessment-centre/features/Applications/components/ApplicationDetail";
import { CandidateFormView } from "@/src/features/assessment-centre/features/Applications/components/CandidateFormView";
import { EvidenceVaultView } from "@/src/features/assessment-centre/features/Applications/components/EvidenceVaultView";
import { SelfAssessmentFormView } from "@/src/features/assessment-centre/features/Applications/components/SelfAssessmentFormView";
import { ShareApplicationModal } from "@/src/features/assessment-centre/features/Applications/components/ShareApplicationModal";
import { PromptCreatePanelModal } from "@/src/features/assessment-centre/features/Applications/components/PromptCreatePanelModal";
import { ScheduleInterviewModal } from "@/src/features/assessment-centre/features/Applications/components/ScheduleInterviewModal";
import { CreateInterviewModal } from "@/src/features/assessment-centre/features/Applications/components/CreateInterviewModal";
import {
  useGetCentrePanels,
  useGetCentreInterviews,
} from "@/src/features/shared/centre/hooks";
import { NsqCentreApplicationDetailView } from "./nsq/NsqCentreApplicationDetailView";
import { GenerateLinkSuccessModal } from "./nsq/GenerateLinkSuccessModal";
import { useToast } from "@/src/components/ui/toast";

export const CentreApplicationRouteView: React.FC<{ id: string }> = ({
  id,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: application, isLoading } = useGetApplicationById(id);
  const reviewMutation = useReviewApplication();

  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [showEvidenceVault, setShowEvidenceVault] = useState(false);
  const [showSelfAssessmentForm, setShowSelfAssessmentForm] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPromptCreatePanelModalOpen, setIsPromptCreatePanelModalOpen] =
    useState(false);
  const [isScheduleInterviewModalOpen, setIsScheduleInterviewModalOpen] =
    useState(false);
  const [isCreateInterviewModalOpen, setIsCreateInterviewModalOpen] =
    useState(false);
  const [isGenerateLinkModalOpen, setIsGenerateLinkModalOpen] = useState(false);
  const [selectedUnitNumber, setSelectedUnitNumber] = useState<string | null>(null);

  const { data: centrePanels = [] } = useGetCentrePanels();
  const { data: centreInterviews = [] } = useGetCentreInterviews();

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <Loader tip="Loading application details..." />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-6">
        <h3 className="text-lg font-bold text-gray-800">
          Application Not Found
        </h3>
        <p className="text-sm text-gray-500 max-w-sm">
          The application you are trying to view does not exist or has been
          removed.
        </p>
        <button
          type="button"
          onClick={() =>
            router.push("/assessment-centre/dashboard/applications")
          }
          className="px-4 py-2 bg-[#8A1538] text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  const candidateName =
    application.candidate?.name ||
    (application.candidate?.firstName
      ? `${application.candidate.firstName} ${
          application.candidate.lastName || ""
        }`.trim()
      : application.candidateId || "Candidate");

  const isSelectedAppApproved =
    application.status === "in_progress" ||
    application.status === "certified";

  const isNsqApplication =
    application.type === "NSQ" ||
    (application as any)?.assessmentType === "NSQ";

  const tradeName =
    (typeof application.trade === "object" ? (application.trade as any)?.name : null) ||
    (typeof application.trade === "string" && !/^[0-9A-Z]{20,}$/.test(application.trade)
      ? application.trade
      : null) ||
    "Masonry";

  const handleGenerateLink = () => {
    setIsGenerateLinkModalOpen(true);
  };

  const handleCopyGeneratedLink = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/applications/${id}?from=centre`;
      navigator.clipboard.writeText(shareUrl);
      setIsGenerateLinkModalOpen(false);
      toast({
        type: "success",
        title: "Link Copied",
        description: "You have successfully copied a link",
      });
    }
  };

  const handleOpenScheduleInterview = () => {
    const hasPanels =
      (centrePanels && centrePanels.length > 0) ||
      (centreInterviews && centreInterviews.length > 0);
    if (!hasPanels) setIsPromptCreatePanelModalOpen(true);
    else setIsScheduleInterviewModalOpen(true);
  };

  const handleBackToList = () => {
    router.push("/assessment-centre/dashboard/applications");
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fb] flex flex-col select-text">
      <AssessmentCentreHeader
        activeTab="applications"
        onSelectTab={(tab) =>
          router.push(`/assessment-centre/dashboard/${tab}`)
        }
      >
        <ApplicationsHeader
          selectedCandidateName={candidateName}
          selectedInterviewTitle={null}
          selectedUnitNumber={selectedUnitNumber}
          selectedTradeName={tradeName}
          showSelfAssessmentForm={showSelfAssessmentForm}
          showEvidenceVault={showEvidenceVault}
          showCandidateForm={showCandidateForm}
          isApplicationApproved={isSelectedAppApproved}
          isNsqApplication={isNsqApplication}
          onGenerateLink={handleGenerateLink}
          onBackToList={handleBackToList}
          onBackFromInterview={handleBackToList}
          onBackFromUnit={() => setSelectedUnitNumber(null)}
          onBackFromSelfAssessment={() => setShowSelfAssessmentForm(false)}
          onBackFromEvidenceVault={() => setShowEvidenceVault(false)}
          onBackFromCandidateForm={() => setShowCandidateForm(false)}
          onAcceptApplication={() => {
            reviewMutation.mutate(
              {
                id,
                payload: {
                  decision: "approve",
                  stageKey: "application_form",
                  feedback: "Accepted by Assessment Centre",
                },
              },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    queryKey: APPLICATION_QUERY_KEYS.all,
                  });
                  queryClient.invalidateQueries({
                    queryKey: APPLICATION_QUERY_KEYS.detail(id),
                  });
                },
              },
            );
          }}
          onCreateInterview={() => setIsCreateInterviewModalOpen(true)}
          onShareApplication={() => setIsShareModalOpen(true)}
          onScheduleInterview={handleOpenScheduleInterview}
        />
      </AssessmentCentreHeader>

      <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6 sm:gap-8">
        {showSelfAssessmentForm ? (
          <SelfAssessmentFormView
            id={id}
            candidateName={candidateName}
            onBack={() => setShowSelfAssessmentForm(false)}
          />
        ) : showEvidenceVault ? (
          <EvidenceVaultView
            id={id}
            candidateName={candidateName}
            onBack={() => setShowEvidenceVault(false)}
            onOpenSelfAssessmentForm={() => setShowSelfAssessmentForm(true)}
          />
        ) : showCandidateForm ? (
          <CandidateFormView
            id={id}
            candidateName={candidateName}
            onBack={() => setShowCandidateForm(false)}
          />
        ) : isNsqApplication ? (
          <NsqCentreApplicationDetailView
            application={application}
            onBack={handleBackToList}
            selectedUnitNumber={selectedUnitNumber}
            onSelectUnit={setSelectedUnitNumber}
          />
        ) : (
          <ApplicationDetail
            id={id}
            candidateName={candidateName}
            onBack={handleBackToList}
            onOpenCandidateForm={() => setShowCandidateForm(true)}
            onOpenEvidenceVault={() => setShowEvidenceVault(true)}
          />
        )}
      </div>

      <ShareApplicationModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        applicationId={id}
      />
      <PromptCreatePanelModal
        isOpen={isPromptCreatePanelModalOpen}
        onClose={() => setIsPromptCreatePanelModalOpen(false)}
        onCreatePanel={() => {
          setIsPromptCreatePanelModalOpen(false);
          router.push("/assessment-centre/dashboard/applications");
        }}
      />
      <ScheduleInterviewModal
        isOpen={isScheduleInterviewModalOpen}
        onClose={() => setIsScheduleInterviewModalOpen(false)}
        initialApplicationId={id}
      />
      <CreateInterviewModal
        isOpen={isCreateInterviewModalOpen}
        onClose={() => setIsCreateInterviewModalOpen(false)}
      />
      <GenerateLinkSuccessModal
        isOpen={isGenerateLinkModalOpen}
        onClose={() => setIsGenerateLinkModalOpen(false)}
        onCopyLink={handleCopyGeneratedLink}
      />
    </div>
  );
};
