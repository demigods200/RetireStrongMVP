import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  ExplainPlanRequestSchema,
  ExplainPlanResponseSchema,
} from "@retire-strong/shared-api";
import {
  CoachService,
  UserRepo,
  PlanRepo,
} from "@retire-strong/domain-core";

/**
 * POST /coach/explain-plan
 * Get a natural language explanation of an exercise plan
 * 
 * Flow: Coach Engine → Safety Brain → User
 */
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const input = ExplainPlanRequestSchema.parse(body);

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

    // Get plan explanation
    const result = await coachService.explainPlan({
      userId,
      planId: input.planId,
    });

    // Build response
    const response = ExplainPlanResponseSchema.parse({
      success: true,
      data: {
        explanation: result.message,
        safetyFiltered: result.safetyFiltered,
        originalExplanation: result.originalMessage,
        sources: result.sources,
        safetyReason: result.safetyReason,
        timestamp: new Date().toISOString(),
      },
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Explain plan error:", error);
    
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
          message: error instanceof Error ? error.message : "Unable to explain plan",
        },
      }),
    };
  }
};

