import { withCORS } from "../../lib/cors";
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  CreateStarterPlanRequestSchema,
  PlanResponseSchema,
} from "@retire-strong/shared-api";
import { PlanRepo, PlanService, SessionRepo, UserRepo } from "@retire-strong/domain-core";

const handlerImpl: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const input = CreateStarterPlanRequestSchema.parse(body);

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
    const planService = new PlanService(planRepo, sessionRepo, userRepo);

    const user = await userRepo.getUserById(input.userId);
    if (!user || !user.onboardingData) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: {
            code: "MISSING_ONBOARDING",
            message: "Complete onboarding before creating a plan",
          },
        }),
      };
    }

    const plan = await planService.createStarterPlan({
      userId: input.userId,
      onboardingData: user.onboardingData,
      motivationProfile: user.motivationProfile,
    });

    const response = PlanResponseSchema.parse({
      success: true,
      data: { plan },
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("starter plan error", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Unable to build plan",
        },
      }),
    };
  }
};



export const handler = withCORS(handlerImpl);
