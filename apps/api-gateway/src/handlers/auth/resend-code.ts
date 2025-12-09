import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { AuthService } from "../../lib/auth";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    // Parse and validate request
    const body = JSON.parse(event.body || "{}");
    
    if (!body.email) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Email is required",
          },
        }),
      };
    }

    // Initialize services
    const userPoolId = process.env.COGNITO_USER_POOL_ID || "";
    const clientId = process.env.COGNITO_CLIENT_ID || "";
    // AWS_REGION is automatically set by Lambda runtime
    const region = process.env.AWS_REGION || "us-east-2";

    const authService = new AuthService(userPoolId, clientId, region);

    // Resend verification code
    const result = await authService.resendVerificationCode(body.email);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: true,
        data: result,
      }),
    };
  } catch (error) {
    console.error("Resend code error:", error);

    if (error instanceof Error) {
      if (error.message.includes("UserNotFoundException")) {
        return {
          statusCode: 404,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: {
              code: "USER_NOT_FOUND",
              message: "User not found",
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
          message: "An error occurred while resending verification code",
        },
      }),
    };
  }
};

