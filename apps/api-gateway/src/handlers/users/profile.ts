import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
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
    // Get authorization header
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authorization header is required",
          },
        }),
      };
    }

    // Extract token (handle "Bearer <token>" format)
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

    // Decode JWT to get userId
    const decodedToken = decodeJWT(token);
    if (!decodedToken || !decodedToken.sub) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Invalid or malformed token",
          },
        }),
      };
    }

    const userId = decodedToken.sub;

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
    const region = process.env.AWS_REGION || "us-east-2";
    const userRepo = new UserRepo(usersTable, region);
    const userService = new UserService(userRepo);

    // Fetch user from DynamoDB
    const user = await userService.getUserById(userId);

    if (!user) {
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

    // Return user data (exclude sensitive information if needed)
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        data: {
          userId: user.userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          onboardingComplete: user.onboardingComplete,
          coachPersona: user.coachPersona,
          motivationProfile: user.motivationProfile,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      }),
    };
  } catch (error) {
    console.error("Get user profile error:", error);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while fetching user profile",
        },
      }),
    };
  }
};

