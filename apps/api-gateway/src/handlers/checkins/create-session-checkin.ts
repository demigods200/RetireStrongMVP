import { withCORS } from "../../lib/cors";
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { CheckinService, CheckinRepo } from "@retire-strong/domain-core";
import { z } from "zod";

/**
 * POST /checkins/session
 * Create a session check-in after completing (or skipping) a workout
 */

const sessionCheckinSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  adherence: z.enum(["completed-full", "completed-modified", "completed-partial", "skipped-planned", "skipped-unplanned"]),
  movementsCompleted: z.number().int().min(0),
  movementsTotal: z.number().int().min(1),
  difficulty: z.enum(["too_easy", "just_right", "too_hard", "varied"]),
  painLevel: z.enum(["none", "mild", "moderate", "severe"]),
  sessionDurationMinutes: z.number().int().min(1).max(180).optional(),
  difficultyNotes: z.string().max(500).optional(),
  painLocations: z.array(z.string()).optional(),
  painNotes: z.string().max(500).optional(),
  energyBefore: z.enum(["very_low", "low", "moderate", "high", "very_high"]).optional(),
  energyAfter: z.enum(["very_low", "low", "moderate", "high", "very_high"]).optional(),
  perceivedExertion: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(1000).optional(),
  enjoyed: z.boolean().optional(),
  modifications: z.array(z.object({
    movementId: z.string(),
    modificationType: z.enum(["regression", "progression", "substitution", "skip"]),
    reason: z.string(),
  })).optional(),
});

const handlerImpl: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const input = sessionCheckinSchema.parse(body);

    const checkinsTable = process.env.CHECKINS_TABLE_NAME || process.env.DYNAMO_TABLE_CHECKINS || "";
    const region = process.env.AWS_REGION || "us-east-2";

    if (!checkinsTable) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: {
            code: "CONFIGURATION_ERROR",
            message: "CHECKINS_TABLE_NAME must be set",
          },
        }),
      };
    }

    const checkinRepo = new CheckinRepo(checkinsTable, region);
    const checkinService = new CheckinService(checkinRepo);

    const checkin = await checkinService.createSessionCheckin(input);

    console.log(`[${new Date().toISOString()}] Session check-in created:`, {
      userId: input.userId,
      sessionId: input.sessionId,
      adherence: input.adherence,
      difficulty: input.difficulty,
      painLevel: input.painLevel,
    });

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        checkin: {
          checkinId: checkin.checkinId,
          date: checkin.date,
          timestamp: checkin.timestamp,
          adherence: checkin.adherence,
          difficulty: checkin.difficulty,
          painLevel: checkin.painLevel,
        },
      }),
    };
  } catch (error: any) {
    console.error("[create-session-checkin] Error:", error);
    
    if (error.name === "ZodError") {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: error.errors,
          },
        }),
      };
    }

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create session check-in",
          details: error.message,
        },
      }),
    };
  }
};



export const handler = withCORS(handlerImpl);
