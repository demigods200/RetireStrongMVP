export interface Demographics {
  age: number;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  location?: string;
}

export interface HealthContext {
  activityLevel: "sedentary" | "light" | "moderate" | "active";
  healthConditions: string[];
  mobilityLimitations: string[];
  equipmentAvailable: string[];
}

export interface OnboardingData {
  demographics: Demographics;
  healthContext: HealthContext;
  goals: string[];
  schedulePreferences: {
    preferredDays: string[]; // e.g., ["monday", "wednesday", "friday"]
    preferredTime: "morning" | "afternoon" | "evening" | "flexible";
    sessionDuration: number; // minutes
  };
}

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  onboardingComplete: boolean;
  onboardingData?: OnboardingData;
  motivationProfile?: MotivationProfile;
  coachPersona?: CoachPersona;
}

export interface MotivationProfile {
  primaryMotivator: string;
  secondaryMotivators: string[];
  scores: Record<string, number>;
}

export interface CoachPersona {
  name: string;
  description: string;
  tone: {
    formality: "casual" | "professional" | "warm";
    encouragement: "gentle" | "moderate" | "energetic";
    directness: "subtle" | "balanced" | "direct";
    humor: "none" | "light" | "moderate";
  };
  avatar?: string;
}

export interface CreateUserInput {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface CompleteOnboardingInput {
  userId: string;
  onboardingData: OnboardingData;
}

export interface SetMotivationProfileInput {
  userId: string;
  motivationProfile: MotivationProfile;
  coachPersona: CoachPersona;
}

