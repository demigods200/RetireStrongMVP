export type Stage = "dev" | "staging" | "prod";

export const STAGES: Stage[] = ["dev", "staging", "prod"];

export function isValidStage(stage: string): stage is Stage {
  return STAGES.includes(stage as Stage);
}

export function getStage(): Stage {
  const stage = process.env.RETIRE_STRONG_STAGE || "dev";
  if (!isValidStage(stage)) {
    throw new Error(`Invalid stage: ${stage}. Must be one of: ${STAGES.join(", ")}`);
  }
  return stage;
}

export function isProd(): boolean {
  return getStage() === "prod";
}

export function isDev(): boolean {
  return getStage() === "dev";
}

export function isStaging(): boolean {
  return getStage() === "staging";
}

