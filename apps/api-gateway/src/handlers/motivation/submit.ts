import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { calculateMotivationProfile, pickPersona } from "@retire-strong/motivation-engine";
import { QuizSubmissionSchema, QuizResponseSchema } from "@retire-strong/shared-api";
import { UserService } from "@retire-strong/domain-core";
import { UserRepo } from "@retire-strong/domain-core";
import { ZodError } from "zod";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Request body is required",
          },
        }),
      };
    }

    const body = JSON.parse(event.body);
    console.log("Parsed request body:", JSON.stringify(body, null, 2));
    console.log("Body type check - userId type:", typeof body.userId, "answers type:", Array.isArray(body.answers) ? "array" : typeof body.answers);
    if (Array.isArray(body.answers)) {
      console.log("Answers count:", body.answers.length);
      if (body.answers.length > 0) {
        console.log("First answer sample:", JSON.stringify(body.answers[0], null, 2));
        console.log("First answer types - questionId:", typeof body.answers[0]?.questionId, "value:", typeof body.answers[0]?.value);
      }
    }
    
    const submission = QuizSubmissionSchema.parse(body);
    console.log("Validated submission:", JSON.stringify(submission, null, 2));

    // Initialize services
    const usersTable = process.env.USERS_TABLE_NAME || process.env.DYNAMO_TABLE_USERS || "";
    if (!usersTable) {
      console.error("USERS_TABLE_NAME or DYNAMO_TABLE_USERS environment variable is not set");
      console.error("Available env vars:", Object.keys(process.env).filter(k => k.includes("TABLE") || k.includes("DYNAMO")).join(", ") || "none");
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          success: false,
          error: {
            code: "CONFIGURATION_ERROR",
            message: "USERS_TABLE_NAME or DYNAMO_TABLE_USERS environment variable is not set",
            details: "Lambda is missing required environment variables. Check CloudWatch logs for available env vars.",
          },
        }),
      };
    }
    // Use AWS_REGION from Lambda runtime (automatically provided) or fall back to default
    // Note: AWS_REGION is automatically set by Lambda runtime based on deployment region
    const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-2";
    console.log("Initializing services with table:", usersTable, "region:", region);
    console.log("Environment check - AWS_REGION:", process.env.AWS_REGION, "AWS_DEFAULT_REGION:", process.env.AWS_DEFAULT_REGION);
    
    const userRepo = new UserRepo(usersTable, region);
    const userService = new UserService(userRepo);

    // Calculate motivation profile
    console.log("Calculating motivation profile for", submission.answers.length, "answers");
    let profile;
    try {
      profile = calculateMotivationProfile(submission.answers);
      console.log("Calculated profile:", JSON.stringify(profile, null, 2));
    } catch (profileError) {
      console.error("Error calculating motivation profile:", profileError);
      throw new Error(`Failed to calculate motivation profile: ${profileError instanceof Error ? profileError.message : String(profileError)}`);
    }

    // Pick persona based on profile
    console.log("Picking persona based on profile");
    let persona;
    try {
      persona = pickPersona(profile);
      console.log("Selected persona:", JSON.stringify(persona, null, 2));
    } catch (personaError) {
      console.error("Error picking persona:", personaError);
      throw new Error(`Failed to pick persona: ${personaError instanceof Error ? personaError.message : String(personaError)}`);
    }

    // Check if user exists first
    console.log("Checking if user exists:", submission.userId);
    const existingUser = await userService.getUserById(submission.userId);
    if (!existingUser) {
      console.error("User not found:", submission.userId);
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: `User with ID ${submission.userId} not found. Please complete onboarding first.`,
          },
        }),
      };
    }
    console.log("User found:", existingUser.email);

    // Save to user record
    console.log("Saving motivation profile to user:", submission.userId);
    console.log("Profile data:", JSON.stringify({
      primaryMotivator: profile.primaryMotivator,
      secondaryMotivators: profile.secondaryMotivators,
      scores: profile.scores,
    }, null, 2));
    console.log("Persona data:", JSON.stringify({
      name: persona.name,
      description: persona.description,
      tone: persona.tone,
      avatar: persona.avatar || "undefined (will be omitted)",
    }, null, 2));
    
    try {
      const profileToSave = {
        userId: submission.userId,
        motivationProfile: {
          primaryMotivator: profile.primaryMotivator,
          secondaryMotivators: profile.secondaryMotivators,
          scores: profile.scores,
        },
        coachPersona: {
          name: persona.name,
          description: persona.description,
          tone: persona.tone,
          ...(persona.avatar && { avatar: persona.avatar }),
        },
      };
      
      console.log("Calling setMotivationProfile with:", JSON.stringify(profileToSave, null, 2));
      await userService.setMotivationProfile(profileToSave);
      console.log("✅ Successfully saved motivation profile");
    } catch (saveError) {
      console.error("❌ Error saving motivation profile");
      console.error("Error type:", saveError instanceof Error ? saveError.constructor.name : typeof saveError);
      console.error("Error message:", saveError instanceof Error ? saveError.message : String(saveError));
      console.error("Error name:", saveError instanceof Error ? saveError.name : "Unknown");
      console.error("Error stack:", saveError instanceof Error ? saveError.stack : "No stack");
      
      // Log full error details
      if (saveError instanceof Error) {
        console.error("Full error object:", {
          name: saveError.name,
          message: saveError.message,
          stack: saveError.stack,
          ...(saveError as any).cause && { cause: (saveError as any).cause },
        });
      }
      
      // Check for specific AWS errors
      if (saveError instanceof Error) {
        if (saveError.message.includes("removeUndefinedValues")) {
          console.error("⚠️  DynamoDB undefined values error detected!");
          console.error("This suggests the removeUndefinedValues fix may not be applied.");
        }
        if (saveError.message.includes("ResourceNotFoundException")) {
          console.error("⚠️  DynamoDB table not found!");
          console.error("Check that USERS_TABLE_NAME is set correctly.");
        }
        if (saveError.message.includes("AccessDeniedException")) {
          console.error("⚠️  AWS credentials or permissions issue!");
        }
      }
      
      const errorMsg = saveError instanceof Error ? saveError.message : String(saveError);
      throw new Error(`Failed to save motivation profile: ${errorMsg}`);
    }

    // Build response data
    const responseData = {
      success: true,
      data: {
        profile: {
          primaryMotivator: profile.primaryMotivator,
          secondaryMotivators: profile.secondaryMotivators,
          scores: profile.scores,
        },
        persona: {
          name: persona.name,
          description: persona.description,
          tone: persona.tone,
          ...(persona.avatar && { avatar: persona.avatar }),
        },
      },
    };

    // Validate response format
    const validatedResponse = QuizResponseSchema.parse(responseData);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedResponse),
    };
  } catch (error) {
    console.error("Quiz submission error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    console.error("Error name:", error instanceof Error ? error.name : "Unknown");
    console.error("Error message:", error instanceof Error ? error.message : String(error));

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      console.error("Validation error details:", error.errors);
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.errors,
          },
        }),
      };
    }

    // Handle other errors - include full error details for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : "UnknownError";
    
    // Always include details (in production, we can filter sensitive info later)
    const errorResponse = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to process quiz submission",
        details: errorMessage,
        errorName: errorName,
        ...(errorStack && { stack: errorStack }),
      },
    };
    
    console.error("Returning error response:", JSON.stringify(errorResponse, null, 2));
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(errorResponse),
    };
  }
};

