import type {
  MovementPlan as EngineMovementPlan,
  MovementSession as EngineMovementSession,
  SessionFeedback,
} from "@retire-strong/movement-engine";
import type { OnboardingData, MotivationProfile } from "./User.js";

export type MovementPlan = EngineMovementPlan;
export type MovementSessionRecord = EngineMovementSession;
export type MovementSessionFeedback = SessionFeedback;
export type MovementSession = MovementSessionRecord;

export interface CreatePlanInput {
  userId: string;
  onboardingData: OnboardingData;
  motivationProfile?: MotivationProfile;
}

export interface CompleteSessionInput {
  sessionId: string;
  feedback?: SessionFeedback;
}

