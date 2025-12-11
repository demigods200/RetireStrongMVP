import { z } from "zod";

export const MovementPrescriptionSchema = z.object({
  type: z.enum(["reps", "time"]),
  sets: z.number().min(1),
  reps: z.string().optional(),
  seconds: z.number().min(5).optional(),
  holdSeconds: z.number().min(5).optional(),
  restSeconds: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const ContraindicationSchema = z.object({
  condition: z.string(),
  severity: z.enum(["avoid", "caution"]),
  note: z.string(),
});

export const MovementDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  categories: z.array(z.enum(["strength", "balance", "mobility", "cardio", "core", "warmup"])),
  difficulty: z.enum(["very_easy", "easy", "moderate"]),
  joints: z.array(z.string()),
  muscles: z.array(z.string()),
  contraindications: z.array(ContraindicationSchema).default([]),
  regressions: z.array(z.string()).default([]),
  progressions: z.array(z.string()).default([]),
  time: MovementPrescriptionSchema,
  equipment: z.array(z.string()).default([]),
  cues: z.array(z.string()).default([]),
  safetyTips: z.array(z.string()).default([]),
});

export const MovementLibrarySchema = z.array(MovementDefinitionSchema);

