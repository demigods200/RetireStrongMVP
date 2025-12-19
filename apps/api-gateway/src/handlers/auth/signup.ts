import { withCORS } from "../../lib/cors";
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { SignupRequestSchema } from "@retire-strong/shared-api";
import { AuthService } from "../../lib/auth";
import { UserService } from "@retire-strong/domain-core";
import { UserRepo } from "@retire-strong/domain-core";

const handlerImpl: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    // Parse and validate request
    const body = JSON.parse(event.body || "{}");
    const validated = SignupRequestSchema.parse(body);

    // Initialize services
    const userPoolId = process.env.COGNITO_USER_POOL_ID || "";
    const clientId = process.env.COGNITO_CLIENT_ID || "";
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

    const authService = new AuthService(userPoolId, clientId, region);
    const userRepo = new UserRepo(usersTable, region);
    const userService = new UserService(userRepo);

    // Sign up in Cognito
    const cognitoResult = await authService.signUp(validated);

    // Create user in DynamoDB
    if (!cognitoResult.userId) {
      throw new Error("Failed to create user in Cognito");
    }

    const user = await userService.createUser({
      userId: cognitoResult.userId,
      email: validated.email,
      firstName: validated.firstName,
      lastName: validated.lastName,
    });

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: true,
        data: {
          userId: user.userId,
          email: user.email,
          requiresVerification: cognitoResult.requiresVerification,
        },
      }),
    };
  } catch (error) {
    console.error("Signup error:", error);
    console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      if (error.message.includes("already exists") || error.message.includes("UsernameExistsException")) {
        return {
          statusCode: 409,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: {
              code: "USER_EXISTS",
              message: "A user with this email already exists",
            },
          }),
        };
      }

      if (error.message.includes("validation")) {
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
          message: "An error occurred during signup",
        },
      }),
    };
  }
};



export const handler = withCORS(handlerImpl);
