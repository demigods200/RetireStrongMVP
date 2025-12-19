import { movementLibrary, updatePlanOnCompletion } from "@retire-strong/movement-engine";
import type { CompleteSessionInput, MovementSession } from "../models/Plan.js";
import { PlanRepo } from "../repos/PlanRepo.js";
import { SessionRepo } from "../repos/SessionRepo.js";
import { UserRepo } from "../repos/UserRepo.js";
import type { CheckinRepo } from "../repos/CheckinRepo.js";

export class SessionService {
  constructor(
    private readonly planRepo: PlanRepo,
    private readonly sessionRepo: SessionRepo,
    private readonly userRepo: UserRepo,
    private readonly checkinRepo?: CheckinRepo // Optional for enhanced personalization
  ) { }

  async getSession(sessionId: string, userId: string): Promise<MovementSession | null> {
    return this.sessionRepo.getSession(sessionId, userId);
  }

  async completeSession(userId: string, input: CompleteSessionInput): Promise<MovementSession> {
    const session = await this.sessionRepo.getSession(input.sessionId, userId);
    if (!session) {
      throw new Error("Session not found");
    }

    const plan = await this.planRepo.getLatestPlanForUser(userId);
    if (!plan) {
      throw new Error("Plan not found for user");
    }

    const user = await this.userRepo.getUserById(userId);
    if (!user || !user.onboardingData) {
      throw new Error("Onboarding data required to update plan");
    }

    // Fetch adherence summary for personalized adjustments (if checkinRepo available)
    let adherenceSummary;
    if (this.checkinRepo) {
      try {
        const endDate = new Date().toISOString().split("T")[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        adherenceSummary = await this.checkinRepo.calculateAdherenceSummary(
          userId,
          startDate || '',
          endDate || ''
        );
      } catch (error) {
        // If adherence calculation fails, continue without it
        console.warn("Failed to calculate adherence summary:", error);
      }
    }

    const updatedPlan = updatePlanOnCompletion({
      plan,
      sessionId: input.sessionId,
      feedback: input.feedback,
      library: movementLibrary,
      profile: {
        userId,
        age: user.onboardingData.demographics.age,
        activityLevel: user.onboardingData.healthContext.activityLevel,
        goals: user.onboardingData.goals,
        healthConditions: user.onboardingData.healthContext.healthConditions,
        mobilityLimitations: user.onboardingData.healthContext.mobilityLimitations,
        equipmentAvailable: user.onboardingData.healthContext.equipmentAvailable,
        schedulePreferences: user.onboardingData.schedulePreferences,
      },
      adherenceSummary, // Enhanced personalization with check-in history
    });

    // Persist the completed session and any downstream adjustments
    for (const sessionItem of updatedPlan.sessions) {
      await this.sessionRepo.updateSession(sessionItem);
    }
    await this.planRepo.savePlan(updatedPlan);

    const updated = updatedPlan.sessions.find(
      (s: MovementSession) => s.sessionId === input.sessionId
    );
    if (!updated) {
      throw new Error("Failed to update session");
    }

    return updated;
  }
}

