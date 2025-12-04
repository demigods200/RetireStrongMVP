import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { calculateMotivationProfile, pickPersona } from "@retire-strong/motivation-engine";
import { QuizSubmissionSchema, QuizResponseSchema } from "@retire-strong/shared-api";
import { UserService } from "@retire-strong/domain-core";
import { UserRepo } from "@retire-strong/domain-core";

// Initialize services (in production, use dependency injection)
const userRepo = new UserRepo(process.env.USERS_TABLE_NAME || "Users");
const userService = new UserService(userRepo);

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
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
    const submission = QuizSubmissionSchema.parse(body);

    // Calculate motivation profile
    const profile = calculateMotivationProfile(submission.answers);

    // Pick persona based on profile
    const persona = pickPersona(profile);

    // Save to user record
    await userService.setMotivationProfile({
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
        avatar: persona.avatar,
      },
    });

    const response = QuizResponseSchema.parse({
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
          avatar: persona.avatar,
        },
      },
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
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
          },
        }),
      };
    }

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to process quiz submission",
        },
      }),
    };
  }
};

