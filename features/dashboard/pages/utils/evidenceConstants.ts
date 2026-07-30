import { ASSETS_URL } from "@/assets";
import { FacilitatorData } from "@/features/dashboard/components/FacilitatorCard";

export interface EvidenceRecord {
  id: string;
  name: string;
  size: string;
  status: "Approved" | "Attention Required" | "Pending";
  statusBg: string;
  statusText: string;
  issues?: string[];
}

export interface ResourceRecord {
  id: string;
  name: string;
  size: string;
}

export const MOCK_FACILITATOR: FacilitatorData = {
  name: "Ngozi Eze",
  avatar: ASSETS_URL.userAvatar,
  role: "Facilitator · Carpentry (Level 3)",
  tags: ["Carpentry", "RPL Coordinator"],
};

export const INITIAL_EVIDENCES: EvidenceRecord[] = [
  {
    id: "ev-1",
    name: "CV/Resume",
    size: "60 kb / 5 mb",
    status: "Approved",
    statusBg: "bg-[#D1FAE5]",
    statusText: "text-[#047857]",
  },
  {
    id: "ev-2",
    name: "CV/Resume",
    size: "60 kb / 5 mb",
    status: "Approved",
    statusBg: "bg-[#D1FAE5]",
    statusText: "text-[#047857]",
  },
  {
    id: "ev-3",
    name: "CV/Resume",
    size: "60 kb / 5 mb",
    status: "Approved",
    statusBg: "bg-[#D1FAE5]",
    statusText: "text-[#047857]",
  },
  {
    id: "ev-4",
    name: "CV/Resume",
    size: "60 kb / 5 mb",
    status: "Approved",
    statusBg: "bg-[#D1FAE5]",
    statusText: "text-[#047857]",
  },
  {
    id: "ev-5",
    name: "CV/Resume",
    size: "60 kb / 5 mb",
    status: "Approved",
    statusBg: "bg-[#D1FAE5]",
    statusText: "text-[#047857]",
  },
];

export const RESOURCES_LIST: ResourceRecord[] = [
  {
    id: "res-1",
    name: "Self-Assessment Form Template",
    size: "5 mb",
  },
  {
    id: "res-2",
    name: "Third Party Reports",
    size: "5 mb",
  },
];
