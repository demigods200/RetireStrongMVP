import type { MovementDefinition, MovementLibrary } from "@retire-strong/movement-library";
import type { EngineUserProfile, SafetyCheckResult } from "../types.js";

const normalize = (value: string): string => value.toLowerCase().replace(/[\s-]/g, "_");

const conditionMatches = (profileConditions: string[], target: string): boolean => {
  const normalizedTarget = normalize(target);
  return profileConditions.map(normalize).some((item) => item.includes(normalizedTarget) || normalizedTarget.includes(item));
};

export const checkMovementSafety = (
  movement: MovementDefinition,
  profile: EngineUserProfile
): SafetyCheckResult => {
  const profileFlags = [
    ...profile.healthConditions.map(normalize),
    ...profile.mobilityLimitations.map(normalize),
  ];

  const cautions: string[] = [];
  for (const rule of movement.contraindications) {
    if (conditionMatches(profileFlags, rule.condition)) {
      if (rule.severity === "avoid") {
        return {
          safe: false,
          cautions: [...cautions, `Avoid: ${rule.condition} - ${rule.note}`],
          movement,
        };
      }
      cautions.push(`Caution: ${rule.condition} - ${rule.note}`);
    }
  }

  if (profile.age >= 80 && movement.difficulty === "moderate") {
    cautions.push("Caution: advanced difficulty for age 80+");
  }

  return { safe: true, cautions, movement };
};

export const filterSafeMovements = (
  movementIds: string[],
  library: MovementLibrary,
  profile: EngineUserProfile
): { safeIds: string[]; cautions: string[] } => {
  const safeIds: string[] = [];
  const cautions: string[] = [];

  for (const id of movementIds) {
    const movement = library.byId[id];
    if (!movement) continue;
    const safety = checkMovementSafety(movement, profile);
    if (safety.safe) {
      safeIds.push(id);
      cautions.push(...safety.cautions);
    }
  }

  return { safeIds, cautions };
};

