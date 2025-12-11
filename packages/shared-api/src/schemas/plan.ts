import { z } from "zod";

export const MovementPrescriptionSchema = z.object({
  type: z.enum(["reps", "time"]),
  sets: z.number(),
  reps: z.string().optional(),
  seconds: z.number().optional(),
  holdSeconds: z.number().optional(),
  restSeconds: z.number().optional(),
  notes: z.string().optional(),
});

export const MovementInstanceSchema = z.object({
  movementId: z.string(),
  name: z.string(),
  description: z.string(),
  prescription: MovementPrescriptionSchema,
  emphasis: z.array(z.string()).optional(),
  cautions: z.array(z.string()).optional(),
});

export const SessionFeedbackSchema = z.object({
  difficulty: z.enum(["too_easy", "just_right", "too_hard"]).optional(),
  pain: z.boolean().optional(),
  notes: z.string().optional(),
});

export const MovementSessionSchema = z.object({
  sessionId: z.string(),
  planId: z.string(),
  userId: z.string(),
  dayIndex: z.number(),
  focus: z.string(),
  status: z.enum(["pending", "completed"]),
  scheduledDate: z.string(),
  movements: z.array(MovementInstanceSchema),
  completedAt: z.string().optional(),
  feedback: SessionFeedbackSchema.optional(),
});

export const MovementPlanSchema = z.object({
  planId: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  startDate: z.string(),
  schedule: z.array(z.string()),
  sessions: z.array(MovementSessionSchema),
  cautions: z.array(z.string()),
});

export const CreateStarterPlanRequestSchema = z.object({
  userId: z.string(),
});

export const PlanResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    plan: MovementPlanSchema,
  }),
});

export const CurrentPlanResponseSchema = PlanResponseSchema;

export const GetSessionRequestSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
});

export const GetSessionResponseSchema = z.object({
  success: z.boolean(),
  data: MovementSessionSchema,
});

export const CompleteSessionRequestSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  feedback: SessionFeedbackSchema.optional(),
});

export const CompleteSessionResponseSchema = z.object({
  success: z.boolean(),
  data: MovementSessionSchema,
});

export type MovementPrescription = z.infer<typeof MovementPrescriptionSchema>;
export type MovementInstance = z.infer<typeof MovementInstanceSchema>;
export type MovementSession = z.infer<typeof MovementSessionSchema>;
export type MovementPlan = z.infer<typeof MovementPlanSchema>;
export type CreateStarterPlanRequest = z.infer<typeof CreateStarterPlanRequestSchema>;
export type GetSessionRequest = z.infer<typeof GetSessionRequestSchema>;
export type CompleteSessionRequest = z.infer<typeof CompleteSessionRequestSchema>;

