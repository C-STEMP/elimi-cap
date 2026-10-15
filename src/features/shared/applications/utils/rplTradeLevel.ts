import type { ApplicationDetail } from "../api/types";
import type { TradeDetail, Unit } from "@/src/features/shared/reference/api";

export interface ResolvedTradeLevel {
  levelNumber: number;
  levelLabel: string;
  levelSlug?: string;
  qualificationLevelId?: string;
}

/**
 * Resolves the trade level that an RPL candidate is applying for.
 *
 * Checks in order:
 * 1. Explicit `qualificationLevel` on the application (object or number).
 * 2. `wishedQualificationLevel` (RPL / NSQ application scope).
 * 3. `tradeLevel` or `level` property on application.
 * 4. `qualificationLevelId` matched against `tradeDetail.activeNosDocument.qualificationLevels`.
 * 5. Candidate's selected `unitIds` matched against `qualificationLevels` in `tradeDetail`.
 * 6. "Level X" string pattern in `qualificationTitle`, `trade.name`, `tradeName`, or `title`.
 * 7. Fallback to Level 3 (the standard NVQF certification level for RPL in Nigeria TVET / CAP),
 *    or the first/default level available in `tradeDetail.activeNosDocument.qualificationLevels`.
 */
export function resolveAppliedTradeLevel(
  application?: ApplicationDetail | null,
  tradeDetail?: TradeDetail | null,
): ResolvedTradeLevel {
  const appAny = application as any;
  const qLevels = tradeDetail?.activeNosDocument?.qualificationLevels || [];

  const buildResult = (
    levelNum: number,
    qLevelId?: string,
  ): ResolvedTradeLevel => {
    const matchedQl = qLevels.find(
      (ql) => ql.level === levelNum || (qLevelId && ql.id === qLevelId),
    );
    const finalLevel = matchedQl?.level ?? levelNum;
    const finalId = matchedQl?.id || qLevelId;
    const slug = matchedQl?.slug;
    const label = `Level ${finalLevel}`;

    return {
      levelNumber: finalLevel,
      levelLabel: label,
      levelSlug: slug,
      qualificationLevelId: finalId,
    };
  };

  // 1. Explicit qualificationLevel on application
  const qlObj = appAny?.qualificationLevel;
  if (qlObj) {
    if (
      typeof qlObj === "object" &&
      typeof qlObj.level === "number" &&
      !isNaN(qlObj.level)
    ) {
      return buildResult(qlObj.level, qlObj.id);
    }
    if (typeof qlObj === "number" && !isNaN(qlObj)) {
      return buildResult(qlObj);
    }
    const parsed = parseInt(String(qlObj).replace(/\D+/g, ""), 10);
    if (!isNaN(parsed) && parsed > 0) {
      return buildResult(parsed);
    }
  }

  // 2. wishedQualificationLevel
  const wished =
    appAny?.wishedQualificationLevel ||
    appAny?.nsq?.wishedQualificationLevel;
  if (wished && typeof wished.level === "number" && !isNaN(wished.level)) {
    return buildResult(wished.level, wished.id);
  }

  // 3. level or tradeLevel fields
  const directLevel = appAny?.tradeLevel ?? appAny?.level;
  if (
    typeof directLevel === "number" &&
    !isNaN(directLevel) &&
    directLevel > 0
  ) {
    return buildResult(directLevel);
  }
  if (typeof directLevel === "string") {
    const parsed = parseInt(directLevel.replace(/\D+/g, ""), 10);
    if (!isNaN(parsed) && parsed > 0) {
      return buildResult(parsed);
    }
  }

  // 4. qualificationLevelId
  const qlId = appAny?.qualificationLevelId;
  if (qlId && qLevels.length > 0) {
    const found = qLevels.find((ql) => ql.id === qlId);
    if (found) {
      return buildResult(found.level, found.id);
    }
  }

  // 5. Match candidate's selected unitIds against levels in tradeDetail
  const unitIds: string[] = Array.isArray(application?.unitIds)
    ? application.unitIds
    : [];
  if (unitIds.length > 0 && qLevels.length > 0) {
    const levelMatch = qLevels.find((ql) =>
      ql.units?.some((u) => unitIds.includes(u.id)),
    );
    if (levelMatch) {
      return buildResult(levelMatch.level, levelMatch.id);
    }
  }

  // 6. Regex check on text fields: qualificationTitle, trade.name, tradeName, title
  const textCandidates = [
    appAny?.qualificationTitle,
    application?.trade?.name,
    appAny?.tradeName,
    appAny?.title,
  ];
  for (const text of textCandidates) {
    if (typeof text === "string") {
      const match = text.match(/level\s*(\d+)/i);
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > 0) {
          return buildResult(parsed);
        }
      }
    }
  }

  // 7. Fallback: check if Level 3 exists in tradeDetail qualificationLevels
  if (qLevels.length > 0) {
    const lvl3 = qLevels.find((ql) => ql.level === 3);
    if (lvl3) {
      return buildResult(3, lvl3.id);
    }
    return buildResult(qLevels[0].level, qLevels[0].id);
  }

  // Standard NVQF RPL Level 3 default
  return {
    levelNumber: 3,
    levelLabel: "Level 3",
  };
}

export interface GetRplScopedUnitsParams {
  tradeUnits?: Unit[];
  tradeDetail?: TradeDetail | null;
  levelNumber: number;
  preferredUnitIds?: string[];
}

/**
 * Returns strictly the units belonging to the candidate's applied trade level.
 *
 * If the candidate selected specific units (e.g. modular assessment), narrows
 * down to those units within the level.
 */
export function getRplScopedUnits({
  tradeUnits = [],
  tradeDetail,
  levelNumber,
  preferredUnitIds = [],
}: GetRplScopedUnitsParams): Unit[] {
  const qLevels = tradeDetail?.activeNosDocument?.qualificationLevels || [];
  const targetLevel = qLevels.find((ql) => ql.level === levelNumber);

  let pool: Unit[] = [];

  if (targetLevel?.units && targetLevel.units.length > 0) {
    // If tradeDetail has the level units, use them, preferring any enriched data in tradeUnits
    const detailUnitMap = new Map(targetLevel.units.map((u) => [u.id, u]));
    if (tradeUnits.length > 0) {
      const matched = tradeUnits.filter((u) => detailUnitMap.has(u.id));
      pool = matched.length > 0 ? matched : targetLevel.units;
    } else {
      pool = targetLevel.units;
    }
  } else if (tradeUnits.length > 0) {
    // If tradeDetail didn't provide split units, tradeUnits fetched from
    // /trades/:id/units?level=:level are already scoped to the level.
    pool = tradeUnits;
  }

  // If candidate picked specific units (modular), filter pool to those units
  if (preferredUnitIds.length > 0) {
    const preferredSet = new Set(preferredUnitIds);
    const filtered = pool.filter((u) => preferredSet.has(u.id));
    if (filtered.length > 0) {
      return filtered;
    }
  }

  return pool;
}
