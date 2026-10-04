export interface EvidenceRecord {
  id: string;
  name: string;
  size: string;
  status: string;
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

export const EVIDENCE_TYPE_LABELS: Record<string, string> = {
  PS: "Product / Work Sample (PS)",
  WT: "Witness Testimony (WT)",
  DO: "Direct Observation (DO)",
  PD: "Professional Discussion (PD)",
  WP: "Workplace Performance (WP)",
  QA: "Questioning / Assessment (QA)",
  ASS: "Assignment (ASS)",
  PE: "Portfolio Evidence (PE)",
  TPR: "Third Party Report (TPR)",
  SIM: "Simulation (SIM)",
};

/** Full evidence type name without the short code, e.g. "ASS" -> "Assignment". */
export function getEvidenceTypeName(evidenceType?: string): string {
  if (!evidenceType) return "";
  const label = EVIDENCE_TYPE_LABELS[evidenceType.trim().toUpperCase()];
  return label ? label.replace(/\s*\([^)]*\)\s*$/, "") : evidenceType;
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


const CV_TYPE_CODES = new Set(["CV", "RESUME", "CURRICULUM_VITAE"]);
const CV_NAME_PATTERN = /\b(cv|resume|résumé|curriculum\s+vitae)\b/i;

/**
 * The candidate's CV is uploaded as ordinary evidence — the portfolio shows
 * it under "Candidate Profile" instead of the evidences list. Matches on an
 * explicit CV/Resume evidence type, or a document name that says so.
 */
export function isCvEvidence(item: {
  evidenceType?: string;
  name?: string;
  documentName?: string;
}): boolean {
  const code = (item.evidenceType || "").trim().toUpperCase().replace(/[\s/-]+/g, "_");
  if (CV_TYPE_CODES.has(code)) return true;
  return CV_NAME_PATTERN.test(item.documentName || item.name || "");
}
