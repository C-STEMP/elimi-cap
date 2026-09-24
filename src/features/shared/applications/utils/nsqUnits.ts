import type { NsqScope, NsqScopeUnit } from "../api/types";

/**
 * Units in scope for an NSQ application: the units the candidate picked on the
 * induction form. `nsq.units` is the whole trade catalogue, so without this
 * filter unpicked units would be shown, worked on, and required before IQA.
 *
 * Falls back to the wished qualification level (then the full list) only when
 * no units were picked, e.g. applications inducted before unit picking existed.
 */
export function getNsqScopedUnits(
  nsq: Partial<NsqScope> | null | undefined,
): NsqScopeUnit[] {
  const units = nsq?.units ?? [];
  const wishedIds = new Set(nsq?.wishedUnitIds ?? []);
  const picked = units.filter((u) => u.wished || wishedIds.has(u.id));
  if (picked.length > 0) return picked;

  const level = nsq?.wishedQualificationLevel;
  return level
    ? units.filter((u) => u.qualificationLevelId === level.id)
    : units;
}
