/**
 * Candidate & Shared Application Constants
 */

export const IMPAIRMENT_OPTIONS: string[] = [
  "None / No impairment",
  "Visual impairment (Blindness, low vision, color blindness)",
  "Hearing impairment (Deaf or hard of hearing)",
  "Physical / Motor impairment (Limited hand mobility, missing limbs, severe tremors)",
  "Reading or Literacy difficulty (Dyslexia, low formal literacy)",
  "Speech impairment (Difficulty speaking or using voice controls)",
  "Cognitive or Learning difficulty (Memory loss, difficulty concentrating, brain injury)",
  "Multiple impairments",
  "Prefer not to say",
  "Other",
];

export const GENDER_OPTIONS: string[] = [
  "Male",
  "Female",
  "Prefer not to say",
];

export const COMPLETED_BEFORE_OPTIONS = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

export function parseImpairmentString(raw: string | undefined | null): {
  list: string[];
  otherText: string;
} {
  if (!raw || raw === "No" || raw === "None" || raw === "None / No impairment") {
    return { list: ["None / No impairment"], otherText: "" };
  }

  const list: string[] = [];
  let otherText = "";
  let remaining = raw.trim();

  // Check for each known impairment option (sorted by longest length first to match full phrases)
  const sortedOptions = [...IMPAIRMENT_OPTIONS]
    .filter((opt) => opt !== "Other" && opt !== "None / No impairment")
    .sort((a, b) => b.length - a.length);

  for (const opt of sortedOptions) {
    if (remaining.includes(opt)) {
      list.push(opt);
      remaining = remaining.replace(opt, "").trim();
    }
  }

  if (remaining.includes("None / No impairment")) {
    list.push("None / No impairment");
    remaining = remaining.replace("None / No impairment", "").trim();
  }

  // Check for Other / Other: ... in remaining or raw
  const otherMatch = remaining.match(/Other:\s*([^,]+)/i) || raw.match(/Other:\s*([^,]+)/i);
  if (otherMatch) {
    if (!list.includes("Other")) list.push("Other");
    otherText = otherMatch[1].trim();
  } else if (remaining.toLowerCase().includes("other") || raw.toLowerCase().includes("other")) {
    if (!list.includes("Other")) {
      list.push("Other");
    }
  }

  // Fallback: If nothing was matched from standard options, also try splitting by comma as fallback
  if (list.length === 0) {
    const items = raw.split(",").map((s) => s.trim()).filter(Boolean);
    items.forEach((item) => {
      if (item.startsWith("Other:")) {
        list.push("Other");
        otherText = item.replace(/^Other:\s*/, "");
      } else {
        list.push(item);
      }
    });
  }

  return {
    list: list.length > 0 ? list : ["None / No impairment"],
    otherText,
  };
}
