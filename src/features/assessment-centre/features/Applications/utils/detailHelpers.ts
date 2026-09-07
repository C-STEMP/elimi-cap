export const getStatusBadge = (statusText: string) => {
  const s = statusText.toLowerCase();
  if (s === "not started" || s === "not_started") {
    return { text: "Not Started", className: "bg-gray-100 text-gray-500" };
  }
  if (
    s === "approved" ||
    s === "successful" ||
    s === "marked as complete" ||
    s === "completed" ||
    s === "competent" ||
    s === "certified" ||
    s === "submitted"
  ) {
    return { text: statusText, className: "bg-[#1E7F4C]/10 text-[#1E7F4C]" };
  }
  if (
    s === "in progress" ||
    s === "under review" ||
    s === "scheduled" ||
    s === "awaiting interview" ||
    s === "pending review" ||
    s === "awaiting payment" ||
    s === "pending"
  ) {
    return { text: statusText, className: "bg-[#F9A825]/10 text-[#F9A825]" };
  }
  if (s === "rejected" || s === "needs attention" || s === "corrupted") {
    return { text: statusText, className: "bg-[#FCE8EB] text-[#A31D38]" };
  }
  return { text: statusText, className: "bg-gray-100 text-gray-500" };
};

export const computeStageCalculations = (
  stages: any[],
  appDetail: any,
  interviewSchedule: any,
  activeInterviewSchedule: any,
  submittedDate: string
) => {
  const isCompleted = appDetail?.status === "certified";

  const appFormStage = stages.find(
    (s) => s.stageKey === "application_form" || s.stageKey === "application_review" || s.stageKey === "application"
  );
  const isAppFormExplicitlyApproved = Boolean(
    appFormStage?.status === "successful" ||
    (appFormStage?.status as string) === "approved" ||
    (appDetail?.currentStageKey &&
      appDetail.currentStageKey !== "application_form" &&
      appDetail.currentStageKey !== "application_review" &&
      appDetail.currentStageKey !== "draft" &&
      appDetail.currentStageKey !== "submitted")
  );
  const appFormStatus = isAppFormExplicitlyApproved || isCompleted
    ? "Approved"
    : appFormStage?.status === "rejected" || appDetail?.status === "rejected"
      ? "Rejected"
      : appDetail?.status === "draft"
        ? "Draft"
        : "Under Review";

  const paymentStage = stages.find((s) => s.stageKey === "payment" || s.stageKey === "payment_quote");
  const isPaymentPaid = Boolean(paymentStage?.status === "successful" || appDetail?.paymentCompleted || isCompleted);
  const paymentStatus = isPaymentPaid
    ? "Successful"
    : paymentStage?.status === "awaiting_payment"
      ? "Awaiting Payment"
      : paymentStage?.status === "in_progress"
        ? "In Progress"
        : isAppFormExplicitlyApproved
          ? "Awaiting Payment"
          : "Pending";
  const paymentDate = isPaymentPaid
    ? paymentStage?.enteredAt
      ? new Date(paymentStage.enteredAt).toLocaleDateString("en-US")
      : submittedDate
    : "—";

  const interviewStage = stages.find(
    (s) => s.stageKey === "interview" || s.stageKey === "direct_observation" || s.stageKey === "observation"
  );
  const isInterviewScheduled = Boolean(
    activeInterviewSchedule?.scheduledAt || interviewStage?.status === "scheduled"
  );
  const interviewStatus =
    interviewSchedule?.status === "completed" ||
    activeInterviewSchedule?.status === "completed" ||
    interviewStage?.status === "successful" ||
    isCompleted
      ? "Completed"
      : isInterviewScheduled ||
        interviewSchedule?.status === "scheduled" ||
        activeInterviewSchedule?.status === "scheduled" ||
        interviewStage?.status === "scheduled"
        ? "Scheduled"
        : interviewStage?.status === "in_progress"
          ? "In Progress"
          : "Not Started";
  const interviewDate = activeInterviewSchedule?.scheduledAt
    ? new Date(activeInterviewSchedule.scheduledAt).toLocaleDateString("en-US")
    : interviewSchedule?.scheduledAt
      ? new Date(interviewSchedule.scheduledAt).toLocaleDateString("en-US")
      : interviewStage?.enteredAt && interviewStatus !== "Not Started"
        ? new Date(interviewStage.enteredAt).toLocaleDateString("en-US")
        : interviewStatus === "Completed"
          ? submittedDate
          : "—";

  const evidenceStage = stages.find(
    (s) => s.stageKey === "evidence_vault" || s.stageKey === "folder_arrangement" || s.stageKey === "evidence"
  );
  const evidenceStatus =
    evidenceStage?.status === "successful" || isCompleted
      ? "Marked as complete"
      : evidenceStage?.status === "under_review"
        ? "Under Review"
        : evidenceStage?.status === "in_progress"
          ? "In Progress"
          : evidenceStage?.status === "not_started"
            ? "Not Started"
            : "Pending";
  const isAtInterviewStage = Boolean(
    interviewStage?.status === "scheduled" ||
    interviewStage?.status === "in_progress" ||
    interviewStage?.status === "successful" ||
    appDetail?.currentStageKey === "interview" ||
    appDetail?.currentStageKey === "direct_observation"
  );
  const evidenceDate = evidenceStage?.enteredAt
    ? new Date(evidenceStage.enteredAt).toLocaleDateString("en-US")
    : evidenceStatus === "Marked as complete"
      ? submittedDate
      : "—";

  const activeIv = appDetail?.internalVerifier || appDetail?.frozenProfile?.internalVerifier || null;
  const ivStage = stages.find(
    (s) => s.stageKey === "internal_verification" || s.stageKey === "internal_verifier" || s.stageKey === "iv_review" || s.stageKey === "iv"
  );
  const ivStatus =
    ivStage?.status === "successful" || isCompleted
      ? "Completed"
      : ivStage?.status === "not_started"
        ? "Not Started"
        : ivStage?.status === "in_progress" || ivStage?.status === "under_review" || activeIv
          ? "In Progress"
          : "Not Started";
  const ivDate = activeIv?.assignedAt && ivStatus !== "Not Started"
    ? new Date(activeIv.assignedAt).toLocaleDateString("en-US")
    : ivStage?.enteredAt && ivStatus !== "Not Started"
      ? new Date(ivStage.enteredAt).toLocaleDateString("en-US")
      : ivStatus === "Completed"
        ? submittedDate
        : "—";

  const activeEv = appDetail?.externalVerifier || appDetail?.frozenProfile?.externalVerifier || null;
  const evStage = stages.find(
    (s) => s.stageKey === "external_verification" || s.stageKey === "external_verifier" || s.stageKey === "eqa" || s.stageKey === "ev"
  );
  const evStatus =
    evStage?.status === "successful" || isCompleted
      ? "Completed"
      : evStage?.status === "not_started"
        ? "Not Started"
        : evStage?.status === "in_progress" || evStage?.status === "under_review" || activeEv
          ? "In Progress"
          : "Not Started";
  const evDate = activeEv?.assignedAt && evStatus !== "Not Started"
    ? new Date(activeEv.assignedAt).toLocaleDateString("en-US")
    : evStage?.enteredAt && evStatus !== "Not Started"
      ? new Date(evStage.enteredAt).toLocaleDateString("en-US")
      : evStatus === "Completed"
        ? submittedDate
        : "—";

  const certStage = stages.find((s) => s.stageKey === "certification");
  const certStatus =
    isCompleted || certStage?.status === "successful"
      ? "Competent"
      : certStage?.status === "not_started"
        ? "Not Started"
        : certStage?.status === "in_progress"
          ? "In Progress"
          : "Not Started";
  const certDate = certStage?.enteredAt && certStatus !== "Not Started"
    ? new Date(certStage.enteredAt).toLocaleDateString("en-US")
    : certStatus === "Competent"
      ? submittedDate
      : "—";

  return {
    isCompleted,
    isAppFormExplicitlyApproved,
    appFormStatus,
    isPaymentPaid,
    paymentStatus,
    paymentDate,
    interviewStatus,
    interviewDate,
    isInterviewScheduled,
    evidenceStatus,
    isAtInterviewStage,
    evidenceDate,
    activeIv,
    ivStatus,
    ivDate,
    activeEv,
    evStatus,
    evDate,
    certStatus,
    certDate,
  };
};
