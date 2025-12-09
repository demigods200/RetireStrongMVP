import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { LoginRequestSchema } from "@retire-strong/shared-api";
import { AuthService } from "../../lib/auth";
import { UserService } from "@retire-strong/domain-core";
import { UserRepo } from "@retire-strong/domain-core";

// Helper to decode JWT token (simple base64 decode of payload)
function decodeJWT(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }
    // Decode base64 payload (add padding if needed)
    const payload = parts[1];
    if (!payload) {
      throw new Error("Invalid JWT format: missing payload");
    }
    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decoded = Buffer.from(paddedPayload, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    // Parse and validate request
    const body = JSON.parse(event.body || "{}");
    const validated = LoginRequestSchema.parse(body);

    // Initialize services
    const userPoolId = process.env.COGNITO_USER_POOL_ID || "";
    const clientId = process.env.COGNITO_CLIENT_ID || "";
    const usersTable = process.env.USERS_TABLE_NAME || process.env.DYNAMO_TABLE_USERS || "";
    // AWS_REGION is automatically set by Lambda runtime
    const region = process.env.AWS_REGION || "us-east-2";
    
    // Note: usersTable is optional for login (we can decode JWT without DB lookup)
    // But if provided, we'll use it to get onboarding status

    const authService = new AuthService(userPoolId, clientId, region);

    // Login in Cognito
    const authResult = await authService.login(validated);

    // Decode JWT ID token to get userId (sub claim)
    let userId: string | null = null;
    let onboardingComplete = false;
    
    if (authResult.idToken) {
      const decodedToken = decodeJWT(authResult.idToken);
      if (decodedToken && decodedToken.sub) {
        userId = decodedToken.sub;
        
        // Fetch user from DynamoDB to get onboarding status
        try {
          if (!userId) {
            throw new Error("userId is null");
          }
          const userRepo = new UserRepo(usersTable, region);
          const userService = new UserService(userRepo);
          const user = await userService.getUserById(userId);
          
          if (user) {
            onboardingComplete = user.onboardingComplete || false;
          }
        } catch (error) {
          // If user doesn't exist yet, onboardingComplete will remain false
          console.log("User not found in DynamoDB, onboardingComplete defaults to false");
        }
      }
    }

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
            userId: userId,
            email: validated.email,
            onboardingComplete: onboardingComplete,
          },
        },
      }),
    };
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof Error) {
      // Check for unconfirmed user
      if (
        error.message.includes("UserNotConfirmedException") ||
        error.message.includes("User is not confirmed")
      ) {
        return {
          statusCode: 403,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: {
              code: "USER_NOT_CONFIRMED",
              message: "User account is not confirmed. Please verify your email or contact support.",
            },
          }),
        };
      }

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
