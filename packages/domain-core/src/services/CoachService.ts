import { ChatOrchestrator, type ChatRequest, type CoachContext } from "@retire-strong/coach-engine";
import { validateTextOutput, type SafetyContext } from "@retire-strong/safety-engine";
import { AuditLogger } from "@retire-strong/audit-log";
import { UserRepo } from "../repos/UserRepo.js";
import { PlanRepo } from "../repos/PlanRepo.js";

export interface CoachChatRequest {
  userId: string;
  userMessage: string;
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp?: string;
  }>;
}

export interface CoachChatResponse {
  /** The coach's message (post Safety Brain) */
  message: string;
  /** Whether Safety Brain modified the output */
  safetyFiltered: boolean;
  /** Original message before Safety Brain (if modified) */
  originalMessage?: string;
  /** RAG sources used */
  sources?: Array<{
    collection: string;
    title: string;
    excerpt: string;
  }>;
  /** Reason for safety intervention (if any) */
  safetyReason?: string;
}

export interface ExplainPlanRequest {
  userId: string;
  planId: string;
}

/**
 * CoachService orchestrates the Conversational Brain + Safety Brain flow
 * 
 * Flow: User → Coach Engine → Safety Engine → User
 * 
 * Core responsibilities:
 * - Manage LLM interactions via ChatOrchestrator
 * - Pass all outputs through Safety Brain
 * - Log all interactions and safety interventions
 * - Provide coaching, explanations, and motivation
 */
export class CoachService {
  private chatOrchestrator: ChatOrchestrator;
  private auditLogger: AuditLogger;

  constructor(
    private readonly userRepo: UserRepo,
    private readonly planRepo: PlanRepo,
    auditLogTableName: string
  ) {
    // Real AWS Bedrock integration
    this.chatOrchestrator = new ChatOrchestrator();
    this.auditLogger = new AuditLogger({ tableName: auditLogTableName });
  }

  /**
   * Process a chat message from the user
   * This is the main entry point for coach interactions
   */
  async chat(request: CoachChatRequest): Promise<CoachChatResponse> {
    const startTime = Date.now();
    const { userId, userMessage, conversationHistory = [] } = request;

    // Get user context
    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get current plan for context
    const currentPlan = await this.planRepo.getLatestPlanForUser(userId);

    // Build coach context
    const coachContext: CoachContext = {
      userId,
      userName: `${user.firstName} ${user.lastName}`,
      userAge: user.onboardingData?.demographics?.age,
      limitations: [
        ...(user.onboardingData?.healthContext?.healthConditions || []),
        ...(user.onboardingData?.healthContext?.mobilityLimitations || []),
      ],
      currentPlanId: currentPlan?.planId,
      motivationProfile: user.motivationProfile?.primaryMotivator,
      conversationHistory: conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
      coachPersona: user.coachPersona ? {
        name: user.coachPersona.name,
        description: user.coachPersona.description,
        tone: user.coachPersona.tone,
      } : undefined,
    };

    // Get response from Coach Engine (Conversational Brain)
    const chatRequest: ChatRequest = {
      userMessage,
      context: coachContext,
      useRag: true,
    };

    console.log('🔵 CoachService: About to call ChatOrchestrator.chat()');
    console.log('🔵 User message:', userMessage);

    let coachResponse;
    try {
      coachResponse = await this.chatOrchestrator.chat(chatRequest);
      console.log('🔵 CoachService: Got response from ChatOrchestrator');
      console.log('🔵 Response message length:', coachResponse?.message?.length || 0);
    } catch (error: any) {
      console.error('🔴 CoachService: ChatOrchestrator.chat() failed');
      console.error('🔴 Error:', error);
      throw error;
    }

    // Log LLM interaction
    console.log('🔵 CoachService: Logging LLM interaction to audit log');
    try {
      await this.auditLogger.logLlmInteraction({
        userId,
        type: "chat",
        userInput: userMessage,
        llmResponse: coachResponse.message,
        finalOutput: coachResponse.message, // Will be updated after safety filtering
        safetyFiltered: false,
        model: "claude-3-sonnet",
        durationMs: Date.now() - startTime,
      });
      console.log('🔵 CoachService: Audit log written');
    } catch (auditError: any) {
      console.error('🔴 CoachService: Audit logging failed (continuing anyway)');
      console.error('🔴 Audit error:', auditError.message);
      // Continue - audit logging failure shouldn't block the response
    }

    // Pass through Safety Brain
    console.log('🔵 CoachService: Running safety validation');
    const safetyContext: SafetyContext = {
      userAge: user.onboardingData?.demographics?.age,
      limitations: [
        ...(user.onboardingData?.healthContext?.healthConditions || []),
        ...(user.onboardingData?.healthContext?.mobilityLimitations || []),
      ],
    };

    const safetyResult = validateTextOutput(coachResponse.message, safetyContext);
    console.log('🔵 CoachService: Safety validation complete, action:', safetyResult.action);

    // Log safety intervention if output was modified or blocked
    if (!safetyResult.safe || safetyResult.action !== "allow") {
      try {
        await this.auditLogger.logSafetyIntervention({
          userId,
          source: "coach-engine",
          interventionType: safetyResult.action === "block" ? "block" : "modify",
          triggeredRules: safetyResult.triggeredRules,
          severity: safetyResult.severity,
          originalContent: safetyResult.originalContent,
          modifiedContent: safetyResult.safeContent,
          reason: safetyResult.reason || "Safety rules triggered",
          redFlags: safetyResult.redFlags,
          escalated: safetyResult.shouldEscalate,
        });
      } catch (auditError: any) {
        console.error('🔴 Safety intervention audit log failed:', auditError.message);
      }
    }

    // Log recommendation (final output shown to user)
    try {
      await this.auditLogger.logRecommendation({
        userId,
        type: "other",
        content: safetyResult.safeContent,
        originalContent: safetyResult.action !== "allow" ? safetyResult.originalContent : undefined,
        safetyModified: safetyResult.action !== "allow",
      });
    } catch (auditError: any) {
      console.error('🔴 Recommendation audit log failed:', auditError.message);
    }

    // Return final response
    const finalResponse = {
      message: safetyResult.safeContent,
      safetyFiltered: safetyResult.action !== "allow",
      originalMessage: safetyResult.action !== "allow" ? safetyResult.originalContent : undefined,
      sources: coachResponse.sources,
      safetyReason: safetyResult.reason,
    };

    console.log('🔵 CoachService: Returning final response');
    console.log('🔵 message length:', finalResponse.message?.length);
    console.log('🔵 safetyFiltered:', finalResponse.safetyFiltered);
    console.log('🔵 sources count:', finalResponse.sources?.length);

    return finalResponse;
  }

  /**
   * Explain a plan in natural language
   */
  async explainPlan(request: ExplainPlanRequest): Promise<CoachChatResponse> {
    const { userId, planId } = request;

    // Get user and plan
    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const plan = await this.planRepo.getPlan(planId, userId);
    if (!plan) {
      throw new Error("Plan not found");
    }

    // Build coach context
    const coachContext: CoachContext = {
      userId,
      userName: `${user.firstName} ${user.lastName}`,
      userAge: user.onboardingData?.demographics?.age,
      limitations: [
        ...(user.onboardingData?.healthContext?.healthConditions || []),
        ...(user.onboardingData?.healthContext?.mobilityLimitations || []),
      ],
      currentPlanId: planId,
      motivationProfile: user.motivationProfile?.primaryMotivator,
    };

    // Get explanation from Coach Engine
    const response = await this.chatOrchestrator.explainPlan(plan, coachContext);

    // Pass through Safety Brain
    const safetyContext: SafetyContext = {
      userAge: user.onboardingData?.demographics?.age,
      limitations: [
        ...(user.onboardingData?.healthContext?.healthConditions || []),
        ...(user.onboardingData?.healthContext?.mobilityLimitations || []),
      ],
    };

    const safetyResult = validateTextOutput(response.message, safetyContext);

    // Log safety intervention if needed
    if (safetyResult.action !== "allow") {
      await this.auditLogger.logSafetyIntervention({
        userId,
        source: "coach-engine",
        interventionType: safetyResult.action === "block" ? "block" : "modify",
        triggeredRules: safetyResult.triggeredRules,
        severity: safetyResult.severity,
        originalContent: safetyResult.originalContent,
        modifiedContent: safetyResult.safeContent,
        reason: safetyResult.reason || "Safety rules triggered",
        redFlags: safetyResult.redFlags,
        escalated: safetyResult.shouldEscalate,
      });
    }

    // Log recommendation
    await this.auditLogger.logRecommendation({
      userId,
      type: "explanation",
      content: safetyResult.safeContent,
      originalContent: safetyResult.action !== "allow" ? safetyResult.originalContent : undefined,
      safetyModified: safetyResult.action !== "allow",
      planId,
    });

    return {
      message: safetyResult.safeContent,
      safetyFiltered: safetyResult.action !== "allow",
      originalMessage: safetyResult.action !== "allow" ? safetyResult.originalContent : undefined,
      sources: response.sources,
      safetyReason: safetyResult.reason,
    };
  }
}

