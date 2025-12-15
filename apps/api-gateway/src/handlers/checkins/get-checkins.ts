import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { CheckinService, CheckinRepo } from "@retire-strong/domain-core";

/**
 * GET /checkins
 * Get check-in history for the authenticated user
 * 
 * Query params:
 * - userId: string (required)
 * - startDate: YYYY-MM-DD (optional)
 * - endDate: YYYY-MM-DD (optional)
 * - limit: number (optional, default 10)
 */

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const { userId, startDate, endDate, limit } = event.queryStringParameters || {};

    if (!userId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "userId is required",
          },
        }),
      };
    }

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

    let checkins;

    if (startDate && endDate) {
      checkins = await checkinService.getCheckinsInRange(userId, startDate, endDate);
    } else {
      const limitNum = limit ? parseInt(limit, 10) : 10;
      checkins = await checkinService.getRecentCheckins(userId, limitNum);
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        checkins,
        count: checkins.length,
      }),
    };
  } catch (error: any) {
    console.error("[get-checkins] Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve check-ins",
          details: error.message,
        },
      }),
    };
  }
};

