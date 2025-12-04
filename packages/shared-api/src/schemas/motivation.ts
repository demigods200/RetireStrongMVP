import { z } from "zod";

export const QuizAnswerSchema = z.object({
  questionId: z.string(),
  value: z.number().min(1).max(5),
});

export const QuizSubmissionSchema = z.object({
  userId: z.string(),
  answers: z.array(QuizAnswerSchema).min(10).max(15),
});

export const MotivationProfileSchema = z.object({
  primaryMotivator: z.string(),
  secondaryMotivators: z.array(z.string()),
  scores: z.record(z.string(), z.number()),
});

export const ToneConfigSchema = z.object({
  formality: z.enum(["casual", "professional", "warm"]),
  encouragement: z.enum(["gentle", "moderate", "energetic"]),
  directness: z.enum(["subtle", "balanced", "direct"]),
  humor: z.enum(["none", "light", "moderate"]),
});

export const CoachPersonaSchema = z.object({
  name: z.string(),
  description: z.string(),
  tone: ToneConfigSchema,
  avatar: z.string().optional(),
});

export const QuizResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    profile: MotivationProfileSchema,
    persona: CoachPersonaSchema,
  }),
});

export const QuizQuestionsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    questions: z.array(
      z.object({
        id: z.string(),
        text: z.string(),
        category: z.string(),
        options: z.array(
          z.object({
            value: z.number(),
            label: z.string(),
          })
        ),
      })
    ),
  }),
});

export type QuizAnswer = z.infer<typeof QuizAnswerSchema>;
export type QuizSubmission = z.infer<typeof QuizSubmissionSchema>;
export type MotivationProfile = z.infer<typeof MotivationProfileSchema>;
export type CoachPersona = z.infer<typeof CoachPersonaSchema>;
export type ToneConfig = z.infer<typeof ToneConfigSchema>;

