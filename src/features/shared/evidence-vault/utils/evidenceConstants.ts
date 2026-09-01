export interface EvidenceRecord {
  id: string;
  name: string;
  size: string;
  status: "Approved" | "Attention Required" | "Pending";
  statusBg: string;
  statusText: string;
  issues?: string[];
  url?: string;
  assetId?: string;
  evidenceType?: string;
  mimeType?: string;
  dataUrl?: string;
}

export interface ResourceRecord {
  id: string;
  name: string;
  size: string;
}

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
