export function getAutoFilledUnitTitleCode(
  rawTrade?: string,
  formType?: "skills_demo" | "observation_checklist" | "assessment_mapping" | string,
): string {
  const trade = (rawTrade || "").trim();
  const lower = trade.toLowerCase();

  if (lower.includes("carpentry") || lower.includes("joiner") || lower.includes("wood")) {
    return formType === "skills_demo"
      ? "CRP-301: Structural Framework"
      : "CRP-301: Advanced Joinery & Surface Prep";
  }
  if (lower.includes("electr")) {
    return "ELC-201: Domestic Electrical Installations";
  }
  if (lower.includes("plumb") || lower.includes("pipe")) {
    return "PLM-101: Pipe Fitting & Pressure Testing";
  }
  if (lower.includes("weld") || lower.includes("metal")) {
    return "WLD-401: Structural TIG & Arc Welding";
  }
  if (lower.includes("cosmetol") || lower.includes("beauty") || lower.includes("hair")) {
    return "COS-101: Cosmetology & Personal Care Services";
  }
  if (lower.includes("auto") || lower.includes("mechanic")) {
    return "AUT-201: Automotive Maintenance & Diagnostics";
  }
  if (lower.includes("mason") || lower.includes("brick") || lower.includes("construction")) {
    return "CON-301: Masonry & Structural Construction";
  }
  if (lower.includes("tailor") || lower.includes("fashion") || lower.includes("garment")) {
    return "FSH-201: Garment Construction & Pattern Drafting";
  }
  if (lower.includes("cater") || lower.includes("culinary") || lower.includes("cook")) {
    return "CUL-101: Professional Culinary Arts & Food Safety";
  }
  if (trade && !/^[0-9a-f-]{20,}$/i.test(trade)) {
    const prefix = trade.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "UNT";
    return `${prefix}-101: ${trade} Core Competencies`;
  }
  return formType === "skills_demo"
    ? "CRP-301: Structural Framework"
    : "CRP-301: Advanced Joinery & Surface Prep";
}

export function getUnitOptions(
  currentUnit?: string,
  formType?: "skills_demo" | "observation_checklist" | "assessment_mapping" | string,
): Array<{ label: string; value: string }> {
  const baseOptions =
    formType === "skills_demo"
      ? [
          { label: "CRP-301: Structural Framework", value: "CRP-301: Structural Framework" },
          { label: "CRP-302: Finishing & Assembly", value: "CRP-302: Finishing & Assembly" },
          { label: "CBT-001: Safety & Workshop Operations", value: "CBT-001: Safety & Workshop Operations" },
          { label: "ELC-201: Domestic Electrical Installations", value: "ELC-201: Domestic Electrical Installations" },
          { label: "PLM-101: Pipe Fitting & Pressure Testing", value: "PLM-101: Pipe Fitting & Pressure Testing" },
          { label: "WLD-401: Structural TIG & Arc Welding", value: "WLD-401: Structural TIG & Arc Welding" },
          { label: "COS-101: Cosmetology & Personal Care Services", value: "COS-101: Cosmetology & Personal Care Services" },
          { label: "AUT-201: Automotive Maintenance & Diagnostics", value: "AUT-201: Automotive Maintenance & Diagnostics" },
        ]
      : [
          { label: "CRP-301: Advanced Joinery & Surface Prep", value: "CRP-301: Advanced Joinery & Surface Prep" },
          { label: "ELC-201: Domestic Electrical Installations", value: "ELC-201: Domestic Electrical Installations" },
          { label: "PLM-101: Pipe Fitting & Pressure Testing", value: "PLM-101: Pipe Fitting & Pressure Testing" },
          { label: "WLD-401: Structural TIG & Arc Welding", value: "WLD-401: Structural TIG & Arc Welding" },
          { label: "COS-101: Cosmetology & Personal Care Services", value: "COS-101: Cosmetology & Personal Care Services" },
          { label: "AUT-201: Automotive Maintenance & Diagnostics", value: "AUT-201: Automotive Maintenance & Diagnostics" },
        ];

  if (currentUnit && currentUnit !== "Select" && !baseOptions.some((b) => b.value === currentUnit)) {
    return [{ label: currentUnit, value: currentUnit }, ...baseOptions];
  }
  return baseOptions;
}
