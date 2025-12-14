import { z } from "zod";

/**
 * Schema for a coach message
 */
export const CoachMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1, "Message content is required"),
  timestamp: z.string().optional(),
});

export type CoachMessage = z.infer<typeof CoachMessageSchema>;

/**
 * Schema for RAG source
 */
export const RagSourceSchema = z.object({
  collection: z.string(),
  title: z.string(),
  excerpt: z.string(),
});

export type RagSource = z.infer<typeof RagSourceSchema>;

/**
 * POST /coach/chat request schema
 */
export const CoachChatRequestSchema = z.object({
  userMessage: z.string().min(1, "Message is required").max(2000, "Message too long"),
  conversationHistory: z.array(CoachMessageSchema).optional(),
});

export type CoachChatRequest = z.infer<typeof CoachChatRequestSchema>;

/**
 * POST /coach/chat response schema
 */
export const CoachChatResponseSchema = z.object({
  message: z.string(),
  safetyFiltered: z.boolean(),
  originalMessage: z.string().optional(),
  sources: z.array(RagSourceSchema).optional(),
  safetyReason: z.string().optional(),
  timestamp: z.string(),
});

export type CoachChatResponse = z.infer<typeof CoachChatResponseSchema>;

/**
 * POST /coach/explain-plan request schema
 */
export const ExplainPlanRequestSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
});

export type ExplainPlanRequest = z.infer<typeof ExplainPlanRequestSchema>;

/**
 * POST /coach/explain-plan response schema
 */
export const ExplainPlanResponseSchema = z.object({
  explanation: z.string(),
  safetyFiltered: z.boolean(),
  originalExplanation: z.string().optional(),
  sources: z.array(RagSourceSchema).optional(),
  safetyReason: z.string().optional(),
  timestamp: z.string(),
});

export type ExplainPlanResponse = z.infer<typeof ExplainPlanResponseSchema>;

