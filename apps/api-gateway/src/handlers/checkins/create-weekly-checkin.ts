import { withCORS } from "../../lib/cors";
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { CheckinService, CheckinRepo } from "@retire-strong/domain-core";
import { z } from "zod";

/**
 * POST /checkins/weekly
 * Create a weekly check-in for broader health and motivation tracking
 */

const weeklyCheckinSchema = z.object({
  userId: z.string(),
  weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  sessionsCompletedThisWeek: z.number().int().min(0),
  sessionsPlannedThisWeek: z.number().int().min(0),
  overallDifficulty: z.enum(["too_easy", "just_right", "too_hard", "varied"]),
  feelingStronger: z.boolean().optional(),
  feelingMoreFlexible: z.boolean().optional(),
  feelingBetterBalance: z.boolean().optional(),
  overallPainLevel: z.enum(["none", "mild", "moderate", "severe"]),
  newPainOrDiscomfort: z.boolean().optional(),
  painLocations: z.array(z.string()).optional(),
  seekingMedicalAttention: z.boolean().optional(),
  overallEnergy: z.enum(["very_low", "low", "moderate", "high", "very_high"]),
  overallMood: z.enum(["poor", "fair", "good", "very_good", "excellent"]),
  sleepQuality: z.enum(["poor", "fair", "good", "excellent"]).optional(),
  motivationLevel: z.number().int().min(1).max(10).optional(),
  barriersThisWeek: z.array(z.string()).optional(),
  confidenceInContinuing: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(1000).optional(),
});

const handlerImpl: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const input = weeklyCheckinSchema.parse(body);

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

    const checkin = await checkinService.createWeeklyCheckin(input);

    console.log(`[${new Date().toISOString()}] Weekly check-in created:`, {
      userId: input.userId,
      weekStartDate: input.weekStartDate,
      adherence: `${input.sessionsCompletedThisWeek}/${input.sessionsPlannedThisWeek}`,
      overallDifficulty: input.overallDifficulty,
      overallPainLevel: input.overallPainLevel,
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
          weekStartDate: checkin.weekStartDate,
          adherenceRate: input.sessionsPlannedThisWeek > 0 
            ? input.sessionsCompletedThisWeek / input.sessionsPlannedThisWeek 
            : 0,
        },
      }),
    };
  } catch (error: any) {
    console.error("[create-weekly-checkin] Error:", error);
    
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
          message: "Failed to create weekly check-in",
          details: error.message,
        },
      }),
    };
  }
};



export const handler = withCORS(handlerImpl);
