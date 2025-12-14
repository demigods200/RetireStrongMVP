import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  CoachChatRequestSchema,
  CoachChatResponseSchema,
} from "@retire-strong/shared-api";
import {
  CoachService,
  UserRepo,
  PlanRepo,
} from "@retire-strong/domain-core";

/**
 * POST /coach/chat
 * Chat with the Retire Strong Coach
 * 
 * Flow: User → Coach Engine → Safety Brain → User
 */
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const input = CoachChatRequestSchema.parse(body);

    // Get userId from auth context (for now, from body - will be from JWT later)
    const userId = body.userId;
    if (!userId) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "User authentication required",
          },
        }),
      };
    }

    // Get environment variables
    const usersTable = process.env.USERS_TABLE_NAME || process.env.DYNAMO_TABLE_USERS || "";
    const sessionsTable = process.env.SESSIONS_TABLE_NAME || process.env.DYNAMO_TABLE_SESSIONS || "";
    const logsTable = process.env.LOGS_TABLE_NAME || process.env.DYNAMO_TABLE_LOGS || "";
    const region = process.env.AWS_REGION || "us-east-2";
    const endpoint = process.env.AWS_ENDPOINT_URL;

    if (!usersTable || !sessionsTable || !logsTable) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: {
            code: "CONFIGURATION_ERROR",
            message: "Required table names must be configured",
          },
        }),
      };
    }

    // Initialize repositories and service
    const userRepo = new UserRepo(usersTable, region);
    const planRepo = new PlanRepo(sessionsTable, region, endpoint);
    const coachService = new CoachService(userRepo, planRepo, logsTable);

    // Process chat request
    const result = await coachService.chat({
      userId,
      userMessage: input.userMessage,
      conversationHistory: input.conversationHistory,
    });

    console.log('🟣 Handler received result from CoachService:');
    console.log('🟣 result type:', typeof result);
    console.log('🟣 result keys:', result ? Object.keys(result) : 'null/undefined');
    console.log('🟣 result.message:', result?.message?.substring(0, 100));
    console.log('🟣 result.safetyFiltered:', result?.safetyFiltered);

    // Build response matching frontend expectations: { success: true, data: {...} }
    const responseData = CoachChatResponseSchema.parse({
      message: result.message,
      safetyFiltered: result.safetyFiltered,
      originalMessage: result.originalMessage,
      sources: result.sources,
      safetyReason: result.safetyReason,
      timestamp: new Date().toISOString(),
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        data: responseData,
      }),
    };
  } catch (error) {
    console.error("Coach chat error:", error);
    
    // Handle validation errors
    if (error && typeof error === "object" && "issues" in error) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error,
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
          message: error instanceof Error ? error.message : "Unable to process chat request",
        },
      }),
    };
  }
};

