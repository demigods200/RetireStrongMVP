/**
 * Simple Express server for local development
 * Alternative to SAM CLI for testing API Gateway handlers
 */

import express from "express";
import cors from "cors";
import { handler as quizHandler } from "./handlers/motivation/quiz.js";
import { handler as submitQuizHandler } from "./handlers/motivation/submit.js";
import { handler as healthHandler } from "./handlers/health.js";
import { handler as onboardingHandler } from "./handlers/users/onboarding.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper to convert Express request to API Gateway event
const createApiGatewayEvent = (req: express.Request): any => {
  return {
    body: req.body ? JSON.stringify(req.body) : null,
    headers: req.headers as Record<string, string>,
    httpMethod: req.method,
    path: req.path,
    pathParameters: req.params,
    queryStringParameters: req.query as Record<string, string> | undefined,
    requestContext: {
      requestId: `local-${Date.now()}`,
    },
  };
};

// Helper to convert API Gateway response to Express response
const sendApiGatewayResponse = async (
  handler: any,
  req: express.Request,
  res: express.Response
) => {
  try {
    const event = createApiGatewayEvent(req);
    const context = {}; // Empty context for local development
    const result = await handler(event, context);
    
    res.status(result.statusCode || 200);
    
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        res.setHeader(key, value as string);
      });
    }
    
    if (result.body) {
      res.send(result.body);
    } else {
      res.end();
    }
  } catch (error) {
    console.error("Handler error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "An error occurred",
      },
    });
  }
};

// Routes
app.get("/health", (req, res) => {
  sendApiGatewayResponse(healthHandler, req, res);
});

app.get("/motivation/quiz", (req, res) => {
  sendApiGatewayResponse(quizHandler, req, res);
});

app.post("/motivation/quiz/submit", (req, res) => {
  sendApiGatewayResponse(submitQuizHandler, req, res);
});

app.post("/users/onboarding", (req, res) => {
  sendApiGatewayResponse(onboardingHandler, req, res);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   GET  /motivation/quiz`);
  console.log(`   POST /motivation/quiz/submit`);
  console.log(`   POST /users/onboarding`);
});

