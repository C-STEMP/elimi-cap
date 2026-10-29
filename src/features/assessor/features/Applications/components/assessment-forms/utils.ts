import type { AssessmentMappingUnit } from "@/src/features/shared/applications/api/types";
import type { Unit } from "@/src/features/shared/reference/api";

/** Display label for a NOS unit, e.g. "CBT/COS/001/L1: Maintain personal hygiene". */
export function toUnitLabel(unit: { referenceNumber?: string; title: string }): string {
  return unit.referenceNumber ? `${unit.referenceNumber}: ${unit.title}` : unit.title;
}

/**
 * Unit dropdown options built from the application's trade units (backend).
 * A previously saved value that is no longer in the list is kept so saved
 * forms still render their selection.
 */
export function getUnitOptions(
  currentUnit: string | undefined,
  unitLabels: string[],
): Array<{ label: string; value: string }> {
  const options = unitLabels.map((label) => ({ label, value: label }));
  if (currentUnit && currentUnit !== "Select" && !unitLabels.includes(currentUnit)) {
    return [{ label: currentUnit, value: currentUnit }, ...options];
  }
  return options;
}

/**
 * Strips bracketed or unbracketed unit code prefixes
 * (e.g. "[CBT/COS/005/L1] Define hairdressing." -> "Define hairdressing.")
 */
export function cleanQuestionTitle(title: string): string {
  if (!title) return "";
  let cleaned = title.trim();

  // Strip bracketed unit code prefix: e.g. "[CBT/COS/005/L1] Define hairdressing." -> "Define hairdressing."
  cleaned = cleaned.replace(/^\[[A-Za-z0-9_\/-]+\]\s*[:-]?\s*/, "");

  // Strip unbracketed slash-separated unit code prefix: e.g. "CBT/COS/005/L1: Define hairdressing." -> "Define hairdressing."
  cleaned = cleaned.replace(/^[A-Za-z0-9]{2,}\/[A-Za-z0-9_\/-]{2,}\s*[:-]?\s*/, "");

  return cleaned.trim();
}

export interface GeneratedChecklistItem {
  id: string;
  title: string;
  demonstrated: boolean;
  comments: string;
  isCustom?: boolean;
}

export interface GeneratedQuestionItem {
  id: string;
  question: string;
  candidateResponse: string;
  isCustom?: boolean;
}

export interface GeneratedUnitMappingItem {
  id: string;
  occupationalUnit: string;
  performanceCriteria: string;
  typeOfEvidence: string;
  description: string;
  status: "Satisfied" | "Not Satisfied";
  isCustom?: boolean;
}

interface BuildUnitItemsParams {
  scopedUnits?: Unit[];
  mappingUnits?: AssessmentMappingUnit[];
  tradeName?: string;
  levelLabel?: string;
}

/**
 * Extracts structured performance criteria or learning objectives from the
 * candidate's assessment-mapping units or NOS unit structures.
 */
function extractUnitCriteriaList(
  scopedUnits: Unit[] = [],
  mappingUnits: AssessmentMappingUnit[] = [],
): Array<{ unitCode: string; unitTitle: string; text: string; evidenceTypes?: string[] }> {
  const results: Array<{
    unitCode: string;
    unitTitle: string;
    text: string;
    evidenceTypes?: string[];
  }> = [];

  if (mappingUnits.length > 0) {
    for (const mUnit of mappingUnits) {
      const unitCode = mUnit.referenceNumber || "";
      const unitTitle = mUnit.title || "";
      const los = Array.isArray(mUnit.learningObjectives)
        ? mUnit.learningObjectives
        : [];

      for (const lo of los) {
        const pcs = Array.isArray(lo.performanceCriteria)
          ? lo.performanceCriteria
          : [];
        if (pcs.length > 0) {
          for (const pc of pcs) {
            if (pc?.text) {
              results.push({
                unitCode,
                unitTitle,
                text: pc.text.trim(),
                evidenceTypes: pc.evidenceTypes,
              });
            }
          }
        } else if (lo.text || lo.title) {
          results.push({
            unitCode,
            unitTitle,
            text: (lo.text || lo.title || "").trim(),
          });
        }
      }
    }
  }

  if (results.length === 0 && scopedUnits.length > 0) {
    for (const sUnit of scopedUnits) {
      const unitCode = sUnit.referenceNumber || "";
      const unitTitle = sUnit.title || "";
      const struct = sUnit.structure as Record<string, any> | undefined;
      const los = Array.isArray(struct?.learningObjectives)
        ? struct.learningObjectives
        : Array.isArray(struct?.elements)
          ? struct.elements
          : [];

      for (const lo of los) {
        const pcs = Array.isArray(lo?.performanceCriteria)
          ? lo.performanceCriteria
          : Array.isArray(lo?.criteria)
            ? lo.criteria
            : [];
        for (const pc of pcs) {
          const text = typeof pc === "string" ? pc : pc?.text || pc?.title;
          if (text) {
            results.push({
              unitCode,
              unitTitle,
              text: String(text).trim(),
            });
          }
        }
      }
    }
  }

  // Deduplicate criteria text to prevent overcrowded / repetitive entries
  const seenTexts = new Set<string>();
  const uniqueResults: typeof results = [];
  for (const r of results) {
    const key = cleanQuestionTitle(r.text).toLowerCase().trim();
    if (key && !seenTexts.has(key)) {
      seenTexts.add(key);
      uniqueResults.push(r);
    }
  }

  return uniqueResults;
}

/**
 * Builds Practical Observation checklist items tailored to the candidate's
 * applied trade, level, and NOS units.
 */
export function buildUnitObservationChecklist({
  scopedUnits = [],
  mappingUnits = [],
  tradeName = "",
  levelLabel = "Level 1",
}: BuildUnitItemsParams): GeneratedChecklistItem[] {
  const extracted = extractUnitCriteriaList(scopedUnits, mappingUnits);
  if (extracted.length > 0) {
    return extracted.slice(0, 5).map((item, idx) => ({
      id: `obs-${idx + 1}`,
      title: cleanQuestionTitle(item.text),
      demonstrated: true,
      comments: "",
      isCustom: false,
    }));
  }

  const unitsSource =
    mappingUnits.length > 0 ? mappingUnits : scopedUnits;
  const tradeContext = tradeName ? `${tradeName} (${levelLabel})` : levelLabel;

  if (unitsSource.length > 0) {
    const seenU = new Set<string>();
    const uniqueUnits = unitsSource.filter((u) => {
      const lbl = toUnitLabel(u).toLowerCase().trim();
      if (!lbl || seenU.has(lbl)) return false;
      seenU.add(lbl);
      return true;
    });

    const items: GeneratedChecklistItem[] = [
      {
        id: "obs-safety",
        title: `Applies required Health, Safety, and Environmental (HSE) procedures and PPE for ${tradeContext}`,
        demonstrated: true,
        comments: "",
        isCustom: false,
      },
      ...uniqueUnits.slice(0, 3).map((u, idx) => ({
        id: `obs-unit-${idx + 1}`,
        title: `Demonstrates practical competency in ${toUnitLabel(u)} (${levelLabel})`,
        demonstrated: true,
        comments: "",
        isCustom: false,
      })),
      {
        id: "obs-housekeeping",
        title: `Inspects completed ${tradeContext} work against NOS tolerances and secures work area`,
        demonstrated: true,
        comments: "",
        isCustom: false,
      },
    ];
    return items;
  }

  return [
    {
      id: "obs-1",
      title: `Prepares work area, tools, and materials for ${tradeContext}`,
      demonstrated: true,
      comments: "",
      isCustom: false,
    },
    {
      id: "obs-2",
      title: `Follows occupational health, safety, and PPE procedures for ${tradeContext}`,
      demonstrated: true,
      comments: "",
      isCustom: false,
    },
    {
      id: "obs-3",
      title: `Performs ${tradeContext} occupational tasks to required NOS standard`,
      demonstrated: true,
      comments: "",
      isCustom: false,
    },
    {
      id: "obs-4",
      title: `Demonstrates fault diagnosis and problem-solving skills at ${levelLabel}`,
      demonstrated: true,
      comments: "",
      isCustom: false,
    },
    {
      id: "obs-5",
      title: `Communicates technical steps clearly and coordinates effectively`,
      demonstrated: true,
      comments: "",
      isCustom: false,
    },
    {
      id: "obs-6",
      title: `Cleans, maintains tools, and secures ${tradeContext} work area`,
      demonstrated: true,
      comments: "",
      isCustom: false,
    },
  ];
}

/**
 * Builds Skills Demonstration criteria items tailored to the candidate's
 * applied trade, level, and NOS units.
 */
export function buildUnitSkillsCriteria({
  scopedUnits = [],
  mappingUnits = [],
  tradeName = "",
  levelLabel = "Level 1",
}: BuildUnitItemsParams): GeneratedChecklistItem[] {
  const extracted = extractUnitCriteriaList(scopedUnits, mappingUnits);
  if (extracted.length > 0) {
    return extracted.slice(0, 5).map((item, idx) => ({
      id: `crit-${idx + 1}`,
      title: cleanQuestionTitle(item.text),
      demonstrated: true,
      comments: "",
      isCustom: false,
    }));
  }

  const unitsSource =
    mappingUnits.length > 0 ? mappingUnits : scopedUnits;
  const tradeContext = tradeName ? `${tradeName} (${levelLabel})` : levelLabel;

  if (unitsSource.length > 0) {
    const seenU = new Set<string>();
    const uniqueUnits = unitsSource.filter((u) => {
      const lbl = toUnitLabel(u).toLowerCase().trim();
      if (!lbl || seenU.has(lbl)) return false;
      seenU.add(lbl);
      return true;
    });

    return [
      {
        id: "crit-1",
        title: `Selected and prepared appropriate tools, equipment, and materials for ${tradeContext}`,
        demonstrated: true,
        comments: "",
        isCustom: false,
      },
      {
        id: "crit-2",
        title: `Complied with safety regulations, hazard controls, and PPE requirements for ${tradeContext}`,
        demonstrated: true,
        comments: "",
        isCustom: false,
      },
      ...uniqueUnits.slice(0, 3).map((u, idx) => ({
        id: `crit-unit-${idx + 1}`,
        title: `Executed practical task to NOS standard for ${toUnitLabel(u)} (${levelLabel})`,
        demonstrated: true,
        comments: "",
        isCustom: false,
      })),
      {
        id: "crit-final",
        title: `Verified quality of finished ${tradeContext} work and maintained a safe, clean workspace`,
        demonstrated: true,
        comments: "",
        isCustom: false,
      },
    ];
  }

  return [
    {
      id: "crit-1",
      title: `Demonstrated correct selection and use of tools and equipment for ${tradeContext}`,
      demonstrated: true,
      comments: "",
      isCustom: false,
    },
    {
      id: "crit-2",
      title: `Followed occupational safety procedures and PPE requirements for ${tradeContext}`,
      demonstrated: true,
      comments: "",
      isCustom: false,
    },
    {
      id: "crit-3",
      title: `Performed practical tasks according to ${tradeContext} National Occupational Standards`,
      demonstrated: true,
      comments: "",
      isCustom: false,
    },
    {
      id: "crit-4",
      title: `Demonstrated technical accuracy, measurement precision, and workmanship at ${levelLabel}`,
      demonstrated: true,
      comments: "",
      isCustom: false,
    },
    {
      id: "crit-5",
      title: `Identified and resolved technical issues during ${tradeContext} task execution`,
      demonstrated: true,
      comments: "",
      isCustom: false,
    },
    {
      id: "crit-6",
      title: `Completed demonstration within designated timeframe and restored work area`,
      demonstrated: true,
      comments: "",
      isCustom: false,
    },
  ];
}

/**
 * Builds Interview Question Bank items tailored to the candidate's applied
 * trade, level, and NOS units.
 */
export function buildUnitInterviewQuestions({
  scopedUnits = [],
  mappingUnits = [],
  tradeName = "",
  levelLabel = "Level 1",
}: BuildUnitItemsParams): GeneratedQuestionItem[] {
  const unitsSource =
    mappingUnits.length > 0 ? mappingUnits : scopedUnits;
  const tradeContext = tradeName ? `${tradeName} (${levelLabel})` : levelLabel;

  if (unitsSource.length > 0) {
    const seenU = new Set<string>();
    const uniqueUnits = unitsSource.filter((u) => {
      const lbl = toUnitLabel(u).toLowerCase().trim();
      if (!lbl || seenU.has(lbl)) return false;
      seenU.add(lbl);
      return true;
    });

    const questions: GeneratedQuestionItem[] = [
      {
        id: "q-intro",
        question: `Describe your practical hands-on experience in ${tradeContext} and the types of jobs you have completed.`,
        candidateResponse: "",
        isCustom: false,
      },
      {
        id: "q-safety",
        question: `What are the essential Health, Safety, and Environmental (HSE) precautions and PPE required before starting work in ${tradeContext}?`,
        candidateResponse: "",
        isCustom: false,
      },
      ...uniqueUnits.slice(0, 3).map((u, idx) => ({
        id: `q-unit-${idx + 1}`,
        question: `Regarding ${toUnitLabel(u)} (${levelLabel}): explain the standard procedure, tools required, and key quality checks you perform.`,
        candidateResponse: "",
        isCustom: false,
      })),
      {
        id: "q-faults",
        question: `Give an example of a technical fault or challenge you encountered while performing ${tradeContext} work and how you resolved it to standard.`,
        candidateResponse: "",
        isCustom: false,
      },
    ];
    return questions;
  }

  return [
    {
      id: "q-1",
      question: `Describe your practical experience and responsibilities in ${tradeContext}.`,
      candidateResponse: "",
      isCustom: false,
    },
    {
      id: "q-2",
      question: `What key safety regulations, hazard checks, and PPE apply to ${tradeContext}?`,
      candidateResponse: "",
      isCustom: false,
    },
    {
      id: "q-3",
      question: `Which tools, instruments, and materials do you use most frequently in ${tradeContext}, and how do you maintain them?`,
      candidateResponse: "",
      isCustom: false,
    },
    {
      id: "q-4",
      question: `Explain how you verify measurements, specifications, and quality standards for ${tradeContext} tasks.`,
      candidateResponse: "",
      isCustom: false,
    },
    {
      id: "q-5",
      question: `Describe a technical defect or workplace problem you encountered in ${tradeContext} and how you rectified it.`,
      candidateResponse: "",
      isCustom: false,
    },
  ];
}

/**
 * Builds default Competency Mapping Grid rows from the candidate's scoped units.
 */
export function buildUnitMappingItems({
  scopedUnits = [],
  mappingUnits = [],
  levelLabel = "Level 1",
}: BuildUnitItemsParams): GeneratedUnitMappingItem[] {
  if (mappingUnits.length > 0) {
    return mappingUnits.map((u, idx) => {
      const los = Array.isArray(u.learningObjectives) ? u.learningObjectives : [];
      const pcsList: string[] = [];
      for (const lo of los) {
        const pcs = Array.isArray(lo.performanceCriteria) ? lo.performanceCriteria : [];
        for (const pc of pcs) {
          if (pc?.text) {
            pcsList.push(pc.code ? `${pc.code}: ${pc.text}` : pc.text);
          }
        }
      }
      const criteriaSummary =
        pcsList.length > 0
          ? `• ${pcsList.join("\n• ")}`
          : `${levelLabel} NOS Performance Criteria`;
      const evidenceSummary = Array.isArray(u.assessmentMethods)
        ? u.assessmentMethods.map((m) => String(m).replace(/_/g, " ")).join(", ")
        : "";
      return {
        id: `unit-${u.id || idx + 1}`,
        occupationalUnit: toUnitLabel(u),
        performanceCriteria: criteriaSummary,
        typeOfEvidence: evidenceSummary || "Direct Observation, Portfolio, Oral Questioning",
        description: `Mapped against ${toUnitLabel(u)} (${levelLabel})`,
        status: "Satisfied",
        isCustom: false,
      };
    });
  }

  if (scopedUnits.length > 0) {
    return scopedUnits.map((u, idx) => {
      const struct = u.structure as Record<string, any> | undefined;
      const los = Array.isArray(struct?.learningObjectives)
        ? struct.learningObjectives
        : Array.isArray(struct?.learningOutcomes)
          ? struct.learningOutcomes
          : Array.isArray(struct?.elements)
            ? struct.elements
            : Array.isArray(struct)
              ? struct
              : [];
      const pcsList: string[] = [];
      for (const lo of los) {
        const pcs = Array.isArray(lo?.performanceCriteria)
          ? lo.performanceCriteria
          : Array.isArray(lo?.criteria)
            ? lo.criteria
            : Array.isArray(lo?.performance_criteria)
              ? lo.performance_criteria
              : [];
        for (const pc of pcs) {
          const code = typeof pc === "object" && pc?.code ? pc.code : "";
          const text =
            typeof pc === "string"
              ? pc
              : pc?.text || pc?.title || pc?.description;
          if (text) {
            pcsList.push(code ? `${code}: ${text}` : String(text));
          }
        }
      }
      const criteriaSummary =
        pcsList.length > 0
          ? `• ${pcsList.join("\n• ")}`
          : u.purpose || `${levelLabel} NOS Performance Criteria`;

      return {
        id: `unit-${u.id || idx + 1}`,
        occupationalUnit: toUnitLabel(u),
        performanceCriteria: criteriaSummary,
        typeOfEvidence:
          Array.isArray(u.assessmentMethods) && u.assessmentMethods.length > 0
            ? u.assessmentMethods.map((m) => String(m).replace(/_/g, " ")).join(", ")
            : "Direct Observation, Portfolio, Oral Questioning",
        description: `Mapped against ${toUnitLabel(u)} (${levelLabel})`,
        status: "Satisfied",
        isCustom: false,
      };
    });
  }

  return [
    {
      id: "unit-1",
      occupationalUnit: "",
      performanceCriteria: "",
      typeOfEvidence: "",
      description: "",
      status: "Satisfied",
      isCustom: true,
    },
  ];
}
