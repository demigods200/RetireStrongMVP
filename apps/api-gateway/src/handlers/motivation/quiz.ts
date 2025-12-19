import { withCORS } from "../../lib/cors";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { QUIZ_QUESTIONS } from "@retire-strong/motivation-engine";
import { QuizQuestionsResponseSchema } from "@retire-strong/shared-api";

const handlerImpl: APIGatewayProxyHandlerV2 = async (_event) => {
  try {
    const response = QuizQuestionsResponseSchema.parse({
      success: true,
      data: {
        questions: QUIZ_QUESTIONS,
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
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch quiz questions",
        },
      }),
    };
  }
};



export const handler = withCORS(handlerImpl);
