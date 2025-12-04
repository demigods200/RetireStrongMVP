import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { LoginRequestSchema } from "@retire-strong/shared-api";
import { AuthService } from "../../lib/auth";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    // Parse and validate request
    const body = JSON.parse(event.body || "{}");
    const validated = LoginRequestSchema.parse(body);

    // Initialize services
    const userPoolId = process.env.COGNITO_USER_POOL_ID || "";
    const clientId = process.env.COGNITO_CLIENT_ID || "";

    const authService = new AuthService(userPoolId, clientId);

    // Login in Cognito
    const authResult = await authService.login(validated);

    // For MVP: Return basic user info
    // In production, decode JWT ID token to get userId (sub claim) and fetch full user from DynamoDB
    // For now, we'll return email and let frontend handle user lookup if needed
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: true,
        data: {
          accessToken: authResult.accessToken,
          refreshToken: authResult.refreshToken,
          expiresIn: authResult.expiresIn,
          idToken: authResult.idToken,
          user: {
            email: validated.email,
            // userId and other fields will be decoded from JWT in production
          },
        },
      }),
    };
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("NotAuthorizedException") ||
        error.message.includes("UserNotFoundException") ||
        error.message.includes("Incorrect username or password")
      ) {
        return {
          statusCode: 401,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: {
              code: "INVALID_CREDENTIALS",
              message: "Invalid email or password",
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
          message: "An error occurred during login",
        },
      }),
    };
  }
};
