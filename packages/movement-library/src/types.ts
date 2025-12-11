export type MovementCategory = "strength" | "balance" | "mobility" | "cardio" | "core" | "warmup";

export type MovementDifficulty = "very_easy" | "easy" | "moderate";

export type PrescriptionType = "reps" | "time";

export interface MovementPrescription {
  type: PrescriptionType;
  sets: number;
  reps?: string; // e.g., "8-10"
  seconds?: number; // e.g., 45
  holdSeconds?: number; // for static balance holds
  restSeconds?: number;
  notes?: string;
}

export interface Contraindication {
  condition: string;
  severity: "avoid" | "caution";
  note: string;
}

export interface MovementDefinition {
  id: string;
  name: string;
  description: string;
  categories: MovementCategory[];
  difficulty: MovementDifficulty;
  joints: string[];
  muscles: string[];
  contraindications: Contraindication[];
  regressions: string[];
  progressions: string[];
  time: MovementPrescription;
  equipment: string[];
  cues: string[];
  safetyTips: string[];
}

export interface MovementLibrary {
  movements: MovementDefinition[];
  byId: Record<string, MovementDefinition>;
}

