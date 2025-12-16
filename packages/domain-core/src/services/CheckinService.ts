import type {
  Checkin,
  SessionCheckin,
  WeeklyCheckin,
  MilestoneCheckin,
  AdherenceSummary,
} from "../models/Checkin";
import type { CheckinRepo } from "../repos/CheckinRepo";
import { v4 as uuidv4 } from "uuid";

/**
 * CheckinService
 * ==============
 * Business logic for managing user check-ins and adherence tracking.
 * Supports session check-ins, weekly check-ins, and milestone check-ins.
 */
export class CheckinService {
  constructor(private checkinRepo: CheckinRepo) { }

  /**
   * Create a session check-in after completing (or skipping) a workout
   */
  async createSessionCheckin(input: {
    userId: string;
    sessionId: string;
    adherence: SessionCheckin["adherence"];
    movementsCompleted: number;
    movementsTotal: number;
    difficulty: SessionCheckin["difficulty"];
    painLevel: SessionCheckin["painLevel"];
    sessionDurationMinutes?: number;
    difficultyNotes?: string;
    painLocations?: string[];
    painNotes?: string;
    energyBefore?: SessionCheckin["energyBefore"];
    energyAfter?: SessionCheckin["energyAfter"];
    perceivedExertion?: number;
    notes?: string;
    enjoyed?: boolean;
    modifications?: SessionCheckin["modifications"];
  }): Promise<SessionCheckin> {
    const now = new Date();
    const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const timestamp = now.toISOString();

    const checkin: SessionCheckin = {
      checkinId: uuidv4() || '',
      checkinType: "session",
      userId: input.userId,
      sessionId: input.sessionId || '',
      date: date || '',
      timestamp,
      adherence: input.adherence,
      movementsCompleted: input.movementsCompleted,
      movementsTotal: input.movementsTotal,
      difficulty: input.difficulty,
      painLevel: input.painLevel,
      sessionDurationMinutes: input.sessionDurationMinutes,
      difficultyNotes: input.difficultyNotes,
      painLocations: input.painLocations,
      painNotes: input.painNotes,
      energyBefore: input.energyBefore,
      energyAfter: input.energyAfter,
      perceivedExertion: input.perceivedExertion,
      notes: input.notes,
      enjoyed: input.enjoyed,
      modifications: input.modifications,
    };

    await this.checkinRepo.saveCheckin(checkin);
    return checkin;
  }

  /**
   * Create a weekly check-in
   */
  async createWeeklyCheckin(input: {
    userId: string;
    weekStartDate: string;
    sessionsCompletedThisWeek: number;
    sessionsPlannedThisWeek: number;
    overallDifficulty: WeeklyCheckin["overallDifficulty"];
    feelingStronger?: boolean;
    feelingMoreFlexible?: boolean;
    feelingBetterBalance?: boolean;
    overallPainLevel: WeeklyCheckin["overallPainLevel"];
    newPainOrDiscomfort?: boolean;
    painLocations?: string[];
    seekingMedicalAttention?: boolean;
    overallEnergy: WeeklyCheckin["overallEnergy"];
    overallMood: WeeklyCheckin["overallMood"];
    sleepQuality?: WeeklyCheckin["sleepQuality"];
    motivationLevel?: number;
    barriersThisWeek?: string[];
    confidenceInContinuing?: number;
    notes?: string;
  }): Promise<WeeklyCheckin> {
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const timestamp = now.toISOString();

    const checkin: WeeklyCheckin = {
      checkinId: uuidv4() || '',
      checkinType: "weekly",
      userId: input.userId,
      weekStartDate: input.weekStartDate,
      date: date || '',
      timestamp,
      sessionsCompletedThisWeek: input.sessionsCompletedThisWeek,
      sessionsPlannedThisWeek: input.sessionsPlannedThisWeek,
      overallDifficulty: input.overallDifficulty,
      feelingStronger: input.feelingStronger,
      feelingMoreFlexible: input.feelingMoreFlexible,
      feelingBetterBalance: input.feelingBetterBalance,
      overallPainLevel: input.overallPainLevel,
      newPainOrDiscomfort: input.newPainOrDiscomfort,
      painLocations: input.painLocations,
      seekingMedicalAttention: input.seekingMedicalAttention,
      overallEnergy: input.overallEnergy,
      overallMood: input.overallMood,
      sleepQuality: input.sleepQuality,
      motivationLevel: input.motivationLevel,
      barriersThisWeek: input.barriersThisWeek,
      confidenceInContinuing: input.confidenceInContinuing,
      notes: input.notes,
    };

    await this.checkinRepo.saveCheckin(checkin);
    return checkin;
  }

  /**
   * Create a milestone check-in
   */
  async createMilestoneCheckin(input: {
    userId: string;
    milestoneType: MilestoneCheckin["milestoneType"];
    totalSessionsCompleted: number;
    totalDaysActive: number;
    longestStreak: number;
    currentStreak: number;
    improvements: MilestoneCheckin["improvements"];
    originalGoals: string[];
    goalsAchieved: string[];
    newGoals?: string[];
    notes?: string;
  }): Promise<MilestoneCheckin> {
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const timestamp = now.toISOString();

    const checkin: MilestoneCheckin = {
      checkinId: uuidv4() || '',
      checkinType: "milestone",
      userId: input.userId,
      milestoneType: input.milestoneType,
      date: date || '',
      timestamp,
      totalSessionsCompleted: input.totalSessionsCompleted,
      totalDaysActive: input.totalDaysActive,
      longestStreak: input.longestStreak,
      currentStreak: input.currentStreak,
      improvements: input.improvements,
      originalGoals: input.originalGoals,
      goalsAchieved: input.goalsAchieved,
      newGoals: input.newGoals,
      notes: input.notes,
    };

    await this.checkinRepo.saveCheckin(checkin);
    return checkin;
  }

  /**
   * Get a specific check-in
   */
  async getCheckin(userId: string, date: string): Promise<Checkin | null> {
    return this.checkinRepo.getCheckin(userId, date);
  }

  /**
   * Get check-ins within a date range
   */
  async getCheckinsInRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Checkin[]> {
    return this.checkinRepo.getCheckinsInRange(userId, startDate, endDate);
  }

  /**
   * Get recent check-ins
   */
  async getRecentCheckins(userId: string, limit?: number): Promise<Checkin[]> {
    return this.checkinRepo.getRecentCheckins(userId, limit);
  }

  /**
   * Get adherence summary for personalization
   * This is used by the Movement Engine to adjust difficulty and progressions
   */
  async getAdherenceSummary(
    userId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<AdherenceSummary> {
    return this.checkinRepo.calculateAdherenceSummary(userId, periodStart, periodEnd);
  }

  /**
   * Get latest weekly check-in
   */
  async getLatestWeeklyCheckin(userId: string): Promise<WeeklyCheckin | null> {
    return this.checkinRepo.getLatestWeeklyCheckin(userId);
  }

  /**
   * Helper: Get adherence summary for last N days (default 30)
   */
  async getRecentAdherenceSummary(
    userId: string,
    days: number = 30
  ): Promise<AdherenceSummary> {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    return this.getAdherenceSummary(userId, startDate || '', endDate || '');
  }

  /**
   * Analyze if user is at risk of dropping off
   * Returns risk level and recommendations
   */
  async analyzeDropoffRisk(userId: string): Promise<{
    riskLevel: "low" | "medium" | "high";
    riskScore: number;
    factors: string[];
    recommendations: string[];
  }> {
    const summary = await this.getRecentAdherenceSummary(userId, 14); // Last 2 weeks

    const factors: string[] = [];
    const recommendations: string[] = [];

    if (summary.adherenceRate < 0.5) {
      factors.push("Low adherence rate");
      recommendations.push("Consider reducing session frequency or duration");
    }

    if (summary.recentSkipStreak >= 2) {
      factors.push("Recent skip streak");
      recommendations.push("Check in with user about barriers");
    }

    if (summary.averagePainLevel > 1.5) {
      factors.push("Elevated pain levels");
      recommendations.push("Review exercises for pain-causing movements");
    }

    if (summary.averageDifficulty > 3.5) {
      factors.push("Sessions too challenging");
      recommendations.push("Consider regressions or easier variations");
    }

    if (summary.averageEnergyBefore < 2.5) {
      factors.push("Low energy levels");
      recommendations.push("Suggest shorter sessions or different time of day");
    }

    let riskLevel: "low" | "medium" | "high" = "low";
    if (summary.riskScore >= 0.6) riskLevel = "high";
    else if (summary.riskScore >= 0.3) riskLevel = "medium";

    return {
      riskLevel,
      riskScore: summary.riskScore,
      factors,
      recommendations,
    };
  }
}

