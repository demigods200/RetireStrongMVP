import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { SignupRequestSchema } from "@retire-strong/shared-api";
import { AuthService } from "../../lib/auth";
import { UserService } from "@retire-strong/domain-core";
import { UserRepo } from "@retire-strong/domain-core";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    // Parse and validate request
    const body = JSON.parse(event.body || "{}");
    const validated = SignupRequestSchema.parse(body);

    // Initialize services
    const userPoolId = process.env.COGNITO_USER_POOL_ID || "";
    const clientId = process.env.COGNITO_CLIENT_ID || "";
    const usersTable = process.env.DYNAMO_TABLE_USERS || "";

    const authService = new AuthService(userPoolId, clientId);
    const userRepo = new UserRepo(usersTable);
    const userService = new UserService(userRepo);

    // Sign up in Cognito
    const cognitoResult = await authService.signUp(validated);

    // Create user in DynamoDB
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

    if (error instanceof Error) {
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

