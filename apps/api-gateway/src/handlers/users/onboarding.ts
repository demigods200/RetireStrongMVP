import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { OnboardingRequestSchema } from "@retire-strong/shared-api";
import { UserService } from "@retire-strong/domain-core";
import { UserRepo } from "@retire-strong/domain-core";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    // Parse and validate request
    const body = JSON.parse(event.body || "{}");
    const validated = OnboardingRequestSchema.parse(body);

    // Initialize services
    const usersTable = process.env.USERS_TABLE_NAME || process.env.DYNAMO_TABLE_USERS || "";
    if (!usersTable) {
      console.error("USERS_TABLE_NAME or DYNAMO_TABLE_USERS environment variable is not set");
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: {
            code: "CONFIGURATION_ERROR",
            message: "USERS_TABLE_NAME or DYNAMO_TABLE_USERS environment variable is not set",
          },
        }),
      };
    }
    // AWS_REGION is automatically set by Lambda runtime
    const region = process.env.AWS_REGION || "us-east-2";
    const userRepo = new UserRepo(usersTable, region);
    const userService = new UserService(userRepo);

    // Complete onboarding
    const user = await userService.completeOnboarding({
      userId: validated.userId,
      onboardingData: validated.onboardingData,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: true,
        data: {
          userId: user.userId,
          onboardingComplete: user.onboardingComplete,
          onboardingData: user.onboardingData, // Include onboarding data in response
        },
      }),
    };
  } catch (error) {
    console.error("Onboarding error:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return {
          statusCode: 404,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: {
              code: "USER_NOT_FOUND",
              message: error.message,
            },
          }),
        };
      }

      if (error.message.includes("validation") || error.message.includes("Missing")) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: error.message,
            },
          }),
        };
      }
    }

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred during onboarding",
        },
      }),
    };
  }
};

