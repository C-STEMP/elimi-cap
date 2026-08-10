import { ASSETS_URL } from "@/assets";
import {
  PendingApplication,
  RevenueItem,
  StaffActivity,
  StageItem,
  TradeItem,
  ChatContact,
  ChatMessage,
  StaffMember,
  JobListing,
  AssessorApplicant,
  AssessorItem,
  AssignedCandidate,
  PaymentTransaction,
} from "../types";

export const MOCK_STATS = [
  {
    id: "total-applications",
    label: "Total Applications",
    count: "21,220",
    unit: "applications",
    icon: "clipboard",
  },
  {
    id: "total-assessors",
    label: "Total Assessors",
    count: "43",
    unit: "assessors",
    icon: "flag",
  },
  {
    id: "total-staffs",
    label: "Total Staffs",
    count: "15",
    unit: "staffs",
    icon: "user",
  },
  {
    id: "total-revenue",
    label: "Total Revenue",
    count: "₦3,125,000",
    unit: "",
    icon: "money",
  },
];

export const MOCK_REVENUE_DATA: RevenueItem[] = [
  { month: "Jan", revenue: 7100 },
  { month: "Feb", revenue: 4600 },
  { month: "Mar", revenue: 5900 },
  { month: "Apr", revenue: 5700 },
  { month: "May", revenue: 4300 },
  { month: "Jun", revenue: 5200 },
  { month: "July", revenue: 7700 },
  { month: "Aug", revenue: 0 },
  { month: "Sep", revenue: 0 },
  { month: "Oct", revenue: 0 },
  { month: "Nov", revenue: 0 },
  { month: "Dec", revenue: 0 },
];

export const MOCK_TRADE_DATA: TradeItem[] = [
  { trade: "Plumbing", percentage: 44.68 },
  { trade: "Masonry", percentage: 97.52 },
  { trade: "Painting", percentage: 76.82 },
  { trade: "Tiling", percentage: 41.08 },
  { trade: "Welding", percentage: 74.81 },
  { trade: "Carpentry", percentage: 81.86 },
];

export const MOCK_GENDER_DISTRIBUTION = {
  male: 15200,
  female: 5120,
  others: 900,
  total: 21220,
};

export const MOCK_STAGES_DATA: StageItem[] = [
  { stage: "Certification", percentage: 8 },
  { stage: "External Verifier", percentage: 12 },
  { stage: "Internal Verifier", percentage: 18 },
  { stage: "Interview Stage", percentage: 22 },
  { stage: "Folder Arrangement", percentage: 15 },
  { stage: "Payment", percentage: 13 },
  { stage: "Application Form", percentage: 12 },
];

export const MOCK_STAFF_LOGS: StaffActivity[] = [
  {
    id: "log-1",
    name: "Sarah Jenkins",
    role: "Regular Staff",
    action: "Assigned Internal verifier to candidate",
    time: "10:42 AM",
  },
  {
    id: "log-2",
    name: "Sarah Jenkins",
    role: "Regular Staff",
    action: "Reviewed Candidate Application",
    time: "09:15 AM",
  },
  {
    id: "log-3",
    name: "Sarah Jenkins",
    role: "Regular Staff",
    action: "Assigned Panelist to candidate",
    time: "08:55 AM",
  },
  {
    id: "log-4",
    name: "Sarah Jenkins",
    role: "Regular Staff",
    action: "Scheduled 10 candidates for interview",
    time: "Yesterday",
  },
  {
    id: "log-5",
    name: "Sarah Jenkins",
    role: "Regular Staff",
    action: "Logged 8 hours of overtime",
    time: "Yesterday",
  },
];

export const MOCK_PENDING_APPLICATIONS: PendingApplication[] = [
  {
    id: "app-1",
    candidateName: "Oguntade James",
    trade: "Masonry",
    assessmentType: "RPL",
    status: "Pending",
    submittedAt: "07/22/2026",
  },
  {
    id: "app-2",
    candidateName: "Favour Smith",
    trade: "Carpentry",
    assessmentType: "RPL",
    status: "Pending",
    submittedAt: "07/22/2026",
  },
  {
    id: "app-3",
    candidateName: "Samson David",
    trade: "Plumbing",
    assessmentType: "NSQ",
    status: "Pending",
    submittedAt: "07/22/2026",
  },
  {
    id: "app-4",
    candidateName: "Oriade Sophie",
    trade: "Painting",
    assessmentType: "NSQ",
    status: "Pending",
    submittedAt: "07/22/2026",
  },
];

export const MOCK_CONTACTS: ChatContact[] = [
  {
    id: "c-1",
    name: "Oguntade Smason",
    avatar: ASSETS_URL.userAvatar.src,
    lastMessage: "Excellent progress, Samuel!! I'm looking...",
    unread: true,
    online: true,
  },
  {
    id: "c-2",
    name: "CSTEMP Admin",
    avatar: ASSETS_URL.faviconIcon.src,
    lastMessage: "We are currently working on you resch...",
    unread: true,
    isBroadcast: true,
    online: true,
  },
];

export const MOCK_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  "c-1": [
    {
      id: "m-1",
      senderId: "c-1",
      senderName: "Oguntade Smason",
      text: "lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor",
      timestamp: "2:32 PM",
    },
    {
      id: "m-2",
      senderId: "self",
      senderName: "Me",
      text: "lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor",
      timestamp: "2:32 PM",
      isSelf: true,
    },
    {
      id: "m-3",
      senderId: "c-1",
      senderName: "Oguntade Smason",
      text: "lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor",
      timestamp: "2:32 PM",
    },
  ],
  "c-2": [
    {
      id: "m-1",
      senderId: "c-2",
      senderName: "CSTEMP Admin",
      text: "lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor",
      timestamp: "2:32 PM",
      isBroadcast: true,
    },
  ],
};

export const MOCK_STAFF_MEMBERS: StaffMember[] = [
  {
    id: "s-1",
    name: "Tunde Bakare",
    email: "Tundebakare@lagoscentre.com",
    role: "Super Admin",
    status: "Active",
    dateAdded: "07/22/2026",
    reviewedApplicationsCount: 310,
    pendingApplicationsCount: 15,
    requiresAttentionCount: 8,
  },
  {
    id: "s-2",
    name: "Ifeoma Chukwu",
    email: "Ifychukwu@lagoscentre.com",
    role: "Regular Admin",
    status: "Active",
    dateAdded: "07/22/2026",
    reviewedApplicationsCount: 220,
    pendingApplicationsCount: 20,
    requiresAttentionCount: 10,
  },
  {
    id: "s-3",
    name: "Kelechi Nwosu",
    email: "Kelechinwosu@lagoscentre.com",
    role: "Regular Staff",
    status: "Pending",
    dateAdded: "07/22/2026",
    reviewedApplicationsCount: 95,
    pendingApplicationsCount: 12,
    requiresAttentionCount: 4,
  },
  {
    id: "s-4",
    name: "Yusuf Danladi",
    email: "Yusufdanladi@lagoscentre.com",
    role: "Regular Staff",
    status: "Inactive",
    dateAdded: "07/22/2026",
    reviewedApplicationsCount: 40,
    pendingApplicationsCount: 0,
    requiresAttentionCount: 0,
  },
  {
    id: "s-5",
    name: "Tunde Bakare",
    email: "Tundebakare@lagoscentre.com",
    role: "Super Admin",
    status: "Active",
    dateAdded: "07/22/2026",
  },
  {
    id: "s-6",
    name: "Tunde Bakare",
    email: "Tundebakare@lagoscentre.com",
    role: "Super Admin",
    status: "Active",
    dateAdded: "07/22/2026",
  },
];

export const MOCK_STAFF_APPLICATIONS: PendingApplication[] = [
  {
    id: "sa-1",
    candidateName: "Oguntade James",
    trade: "Masonry",
    assessmentType: "RPL",
    status: "Ongoing",
    submittedAt: "07/22/2026",
  },
  {
    id: "sa-2",
    candidateName: "Favour Smith",
    trade: "Carpentry",
    assessmentType: "RPL",
    status: "Folder Complete",
    submittedAt: "07/22/2026",
  },
  {
    id: "sa-3",
    candidateName: "Samson David",
    trade: "Plumbing",
    assessmentType: "NSQ",
    status: "Ongoing",
    submittedAt: "07/22/2026",
  },
  {
    id: "sa-4",
    candidateName: "Oriade Sophie",
    trade: "Painting",
    assessmentType: "NSQ",
    status: "Certified",
    submittedAt: "07/22/2026",
  },
];

export const MOCK_JOB_LISTINGS: JobListing[] = [
  {
    id: "j-1",
    role: "Assessor",
    trade: "Carpentry",
    slotsTotal: 2,
    slotsFilled: 0,
    applicantsCount: 3,
    deadline: "07/24/2026",
    status: "Open",
    description:
      "Lorem ipsum dolor sit amet consectetur. Donec faucibus at vestibulum amet risus velit cursus faucibus tellus. Lectus viverra sed auctor elit eu laoreet. Lorem ipsum dolor sit amet consectetur.",
    requirements: [
      "Minimum 5 years industry experience",
      "NSQ Level 4 or higher certification",
      "RPL assessment experience preferred",
    ],
  },
  {
    id: "j-2",
    role: "Assessor",
    trade: "Carpentry",
    slotsTotal: 2,
    slotsFilled: 0,
    applicantsCount: 2,
    deadline: "07/24/2026",
    status: "Open",
    description:
      "Looking for qualified carpentry trade assessors to conduct candidate practical evaluations.",
    requirements: [
      "Minimum 5 years industry experience",
      "Valid trade license",
    ],
  },
  {
    id: "j-3",
    role: "Internal Verifier",
    trade: "Plumbing",
    slotsTotal: 2,
    slotsFilled: 2,
    applicantsCount: 4,
    deadline: "07/24/2026",
    status: "Filled",
    description:
      "Internal verifier required for plumbing competency portfolios.",
    requirements: ["NSQ Level 4 certification"],
  },
  {
    id: "j-4",
    role: "Internal Verifier",
    trade: "Electrical Installation",
    slotsTotal: 2,
    slotsFilled: 0,
    applicantsCount: 1,
    deadline: "07/24/2026",
    status: "Open",
    description:
      "Electrical installation verifiers needed for technical center assessments.",
    requirements: ["Minimum 3 years verifier experience"],
  },
];

export const MOCK_ASSESSOR_APPLICANTS: AssessorApplicant[] = [
  {
    id: "aa-1",
    name: "Tunde Bakare",
    email: "tunde.bakare@assessor.ng",
    trade: "Masonry",
    experienceYears: 8,
    certificatesCount: 2,
    status: "Pending",
    tags: ["Carpentry", "RPL Coordinator"],
    certificates: [
      {
        id: "cert-1",
        title: "NSQ Level 4 Carpentry",
        issuer: "National Board for Technical Education",
        year: "2020",
      },
      {
        id: "cert-2",
        title: "Certified Trade Assessor",
        issuer: "Nigeria Skills Qualification Awarding Body",
        year: "2021",
      },
    ],
  },
  {
    id: "aa-2",
    name: "Ifeoma Chukwu",
    email: "ify.chukwu@assessor.ng",
    trade: "Carpentry",
    experienceYears: 12,
    certificatesCount: 1,
    status: "Pending",
    tags: ["Carpentry"],
    certificates: [
      {
        id: "cert-3",
        title: "Master Carpentry Assessor",
        issuer: "NABTEB Nigeria",
        year: "2019",
      },
    ],
  },
  {
    id: "aa-3",
    name: "Kelechi Nwosu",
    email: "kelechi.nwosu@assessor.ng",
    trade: "Plumbing",
    experienceYears: 12,
    certificatesCount: 2,
    status: "Pending",
    tags: ["Plumbing Verifier"],
    certificates: [
      {
        id: "cert-4",
        title: "NSQ Plumbing Level 4",
        issuer: "National Board for Technical Education",
        year: "2018",
      },
    ],
  },
  {
    id: "aa-4",
    name: "Yusuf Danladi",
    email: "yusuf.danladi@assessor.ng",
    trade: "Electrical Installations",
    experienceYears: 12,
    certificatesCount: 1,
    status: "Shortlisted",
    tags: ["Electrical Master"],
    certificates: [
      {
        id: "cert-5",
        title: "Senior Electrical Trade Assessor",
        issuer: "Council for Regulation of Engineering in Nigeria",
        year: "2020",
      },
    ],
  },
];

export const MOCK_ASSESSORS: AssessorItem[] = [
  {
    id: "asr-1",
    name: "Tunde Bakare",
    email: "Tundebakare@lagoscentre.com",
    trade: "Masonry",
    role: "IQA",
    status: "Active",
    assignedCount: 8,
    experienceYears: 8,
    tags: ["Carpentry", "RPL Coordinator"],
    assignedCandidatesCount: 10,
    ongoingCount: 6,
    completedCount: 4,
  },
  {
    id: "asr-2",
    name: "Ifeoma Chukwu",
    email: "Ifychukwu@lagoscentre.com",
    trade: "Carpentry",
    role: "IQM",
    status: "Active",
    assignedCount: 8,
    experienceYears: 12,
    tags: ["Carpentry"],
    assignedCandidatesCount: 12,
    ongoingCount: 8,
    completedCount: 4,
  },
  {
    id: "asr-3",
    name: "Kelechi Nwosu",
    email: "Kelechinwosu@lagoscentre.com",
    trade: "Plumbing",
    role: "EA",
    status: "Pending",
    assignedCount: 8,
    experienceYears: 10,
    tags: ["Plumbing Verifier"],
    assignedCandidatesCount: 5,
    ongoingCount: 3,
    completedCount: 2,
  },
  {
    id: "asr-4",
    name: "Yusuf Danladi",
    email: "Yusufdanladi@lagoscentre.com",
    trade: "Electrical Installations",
    role: "IQA",
    status: "Inactive",
    assignedCount: 8,
    experienceYears: 7,
    tags: ["Electrical Master"],
    assignedCandidatesCount: 0,
    ongoingCount: 0,
    completedCount: 0,
  },
];

export const MOCK_ASSIGNED_CANDIDATES: AssignedCandidate[] = [
  {
    id: "ac-1",
    role: "Panelist",
    candidateName: "Oguntade James",
    trade: "Masonry",
    assessmentType: "RPL",
    status: "Ongoing",
    assignedAt: "07/22/2026",
  },
  {
    id: "ac-2",
    role: "Panelist",
    candidateName: "Favour Smith",
    trade: "Carpentry",
    assessmentType: "RPL",
    status: "Ongoing",
    assignedAt: "07/22/2026",
  },
  {
    id: "ac-3",
    role: "Internal Verifier",
    candidateName: "Samson David",
    trade: "Plumbing",
    assessmentType: "NSQ",
    status: "Ongoing",
    assignedAt: "07/22/2026",
  },
  {
    id: "ac-4",
    role: "Internal Verifier",
    candidateName: "Oriade Sophie",
    trade: "Painting",
    assessmentType: "NSQ",
    status: "Completed",
    assignedAt: "07/22/2026",
  },
];

export const MOCK_PAYMENT_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: "tx-1",
    candidateName: "Tunde Bakare",
    assessmentType: "RPL",
    amountPaid: "₦45,000",
    status: "Paid",
    date: "2023-12-01",
    transactionId: "TXN_12345_ABCDE",
    paymentMethod: "Paystack",
    description: "Recognition of prior learning",
  },
  {
    id: "tx-2",
    candidateName: "Ifeoma Chukwu",
    assessmentType: "RPL",
    amountPaid: "₦45,000",
    status: "Paid",
    date: "2023-12-01",
    transactionId: "TXN_12346_FGHIJ",
    paymentMethod: "Paystack",
    description: "Recognition of prior learning",
  },
  {
    id: "tx-3",
    candidateName: "Kelechi Nwosu",
    assessmentType: "RPL",
    amountPaid: "₦45,000",
    status: "Pending",
    date: "2023-12-02",
    transactionId: "TXN_12347_KLMNO",
    paymentMethod: "Paystack",
    description: "Recognition of prior learning",
  },
  {
    id: "tx-4",
    candidateName: "Yusuf Danladi",
    assessmentType: "RPL",
    amountPaid: "₦45,000",
    status: "Paid",
    date: "2023-12-02",
    transactionId: "TXN_12348_PQRST",
    paymentMethod: "Paystack",
    description: "Recognition of prior learning",
  },
];

export const MOCK_APPLICATIONS_LIST = [
  {
    id: "app-1",
    candidateName: "Oguntade James",
    trade: "Masonry",
    assessmentType: "RPL",
    status: "Pending",
    submittedAt: "07/22/2026",
  },
  {
    id: "app-2",
    candidateName: "Favour Smith",
    trade: "Carpentry",
    assessmentType: "RPL",
    status: "Ongoing",
    submittedAt: "07/22/2026",
  },
  {
    id: "app-3",
    candidateName: "Samson David",
    trade: "Plumbing",
    assessmentType: "NSQ",
    status: "Completed",
    submittedAt: "07/22/2026",
  },
  {
    id: "app-4",
    candidateName: "Oriade Sophie",
    trade: "Painting",
    assessmentType: "NSQ",
    status: "Archived",
    submittedAt: "07/22/2026",
  },
];

export const MOCK_COMPETENCY_TASKS = [
  "Follow workplace health and safety procedures:",
  "Plan and prioritize work tasks",
  "Communicate effectively with team members and clients",
  "Use workplace equipment and technology safely",
  "Solve problems and make decisions",
  "Follow standard operating procedures",
  "Maintain accurate workplace records",
  "Contribute to team outcomes",
];

export const MOCK_AWARDING_BODY_INFO = {
  title: "National Board for Technical Education (NBTE)",
  description:
    "The National Board for Technical Education (NBTE) is responsible for regulating Technical and Vocational Education and Training (TVET) programmes in Nigeria. It oversees the implementation of the National Skills Qualification Framework (NSQF), accredits Assessment Centres, approves Awarding Bodies, and ensures that assessments and certifications meet national quality standards.",
};
