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
