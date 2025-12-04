/**
 * Persona Selection Logic
 * Maps MotivationProfile to CoachPersona
 */

import type { MotivationProfile, CoachPersona, MotivatorType } from "./types.js";

const PERSONAS: Partial<Record<MotivatorType, CoachPersona>> & { achievement: CoachPersona } = {
  // Achievement-focused persona
  achievement: {
    name: "Coach Alex",
    description: "Goal-oriented and data-driven, Alex helps you track progress and celebrate milestones. Perfect for those who thrive on measurable results.",
    tone: {
      formality: "professional",
      encouragement: "energetic",
      directness: "direct",
      humor: "light",
    },
  },

  // Autonomy-focused persona
  autonomy: {
    name: "Coach Sam",
    description: "Flexible and empowering, Sam gives you choices and adapts to your preferences. Ideal for independent spirits who value freedom.",
    tone: {
      formality: "casual",
      encouragement: "moderate",
      directness: "balanced",
      humor: "moderate",
    },
  },

  // Social-focused persona
  social: {
    name: "Coach Jordan",
    description: "Warm and supportive, Jordan creates a sense of connection and community. Great for those who appreciate encouragement and understanding.",
    tone: {
      formality: "warm",
      encouragement: "gentle",
      directness: "subtle",
      humor: "light",
    },
  },

  // Health fear-focused persona
  health_fear: {
    name: "Coach Morgan",
    description: "Caring and safety-focused, Morgan helps you build confidence while being mindful of your concerns. Perfect for those prioritizing prevention and safety.",
    tone: {
      formality: "professional",
      encouragement: "gentle",
      directness: "balanced",
      humor: "none",
    },
  },

  // Independence-focused persona
  independence: {
    name: "Coach Taylor",
    description: "Empowering and practical, Taylor focuses on building skills that support your independence. Ideal for those who want to maintain their autonomy.",
    tone: {
      formality: "warm",
      encouragement: "moderate",
      directness: "balanced",
      humor: "light",
    },
  },

  // Mastery-focused persona
  mastery: {
    name: "Coach Casey",
    description: "Knowledgeable and patient, Casey helps you learn and master new movements. Perfect for those who enjoy the process of improvement.",
    tone: {
      formality: "professional",
      encouragement: "moderate",
      directness: "direct",
      humor: "none",
    },
  },

  // Purpose-focused persona
  purpose: {
    name: "Coach Riley",
    description: "Inspiring and purpose-driven, Riley connects your actions to your deeper goals. Great for those motivated by meaning and long-term vision.",
    tone: {
      formality: "warm",
      encouragement: "energetic",
      directness: "balanced",
      humor: "moderate",
    },
  },
};

export function pickPersona(profile: MotivationProfile): CoachPersona {
  // Use primary motivator to select persona
  const persona = PERSONAS[profile.primaryMotivator];
  
  // Fallback to achievement persona if not found
  if (persona) {
    return persona;
  }
  
  return PERSONAS.achievement;
}

