import { movementLibrary as defaultLibrary } from "@retire-strong/movement-library";
import { filterSafeMovements, checkMovementSafety } from "./rules/safety.js";
import type {
  BuildPlanInput,
  MovementInstance,
  MovementPlan,
  MovementSession,
  SessionCompletionInput,
  SessionSelectionInput,
  SessionTemplate,
} from "./types.js";

const SESSION_TEMPLATES: SessionTemplate[] = [
  {
    id: "day1-strength-balance",
    focus: "Strength + Balance",
    movementIds: ["seated_march", "chair_sit_to_stand", "wall_pushup", "standing_hip_abduction", "heel_toe_balance"],
    optionalIds: ["cat_cow_mobility"],
  },
  {
    id: "day2-mobility-core",
    focus: "Mobility + Core",
    movementIds: ["seated_march", "cat_cow_mobility", "standing_hip_abduction", "heel_toe_balance"],
    optionalIds: ["wall_pushup"],
  },
  {
    id: "day3-cardio-balance",
    focus: "Cardio + Balance",
    movementIds: ["standing_march", "heel_toe_balance", "wall_pushup"],
    optionalIds: ["chair_sit_to_stand", "cat_cow_mobility"],
  },
];

const SAFE_FALLBACKS = ["seated_march", "wide_stance_balance", "assisted_sit_to_stand"];

const addDays = (isoDate: string, days: number): string => {
  const base = new Date(isoDate);
  base.setDate(base.getDate() + days);
  return base.toISOString();
};

const buildMovementInstances = (
  ids: string[],
  cautions: string[],
  _planId: string,
  _dayIndex: number,
  library = defaultLibrary
): MovementInstance[] => {
  return ids.map((movementId) => {
    const movement = library.byId[movementId];
    return {
      movementId,
      name: movement?.name ?? movementId,
      description: movement?.description ?? "",
      prescription: movement?.time ?? { type: "reps", sets: 1, reps: "8-10" },
      cautions,
      emphasis: movement?.categories,
    };
  });
};

export const selectMovementsForSession = (input: SessionSelectionInput): MovementSession => {
  const { template, profile, library, planId, dayIndex, scheduledDate } = input;
  const baseMovementIds = template.movementIds;
  const { safeIds, cautions } = filterSafeMovements(baseMovementIds, library, profile);

  const optional = template.optionalIds ?? [];
  const optionalSafe = filterSafeMovements(optional, library, profile).safeIds;
  const combined = [...safeIds, ...optionalSafe].slice(0, 5);

  const finalIds = combined.length > 0 ? combined : filterSafeMovements(SAFE_FALLBACKS, library, profile).safeIds;

  const movements = buildMovementInstances(finalIds, cautions, planId, dayIndex, library);

  return {
    sessionId: `${planId}-d${dayIndex + 1}`,
    planId,
    userId: profile.userId,
    dayIndex,
    focus: template.focus,
    status: "pending",
    scheduledDate,
    movements,
  };
};

export const buildStarterPlan = (input: BuildPlanInput): MovementPlan => {
  const library = input.library ?? defaultLibrary;
  const startDate = input.today ?? new Date().toISOString();
  const planId = `starter-${input.profile.userId}-${startDate.slice(0, 10)}`;
  const schedule: string[] = [];

  const sessions: MovementSession[] = SESSION_TEMPLATES.map((template, idx) => {
    const scheduledDate = addDays(startDate, idx);
    schedule.push(scheduledDate);
    return selectMovementsForSession({
      template,
      profile: input.profile,
      library,
      planId,
      dayIndex: idx,
      scheduledDate,
    });
  });

  const cautions = sessions.flatMap((session) =>
    session.movements.flatMap((movement) => movement.cautions ?? [])
  );

  return {
    planId,
    userId: input.profile.userId,
    createdAt: new Date().toISOString(),
    startDate,
    schedule,
    sessions,
    cautions,
  };
};

export const updatePlanOnCompletion = (input: SessionCompletionInput): MovementPlan => {
  const { plan, sessionId, feedback, library, profile } = input;
  const updatedSessions: MovementSession[] = plan.sessions.map((session): MovementSession => {
    if (session.sessionId !== sessionId) return session;
    return {
      ...session,
      status: "completed",
      completedAt: new Date().toISOString(),
      feedback,
    };
  });

  if (feedback?.difficulty && feedback.difficulty !== "just_right") {
    for (const session of updatedSessions) {
      if (session.status === "completed") continue;
      session.movements = session.movements.map((movement) => {
        const movementDef = library.byId[movement.movementId];
        if (!movementDef) return movement;

        if (feedback.difficulty === "too_hard" && movementDef.regressions.length > 0) {
          const replacementId = movementDef.regressions.find((id) => {
            const candidate = library.byId[id];
            if (!candidate) return false;
            return checkMovementSafety(candidate, profile).safe;
          });
          if (replacementId) {
            const replacement = library.byId[replacementId];
            if (replacement) {
              return {
                ...movement,
                movementId: replacement.id,
                name: replacement.name,
                description: replacement.description,
                prescription: replacement.time,
              };
            }
          }
        }

        if (feedback.difficulty === "too_easy" && movementDef.progressions.length > 0) {
          const replacementId = movementDef.progressions.find((id) => library.byId[id]);
          if (replacementId) {
            const replacement = library.byId[replacementId];
            if (replacement) {
              return {
                ...movement,
                movementId: replacement.id,
                name: replacement.name,
                description: replacement.description,
                prescription: replacement.time,
              };
            }
          }
        }

        return movement;
      });
    }
  }

  return {
    ...plan,
    sessions: updatedSessions as MovementSession[],
  };
};

