/**
 * Simple Express server for local development
 * Alternative to SAM CLI for testing API Gateway handlers
 */

// Load environment variables from .env file
import "dotenv/config";

import express from "express";
import cors from "cors";
import { join } from "path";
import { loadSeedContent } from "@retire-strong/content-rag";
import { handler as quizHandler } from "./handlers/motivation/quiz.js";
import { handler as submitQuizHandler } from "./handlers/motivation/submit.js";
import { handler as healthHandler } from "./handlers/health.js";
import { handler as onboardingHandler } from "./handlers/users/onboarding.js";
import { handler as profileHandler } from "./handlers/users/profile.js";
import { handler as starterPlanHandler } from "./handlers/plans/starter.js";
import { handler as currentPlanHandler } from "./handlers/plans/current.js";
import { handler as getSessionHandler } from "./handlers/sessions/get.js";
import { handler as completeSessionHandler } from "./handlers/sessions/complete.js";
import { handler as signupHandler } from "./handlers/auth/signup.js";
import { handler as loginHandler } from "./handlers/auth/login.js";
import { handler as verifyHandler } from "./handlers/auth/verify.js";
import { handler as resendCodeHandler } from "./handlers/auth/resend-code.js";
import { handler as coachChatHandler } from "./handlers/coach/chat.js";
import { handler as coachExplainPlanHandler } from "./handlers/coach/explain-plan.js";
// M4 checkin handlers temporarily disabled - ml-hints package not ready yet
// import { handler as createSessionCheckinHandler } from "./handlers/checkins/create-session-checkin.js";
// import { handler as createWeeklyCheckinHandler } from "./handlers/checkins/create-weekly-checkin.js";
// import { handler as getCheckinsHandler } from "./handlers/checkins/get-checkins.js";
// import { handler as getAdherenceSummaryHandler } from "./handlers/checkins/adherence-summary.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper to convert Express request to API Gateway event
const createApiGatewayEvent = (req: express.Request): any => {
  // Normalize headers - Express lowercases headers, but API Gateway expects specific casing
  // Convert all headers to a format that matches API Gateway expectations
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') {
      headers[key] = value;
      // Also add common variations for case-insensitive matching
      if (key.toLowerCase() === 'authorization') {
        headers['Authorization'] = value;
        headers['authorization'] = value;
      }
    } else if (Array.isArray(value) && value.length > 0) {
      const firstValue = value[0];
      if (firstValue) {
        headers[key] = firstValue;
      }
    }
  }

  return {
    body: req.body ? JSON.stringify(req.body) : null,
    headers: headers,
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
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  // Log incoming request
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path} [${requestId}]`);
  console.log(`Request body:`, req.body ? JSON.stringify(req.body, null, 2) : "empty");
  
  try {
    const event = createApiGatewayEvent(req);
    const context = {}; // Empty context for local development
    const result = await handler(event, context);
    
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Response: ${result.statusCode || 200} (${duration}ms)`);
    
    if (result.body) {
      try {
        const bodyData = JSON.parse(result.body);
        if (!bodyData.success) {
          console.error(`[${requestId}] Error response:`, JSON.stringify(bodyData, null, 2));
        } else {
          console.log(`[${requestId}] Success response`);
        }
      } catch {
        // Not JSON, skip logging
      }
    }
    
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
    const duration = Date.now() - startTime;
    console.error(`\n[${requestId}] ❌ ERROR after ${duration}ms`);
    console.error(`[${requestId}] Error type:`, error instanceof Error ? error.constructor.name : typeof error);
    console.error(`[${requestId}] Error message:`, error instanceof Error ? error.message : String(error));
    console.error(`[${requestId}] Error name:`, error instanceof Error ? error.name : "Unknown");
    console.error(`[${requestId}] Error stack:`, error instanceof Error ? error.stack : "No stack");
    
    // Log full error object if available
    if (error instanceof Error) {
      console.error(`[${requestId}] Full error object:`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error as any).cause && { cause: (error as any).cause },
      });
    } else {
      console.error(`[${requestId}] Error value:`, error);
    }
    
    // If the handler already returned an error response, use it
    // Otherwise, create a generic error response
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "An error occurred",
        details: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.name : "UnknownError",
        requestId: requestId,
        ...(error instanceof Error && error.stack && { stack: error.stack }),
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

app.get("/users/me", (req, res) => {
  sendApiGatewayResponse(profileHandler, req, res);
});

app.post("/auth/signup", (req, res) => {
  sendApiGatewayResponse(signupHandler, req, res);
});

app.post("/auth/login", (req, res) => {
  sendApiGatewayResponse(loginHandler, req, res);
});

app.post("/auth/verify", (req, res) => {
  sendApiGatewayResponse(verifyHandler, req, res);
});

app.post("/auth/resend-code", (req, res) => {
  sendApiGatewayResponse(resendCodeHandler, req, res);
});

app.post("/plans/starter", (req, res) => {
  sendApiGatewayResponse(starterPlanHandler, req, res);
});

app.get("/plans/current", (req, res) => {
  sendApiGatewayResponse(currentPlanHandler, req, res);
});

app.get("/sessions/:id", (req, res) => {
  sendApiGatewayResponse(getSessionHandler, req, res);
});

app.post("/sessions/:id/complete", (req, res) => {
  sendApiGatewayResponse(completeSessionHandler, req, res);
});

app.post("/coach/chat", (req, res) => {
  sendApiGatewayResponse(coachChatHandler, req, res);
});

app.post("/coach/explain-plan", (req, res) => {
  sendApiGatewayResponse(coachExplainPlanHandler, req, res);
});

// M4 checkin routes temporarily disabled
// app.post("/checkins/session", (req, res) => {
//   sendApiGatewayResponse(createSessionCheckinHandler, req, res);
// });

// app.post("/checkins/weekly", (req, res) => {
//   sendApiGatewayResponse(createWeeklyCheckinHandler, req, res);
// });

// app.get("/checkins", (req, res) => {
//   sendApiGatewayResponse(getCheckinsHandler, req, res);
// });

// app.get("/checkins/adherence-summary", (req, res) => {
//   sendApiGatewayResponse(getAdherenceSummaryHandler, req, res);
// });

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   POST /auth/signup`);
  console.log(`   POST /auth/login`);
  console.log(`   POST /auth/verify`);
  console.log(`   POST /auth/resend-code`);
  console.log(`   GET  /motivation/quiz`);
  console.log(`   POST /motivation/quiz/submit`);
  console.log(`   POST /users/onboarding`);
  console.log(`   GET  /users/me`);
  console.log(`   POST /plans/starter`);
  console.log(`   GET  /plans/current`);
  console.log(`   GET  /sessions/:id`);
  console.log(`   POST /sessions/:id/complete`);
  console.log(`   POST /coach/chat`);
  console.log(`   POST /coach/explain-plan`);
  // M4 checkin routes temporarily disabled
  // console.log(`   POST /checkins/session`);
  // console.log(`   POST /checkins/weekly`);
  // console.log(`   GET  /checkins`);
  // console.log(`   GET  /checkins/adherence-summary`);
  
  // Log configuration status
  const usersTable = process.env.USERS_TABLE_NAME || process.env.DYNAMO_TABLE_USERS;
  const sessionsTable = process.env.SESSIONS_TABLE_NAME || process.env.DYNAMO_TABLE_SESSIONS;
  console.log(`\n📝 Configuration:`);
  console.log(`   USERS_TABLE_NAME: ${process.env.USERS_TABLE_NAME || "❌ NOT SET"}`);
  console.log(`   DYNAMO_TABLE_USERS: ${process.env.DYNAMO_TABLE_USERS || "❌ NOT SET (fallback)"}`);
  console.log(`   Using users table: ${usersTable || "❌ NOT SET"}`);
  console.log(`   SESSIONS_TABLE_NAME: ${process.env.SESSIONS_TABLE_NAME || "❌ NOT SET"}`);
  console.log(`   DYNAMO_TABLE_SESSIONS: ${process.env.DYNAMO_TABLE_SESSIONS || "❌ NOT SET (fallback)"}`);
  console.log(`   Using sessions table: ${sessionsTable || "❌ NOT SET"}`);
  console.log(`   AWS_REGION: ${process.env.AWS_REGION || "us-east-2 (default)"}`);
  if (!usersTable) {
    console.log(`\n⚠️  Warning: USERS_TABLE_NAME or DYNAMO_TABLE_USERS is not set. Create a .env file in apps/api-gateway/ with:`);
    console.log(`   USERS_TABLE_NAME=retire-strong-users-dev`);
    console.log(`   (or DYNAMO_TABLE_USERS=retire-strong-users-dev)`);
    console.log(`   See ENV_SETUP.md for details.`);
  }
  if (!sessionsTable) {
    console.log(`\n⚠️  Warning: SESSIONS_TABLE_NAME or DYNAMO_TABLE_SESSIONS is not set. Add to .env in apps/api-gateway/:`);
    console.log(`   SESSIONS_TABLE_NAME=retire-strong-sessions-dev`);
    console.log(`   (or DYNAMO_TABLE_SESSIONS=retire-strong-sessions-dev)`);
  }

  // Load RAG seed content
  console.log('\n');
  try {
    // Path to content/seed in the monorepo root
    const contentPath = join(process.cwd(), '..', '..', 'content', 'seed');
    await loadSeedContent({ contentPath, verbose: true });
  } catch (error) {
    console.error('❌ Failed to load RAG content:', error);
    console.error('   Coach will still work but without grounded context');
  }
});

