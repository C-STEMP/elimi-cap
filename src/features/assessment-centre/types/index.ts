export type AssessmentCentreTab =
  | "overview"
  | "staff"
  | "applications"
  | "job-listing"
  | "assessor-request"
  | "assessors"
  | "payments"
  | "settings"
  | "messages";

export interface StatCardData {
  id: string;
  label: string;
  count: string;
  unit: string;
  icon: string;
}

export interface RevenueItem {
  month: string;
  revenue: number;
}

export interface TradeItem {
  trade: string;
  percentage: number;
}

export interface StageItem {
  stage: string;
  percentage: number;
}

export interface StaffActivity {
  id: string;
  name: string;
  role: string;
  action: string;
  time: string;
}

export interface PendingApplication {
  id: string;
  candidateName: string;
  trade: string;
  assessmentType: string;
  status: "Pending" | "Approved" | "Rejected" | "Ongoing" | "Folder Complete" | "Certified" | "Completed";
  submittedAt: string;
}

export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  unread?: boolean;
  isBroadcast?: boolean;
  online?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSelf?: boolean;
  isBroadcast?: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Regular Admin" | "Regular Staff";
  status: "Active" | "Pending" | "Inactive";
  dateAdded: string;
  reviewedApplicationsCount?: number;
  pendingApplicationsCount?: number;
  requiresAttentionCount?: number;
}

export interface JobListing {
  id: string;
  role: string;
  trade: string;
  slotsTotal: number;
  slotsFilled: number;
  applicantsCount: number;
  deadline: string;
  status: "Open" | "Filled";
  description?: string;
  requirements?: string[];
}

export interface AssessorApplicant {
  id: string;
  name: string;
  email: string;
  trade: string;
  experienceYears: number;
  certificatesCount: number;
  status: "Pending" | "Shortlisted" | "Rejected";
  tags?: string[];
  certificates?: {
    id: string;
    title: string;
    issuer: string;
    year: string;
  }[];
}

export interface AssessorItem {
  id: string;
  name: string;
  email: string;
  trade: string;
  role: "IQA" | "IQM" | "EA" | "Assessor";
  status: "Active" | "Pending" | "Inactive";
  assignedCount: number;
  experienceYears?: number;
  tags?: string[];
  assignedCandidatesCount?: number;
  ongoingCount?: number;
  completedCount?: number;
}

export interface AssignedCandidate {
  id: string;
  role: string;
  candidateName: string;
  trade: string;
  assessmentType: string;
  status: "Ongoing" | "Completed" | "Folder Complete" | "Certified";
  assignedAt: string;
}

export interface PaymentTransaction {
  id: string;
  candidateName: string;
  assessmentType: string;
  amountPaid: string;
  status: "Paid" | "Pending";
  date: string;
  transactionId: string;
  paymentMethod: string;
  description: string;
}
