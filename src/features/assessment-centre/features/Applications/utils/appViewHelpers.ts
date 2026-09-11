import type { InterviewRowData } from "../components/ViewInterviewDetailModal";

export const FILTER_TABS = [
  "All",
  "Pending",
  "Ongoing",
  "IV Approved",
  "Completed",
  "Archived",
  "Interviews",
  "Panel",
];

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "Pending":
      return "bg-[#F9A825]/10 text-[#F9A825]";
    case "Ongoing":
      return "bg-[#FCE8EB] text-[#A31D38]";
    case "IV Approved":
      return "bg-[#1E7F4C]/10 text-[#1E7F4C]";
    case "Submitted":
    case "Completed":
    case "Approved":
      return "bg-[#1E7F4C]/10 text-[#1E7F4C]";
    case "Archived":
      return "bg-[#E5E7EB] text-[#4B5563]";
    default:
      return "bg-[#E5E7EB] text-[#6B7280]";
  }
}

export function mapInterviewItem(item: any, remotePanels: any[]): InterviewRowData {
  const matchedPanel = item.panel || remotePanels.find((p) => p.id === item.panelId);
  const lead = matchedPanel?.members?.find((m: any) => m.isLead)?.name || "—";
  const member = matchedPanel?.members?.find((m: any) => !m.isLead && !m.isObserver)?.name || "—";
  const iv = matchedPanel?.members?.find((m: any) => m.isObserver)?.name || "—";

  return {
    id: item.id,
    title: item.name,
    leadPanelist: lead,
    panelMember: member,
    internalVerifier: iv,
    mode: item.mode?.toLowerCase() === "online" ? "Online" : "Physical",
    createdAt: item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("en-US", {
          month: "2-digit", day: "2-digit", year: "numeric",
        })
      : "—",
    scheduledAt: item.scheduledAt || undefined,
    location: item.location || (item.useCentreAddress ? "Centre Address" : "Physical Location"),
    link: item.link || undefined,
  };
}

export function mapApplicationItem(app: any) {
  const rawApp = app as any;
  return {
    id: app.id,
    candidateName:
      rawApp.candidate?.name ||
      `${rawApp.candidate?.firstName || ""} ${rawApp.candidate?.lastName || ""}`.trim() ||
      "Candidate",
    photoUrl:
      rawApp.candidate?.photo?.url ||
      rawApp.candidate?.photoAssetId ||
      rawApp.candidate?.avatar ||
      null,
    centreName: rawApp.centre?.name || rawApp.centreId || "—",
    facilitatorName:
      rawApp.facilitator?.name ||
      rawApp.assignedFacilitator?.name ||
      (rawApp.facilitator?.firstName
        ? `${rawApp.facilitator.firstName} ${rawApp.facilitator.lastName || ""}`.trim()
        : null) || "—",
    trade: rawApp.trade?.name || app.type || "General",
    assessmentType: app.type || "RPL",
    status:
      app.status === "certified"
        ? "Completed"
        : rawApp.currentStageKey === "application_form" ||
          rawApp.currentStageKey === "application_review" ||
          app.status === "draft"
        ? "Pending"
        : app.status === "in_progress"
        ? (rawApp.ivApproved ? "IV Approved" : "Ongoing")
        : app.status === "rejected" || app.status === "withdrawn"
        ? "Archived"
        : "Pending",
    ivApproved: Boolean(rawApp.ivApproved),
    submittedAt: rawApp.submittedAt
      ? new Date(rawApp.submittedAt).toLocaleDateString("en-GB")
      : new Date(app.createdAt).toLocaleDateString("en-GB"),
  };
}

export interface PanelRowData {
  id: string;
  name: string;
  description?: string;
  leadAssessor: string;
  panelMembers: string;
  internalVerifier: string;
  assessorsCount: number;
  createdAt: string;
  rawPanel?: any;
}

export function mapPanelItem(panel: any): PanelRowData {
  const members = panel.members || [];
  const lead = members.find((m: any) => m.isLead)?.name || "—";
  const regularMembers = members
    .filter((m: any) => !m.isLead && !m.isObserver)
    .map((m: any) => m.name);
  const iv = members.find((m: any) => m.isObserver)?.name || "—";

  return {
    id: panel.id,
    name: panel.name || "Untitled Panel",
    description: panel.description || "",
    leadAssessor: lead,
    panelMembers: regularMembers.length > 0 ? regularMembers.join(", ") : "—",
    internalVerifier: iv,
    assessorsCount: members.length || (panel.assessorIds?.length || 0),
    createdAt: panel.createdAt
      ? new Date(panel.createdAt).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
      : "—",
    rawPanel: panel,
  };
}
