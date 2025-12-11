import {
  buildStarterPlan,
  movementLibrary,
  type EngineUserProfile,
} from "@retire-strong/movement-engine";
import type { CreatePlanInput, MovementPlan } from "../models/Plan.js";
import { PlanRepo } from "../repos/PlanRepo.js";
import { SessionRepo } from "../repos/SessionRepo.js";
import { UserRepo } from "../repos/UserRepo.js";

const toEngineProfile = (input: CreatePlanInput): EngineUserProfile => {
  const { onboardingData, userId } = input;
  return {
    userId,
    age: onboardingData.demographics.age,
    activityLevel: onboardingData.healthContext.activityLevel,
    goals: onboardingData.goals,
    healthConditions: onboardingData.healthContext.healthConditions,
    mobilityLimitations: onboardingData.healthContext.mobilityLimitations,
    equipmentAvailable: onboardingData.healthContext.equipmentAvailable,
    schedulePreferences: onboardingData.schedulePreferences,
  };
};

export class PlanService {
  constructor(
    private readonly planRepo: PlanRepo,
    private readonly sessionRepo: SessionRepo,
    private readonly userRepo: UserRepo
  ) {}

  async createStarterPlan(input: CreatePlanInput): Promise<MovementPlan> {
    const engineProfile = toEngineProfile(input);
    const plan = buildStarterPlan({
      profile: engineProfile,
      motivationProfile: input.motivationProfile,
      library: movementLibrary,
    });

    await this.planRepo.savePlan(plan);
    await this.sessionRepo.saveSessions(plan.sessions);
    return plan;
  }

  async getCurrentPlan(userId: string): Promise<MovementPlan | null> {
    const latest = await this.planRepo.getLatestPlanForUser(userId);
    if (!latest) {
      return null;
    }
    const sessions = await this.sessionRepo.listSessionsForPlan(latest.planId, userId);
    return {
      ...latest,
      sessions,
    };
  }

  async ensureStarterPlan(userId: string): Promise<MovementPlan> {
    const existing = await this.getCurrentPlan(userId);
    if (existing) return existing;

    const user = await this.userRepo.getUserById(userId);
    if (!user || !user.onboardingData) {
      throw new Error("User onboarding data required to build a plan");
    }

    return this.createStarterPlan({
      userId,
      onboardingData: user.onboardingData,
      motivationProfile: user.motivationProfile,
    });
  }
}

