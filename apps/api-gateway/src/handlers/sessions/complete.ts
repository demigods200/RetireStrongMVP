import { withCORS } from "../../lib/cors";
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  CompleteSessionRequestSchema,
  CompleteSessionResponseSchema,
} from "@retire-strong/shared-api";
import { PlanRepo, SessionRepo, SessionService, UserRepo } from "@retire-strong/domain-core";

const handlerImpl: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const sessionId = event.pathParameters?.id || event.pathParameters?.sessionId;
    const body = JSON.parse(event.body || "{}");
    const input = CompleteSessionRequestSchema.parse({
      ...body,
      sessionId,
    });

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
    const sessionService = new SessionService(planRepo, sessionRepo, userRepo);

    const session = await sessionService.completeSession(input.userId, {
      sessionId: input.sessionId,
      feedback: input.feedback,
    });

    const response = CompleteSessionResponseSchema.parse({ success: true, data: session });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("complete session error", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Unable to complete session",
        },
      }),
    };
  }
};



export const handler = withCORS(handlerImpl);
