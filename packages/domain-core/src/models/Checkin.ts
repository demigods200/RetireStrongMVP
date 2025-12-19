/**
 * Check-in Models
 * ===============
 * Used for tracking user adherence, difficulty, pain, and overall wellbeing
 * after sessions and on a weekly basis for personalization.
 */

export type CheckinType = "session" | "weekly" | "milestone";

export type AdherenceStatus =
  | "completed-full"      // Completed all movements as prescribed
  | "completed-modified"  // Completed but with modifications
  | "completed-partial"   // Completed some movements, skipped others
  | "skipped-planned"     // Intentionally skipped (rest day, schedule conflict)
  | "skipped-unplanned";  // Missed without planning

export type DifficultyRating = "too_easy" | "just_right" | "too_hard" | "varied";

export type PainLevel = "none" | "mild" | "moderate" | "severe";

export type EnergyLevel = "very_low" | "low" | "moderate" | "high" | "very_high";

export type MoodRating = "poor" | "fair" | "good" | "very_good" | "excellent";

/**
 * Post-session check-in (completed after each workout)
 */
export interface SessionCheckin {
  checkinId: string;
  checkinType: "session";
  userId: string;
  sessionId: string;
  date: string; // ISO 8601 date
  timestamp: string; // ISO 8601 timestamp
  
  // Adherence tracking
  adherence: AdherenceStatus;
  movementsCompleted: number; // Number of movements completed
  movementsTotal: number; // Total movements in session
  sessionDurationMinutes?: number; // Actual duration
  
  // Difficulty assessment
  difficulty: DifficultyRating;
  difficultyNotes?: string;
  
  // Pain tracking
  painLevel: PainLevel;
  painLocations?: string[]; // e.g., ["knee-left", "lower-back"]
  painNotes?: string;
  
  // Energy and exertion
  energyBefore?: EnergyLevel;
  energyAfter?: EnergyLevel;
  perceivedExertion?: number; // 1-10 scale (RPE)
  
  // Qualitative feedback
  notes?: string;
  enjoyed?: boolean;
  
  // Modifications made
  modifications?: {
    movementId: string;
    modificationType: "regression" | "progression" | "substitution" | "skip";
    reason: string;
  }[];
}

/**
 * Weekly check-in (broader health and motivation tracking)
 */
export interface WeeklyCheckin {
  checkinId: string;
  checkinType: "weekly";
  userId: string;
  weekStartDate: string; // ISO 8601 date (Monday)
  date: string; // ISO 8601 date when checkin was completed
  timestamp: string; // ISO 8601 timestamp
  
  // Overall adherence
  sessionsCompletedThisWeek: number;
  sessionsPlannedThisWeek: number;
  
  // Overall difficulty and progression
  overallDifficulty: DifficultyRating;
  feelingStronger?: boolean;
  feelingMoreFlexible?: boolean;
  feelingBetterBalance?: boolean;
  
  // Pain and discomfort
  overallPainLevel: PainLevel;
  newPainOrDiscomfort?: boolean;
  painLocations?: string[];
  seekingMedicalAttention?: boolean;
  
  // Energy and mood
  overallEnergy: EnergyLevel;
  overallMood: MoodRating;
  sleepQuality?: "poor" | "fair" | "good" | "excellent";
  
  // Motivation and barriers
  motivationLevel?: number; // 1-10 scale
  barriersThisWeek?: string[]; // e.g., "time", "energy", "pain", "motivation"
  
  // Goals and confidence
  confidenceInContinuing?: number; // 1-10 scale
  notes?: string;
}

/**
 * Milestone check-in (quarterly or major achievement tracking)
 */
export interface MilestoneCheckin {
  checkinId: string;
  checkinType: "milestone";
  userId: string;
  milestoneType: "30-day" | "90-day" | "6-month" | "1-year" | "custom";
  date: string;
  timestamp: string;
  
  // Achievement summary
  totalSessionsCompleted: number;
  totalDaysActive: number;
  longestStreak: number;
  currentStreak: number;
  
  // Perceived improvements
  improvements: {
    strength?: boolean;
    balance?: boolean;
    flexibility?: boolean;
    endurance?: boolean;
    confidenceInMovement?: boolean;
    dailyActivitiesEasier?: boolean;
  };
  
  // Goals and next steps
  originalGoals: string[];
  goalsAchieved: string[];
  newGoals?: string[];
  
  notes?: string;
}

/**
 * Union type for all checkin types
 */
export type Checkin = SessionCheckin | WeeklyCheckin | MilestoneCheckin;

/**
 * Adherence summary for personalization engine
 */
export interface AdherenceSummary {
  userId: string;
  periodStart: string;
  periodEnd: string;
  
  // Session completion metrics
  sessionsCompleted: number;
  sessionsPlanned: number;
  adherenceRate: number; // 0-1
  
  // Difficulty trends
  averageDifficulty: number; // Normalized 1-5 scale
  trendingEasier: boolean; // True if getting easier over time
  
  // Pain trends
  averagePainLevel: number; // Normalized 0-3 scale
  painIncreasing: boolean;
  frequentPainLocations: string[];
  
  // Energy trends
  averageEnergyBefore: number; // Normalized 1-5 scale
  averageEnergyAfter: number;
  
  // Modification patterns
  frequentModifications: {
    movementId: string;
    modificationType: string;
    count: number;
  }[];
  
  // Drop-off risk indicators
  recentSkipStreak: number;
  motivationTrend: "increasing" | "stable" | "decreasing";
  riskScore: number; // 0-1, higher = higher risk
}

