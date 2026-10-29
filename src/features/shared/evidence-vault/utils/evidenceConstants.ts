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
  unitId?: string;
  unitIds?: string[];
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
  RPL: "Recognition of Prior Learning (RPL)",
};

/**
 * Display labels for RPL wizard document kinds (`RplDocumentKind`) that
 * GET /applications/{id}/evidence-types can return in `allowed`. Labels only —
 * the accepted values always come from the API.
 */
export const RPL_DOCUMENT_KIND_LABELS: Record<string, string> = {
  workSamples: "Work Samples",
  employmentLetter: "Employment Letter",
  certificates: "Certificates",
  statementsOfAttainment: "Statements of Attainment",
  jobDescriptions: "Job Descriptions",
  photosOrVideosOfWork: "Photos / Videos of Work",
  other: "Other",
};

const normalizeEvidenceKey = (value: string) =>
  value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

const NORMALIZED_DOCUMENT_KIND_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(RPL_DOCUMENT_KIND_LABELS).map(([key, label]) => [
    normalizeEvidenceKey(key),
    label,
  ]),
);

/** Turns an unknown camelCase / snake_case value into readable words. */
function humanizeEvidenceType(value: string): string {
  const spaced = value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Dropdown label for an evidence type value — NOS codes keep their short
 * code suffix (e.g. "Witness Testimony (WT)"), document kinds use the wizard
 * wording. Unknown values are humanized rather than hidden.
 */
export function getEvidenceTypeOptionLabel(evidenceType?: string): string {
  if (!evidenceType) return "";
  const nosLabel = EVIDENCE_TYPE_LABELS[evidenceType.trim().toUpperCase()];
  if (nosLabel) return nosLabel;
  const kindLabel = NORMALIZED_DOCUMENT_KIND_LABELS[normalizeEvidenceKey(evidenceType)];
  if (kindLabel) return kindLabel;
  return /^[A-Z0-9]+$/.test(evidenceType.trim())
    ? evidenceType.trim()
    : humanizeEvidenceType(evidenceType);
}

/** Full evidence type name without the short code, e.g. "ASS" -> "Assignment". */
export function getEvidenceTypeName(evidenceType?: string): string {
  if (!evidenceType) return "";
  const label = EVIDENCE_TYPE_LABELS[evidenceType.trim().toUpperCase()];
  if (label) return label.replace(/\s*\([^)]*\)\s*$/, "");
  // Document kinds (e.g. "workSamples") — also matches the upper-cased codes
  // the type filter produces ("WORKSAMPLES").
  const kindLabel = NORMALIZED_DOCUMENT_KIND_LABELS[normalizeEvidenceKey(evidenceType)];
  return kindLabel || evidenceType;
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
