import { withCORS } from "../../lib/cors";
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { AuthService } from "../../lib/auth";

interface VerifyRequest {
  email: string;
  code: string;
}

const handlerImpl: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    // Parse and validate request
    const body = JSON.parse(event.body || "{}");
    
    if (!body.email || !body.code) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Email and verification code are required",
          },
        }),
      };
    }

    const verifyRequest: VerifyRequest = {
      email: body.email,
      code: body.code,
    };

    // Initialize services
    const userPoolId = process.env.COGNITO_USER_POOL_ID || "";
    const clientId = process.env.COGNITO_CLIENT_ID || "";
    // AWS_REGION is automatically set by Lambda runtime
    const region = process.env.AWS_REGION || "us-east-2";

    const authService = new AuthService(userPoolId, clientId, region);

    // Verify the code
    await authService.verifyEmail(verifyRequest);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: true,
        data: {
          message: "Email verified successfully",
        },
      }),
    };
  } catch (error) {
    console.error("Verification error:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("CodeMismatchException") ||
        error.message.includes("ExpiredCodeException") ||
        error.message.includes("Invalid verification code")
      ) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: {
              code: "INVALID_CODE",
              message: "Invalid or expired verification code",
            },
          }),
        };
      }

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
          message: "An error occurred during verification",
        },
      }),
    };
  }
};



export const handler = withCORS(handlerImpl);
