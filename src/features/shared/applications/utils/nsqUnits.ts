import type { InductionForm, NsqScope, NsqScopeUnit } from "../api/types";

/**
 * Units in scope for an NSQ application: the units the candidate picked on the
 * induction form. `nsq.units` is the whole trade catalogue, so without this
 * filter unpicked units would be shown, worked on, and required before IQA.
 *
 * The submitted induction form's `unitIds` are the authoritative pick — the
 * `wished` flags on `nsq.units` are not returned consistently for every role
 * (the centre view received none and fell back to the whole level). Falls back
 * to the wish-list flags, then the wished qualification level, then the full
 * list, e.g. for applications inducted before unit picking existed.
 */
export function getNsqScopedUnits(
  nsq: Partial<NsqScope> | null | undefined,
  inductionForm?: Pick<InductionForm, "data" | "units"> | null,
): NsqScopeUnit[] {
  const units = nsq?.units ?? [];

  const inductionIds = new Set<string>([
    ...(inductionForm?.data?.unitIds ?? []),
    ...(inductionForm?.units ?? []).map((u) => u.id),
  ]);
  if (inductionIds.size > 0) {
    const fromInduction = units.filter((u) => inductionIds.has(u.id));
    if (fromInduction.length > 0) return fromInduction;
  }

  const wishedIds = new Set(nsq?.wishedUnitIds ?? []);
  const picked = units.filter((u) => u.wished || wishedIds.has(u.id));
  if (picked.length > 0) return picked;

  const level = nsq?.wishedQualificationLevel;
  return level
    ? units.filter((u) => u.qualificationLevelId === level.id)
    : units;
}
