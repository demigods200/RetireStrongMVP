/**
 * Motivation Engine Types
 * Pure domain types for motivation profiling and persona selection
 */

export type AnswerValue = number; // 1-5 scale typically

export interface QuizAnswer {
  questionId: string;
  value: AnswerValue;
}

export interface MotivationProfile {
  primaryMotivator: MotivatorType;
  secondaryMotivators: MotivatorType[];
  scores: Record<MotivatorType, number>;
}

export type MotivatorType =
  | "achievement"
  | "autonomy"
  | "social"
  | "health_fear"
  | "independence"
  | "mastery"
  | "purpose";

export interface CoachPersona {
  name: string;
  description: string;
  tone: ToneConfig;
  avatar?: string;
}

export interface ToneConfig {
  formality: "casual" | "professional" | "warm";
  encouragement: "gentle" | "moderate" | "energetic";
  directness: "subtle" | "balanced" | "direct";
  humor: "none" | "light" | "moderate";
}

