/**
 * ML Hints Types
 * ===============
 * Optional ML-powered hints for personalization.
 * 
 * IMPORTANT: These are suggestions only. All ML hints must pass through:
 * 1. Movement Engine validation (deterministic safety rules)
 * 2. Safety Brain filtering (guardrail override layer)
 * 
 * ML never has final authority - it only provides hints.
 */

export interface DropoffRiskFactors {
  // Adherence patterns
  recentSkipStreak: number;
  adherenceRate: number; // 0-1
  adherenceTrend: "improving" | "stable" | "declining";
  
  // Difficulty patterns
  averageDifficulty: number; // 1-5 scale
  difficultyTrend: "getting-easier" | "stable" | "getting-harder";
  
  // Pain patterns
  averagePainLevel: number; // 0-3 scale
  painTrend: "improving" | "stable" | "worsening";
  frequentPainLocations: string[];
  
  // Energy patterns
  averageEnergyBefore: number; // 1-5 scale
  energyTrend: "improving" | "stable" | "declining";
  
  // Engagement signals
  sessionDurationTrend: "stable" | "decreasing";
  feedbackCompletionRate: number; // 0-1
  lastActivityDaysAgo: number;
}

export interface DropoffRiskPrediction {
  riskLevel: "low" | "medium" | "high";
  riskScore: number; // 0-1, higher = higher risk
  confidence: number; // 0-1, model confidence in prediction
  factors: DropoffRiskFactors;
  topRiskFactors: Array<{
    factor: string;
    impact: number; // 0-1
    description: string;
  }>;
}

export interface PersonalizationHint {
  hintType: "difficulty" | "frequency" | "duration" | "timing" | "content";
  suggestion: string;
  reasoning: string;
  confidence: number; // 0-1
  priority: "low" | "medium" | "high";
}

export interface EngagementSignals {
  userId: string;
  timeOfDayPreference?: "morning" | "afternoon" | "evening";
  sessionDurationPreference?: number; // minutes
  favoriteMovementCategories?: string[];
  leastFavoriteMovementCategories?: string[];
  optimalRestDays?: number;
  bestDayOfWeek?: string[];
}

