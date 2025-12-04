import { z } from "zod";

export const DemographicsSchema = z.object({
  age: z.number().min(50).max(100),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  location: z.string().optional(),
});

export const HealthContextSchema = z.object({
  activityLevel: z.enum(["sedentary", "light", "moderate", "active"]),
  healthConditions: z.array(z.string()).default([]),
  mobilityLimitations: z.array(z.string()).default([]),
  equipmentAvailable: z.array(z.string()).default([]),
});

export const SchedulePreferencesSchema = z.object({
  preferredDays: z.array(z.string()).min(1, "Select at least one day"),
  preferredTime: z.enum(["morning", "afternoon", "evening", "flexible"]),
  sessionDuration: z.number().min(10).max(60),
});

export const OnboardingDataSchema = z.object({
  demographics: DemographicsSchema,
  healthContext: HealthContextSchema,
  goals: z.array(z.string()).min(1, "Select at least one goal"),
  schedulePreferences: SchedulePreferencesSchema,
});

export const OnboardingRequestSchema = z.object({
  userId: z.string(),
  onboardingData: OnboardingDataSchema,
});

export const OnboardingResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    userId: z.string(),
    onboardingComplete: z.boolean(),
  }),
});

export type Demographics = z.infer<typeof DemographicsSchema>;
export type HealthContext = z.infer<typeof HealthContextSchema>;
export type SchedulePreferences = z.infer<typeof SchedulePreferencesSchema>;
export type OnboardingData = z.infer<typeof OnboardingDataSchema>;
export type OnboardingRequest = z.infer<typeof OnboardingRequestSchema>;
export type OnboardingResponse = z.infer<typeof OnboardingResponseSchema>;

