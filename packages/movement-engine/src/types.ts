import type {
  MovementDefinition,
  MovementLibrary,
  MovementPrescription,
} from "@retire-strong/movement-library";

export interface EngineUserProfile {
  userId: string;
  age: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active";
  goals: string[];
  healthConditions: string[];
  mobilityLimitations: string[];
  equipmentAvailable: string[];
  schedulePreferences?: {
    preferredDays: string[];
    preferredTime: "morning" | "afternoon" | "evening" | "flexible";
    sessionDuration: number;
  };
}

export interface MotivationProfileLite {
  primaryMotivator: string;
  secondaryMotivators?: string[];
}

export interface SessionTemplate {
  id: string;
  focus: string;
  movementIds: string[];
  optionalIds?: string[];
}

export interface MovementInstance {
  movementId: string;
  name: string;
  description: string;
  prescription: MovementPrescription;
  emphasis?: string[];
  cautions?: string[];
}

export type SessionStatus = "pending" | "completed";

export interface SessionFeedback {
  difficulty?: "too_easy" | "just_right" | "too_hard";
  pain?: boolean;
  notes?: string;
}

export interface MovementSession {
  sessionId: string;
  planId: string;
  userId: string;
  dayIndex: number;
  focus: string;
  status: SessionStatus;
  scheduledDate: string;
  movements: MovementInstance[];
  completedAt?: string;
  feedback?: SessionFeedback;
}

export interface MovementPlan {
  planId: string;
  userId: string;
  createdAt: string;
  startDate: string;
  schedule: string[];
  sessions: MovementSession[];
  cautions: string[];
}

export interface BuildPlanInput {
  profile: EngineUserProfile;
  motivationProfile?: MotivationProfileLite;
  today?: string;
  library: MovementLibrary;
}

export interface SessionSelectionInput {
  template: SessionTemplate;
  profile: EngineUserProfile;
  library: MovementLibrary;
  planId: string;
  dayIndex: number;
  scheduledDate: string;
}

export interface SessionCompletionInput {
  plan: MovementPlan;
  sessionId: string;
  feedback?: SessionFeedback;
  library: MovementLibrary;
  profile: EngineUserProfile;
}

export interface SafetyCheckResult {
  safe: boolean;
  cautions: string[];
  movement: MovementDefinition;
}

