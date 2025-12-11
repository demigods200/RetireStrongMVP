import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { GetSessionRequestSchema, GetSessionResponseSchema } from "@retire-strong/shared-api";
import { PlanRepo, SessionRepo, UserRepo } from "@retire-strong/domain-core";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const sessionId = event.pathParameters?.id || event.pathParameters?.sessionId;
    const userId = event.queryStringParameters?.userId;

    const validated = GetSessionRequestSchema.parse({ sessionId, userId });

    const usersTable = process.env.USERS_TABLE_NAME || process.env.DYNAMO_TABLE_USERS || "";
    const sessionsTable = process.env.SESSIONS_TABLE_NAME || process.env.DYNAMO_TABLE_SESSIONS || "";
    const region = process.env.AWS_REGION || "us-east-2";
    const endpoint = process.env.AWS_ENDPOINT_URL;

    if (!usersTable || !sessionsTable) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: {
            code: "CONFIGURATION_ERROR",
            message: "USERS_TABLE_NAME and SESSIONS_TABLE_NAME must be set",
          },
        }),
      };
    }

    const userRepo = new UserRepo(usersTable, region);
    const planRepo = new PlanRepo(sessionsTable, region, endpoint);
    const sessionRepo = new SessionRepo(sessionsTable, region, endpoint);

    // Ensure user exists (basic auth context placeholder)
    const user = await userRepo.getUserById(validated.userId);
    if (!user) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: { code: "USER_NOT_FOUND", message: "User not found" },
        }),
      };
    }

    const session = await sessionRepo.getSession(validated.sessionId, validated.userId);
    if (!session) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: { code: "SESSION_NOT_FOUND", message: "Session not found" },
        }),
      };
    }

    // Ensure session belongs to latest plan (basic guard)
    const latestPlan = await planRepo.getLatestPlanForUser(validated.userId);
    if (!latestPlan || session.planId !== latestPlan.planId) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: { code: "SESSION_NOT_FOUND", message: "Session not in current plan" },
        }),
      };
    }

    const response = GetSessionResponseSchema.parse({ success: true, data: session });
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("get session error", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Unable to fetch session",
        },
      }),
    };
  }
};

