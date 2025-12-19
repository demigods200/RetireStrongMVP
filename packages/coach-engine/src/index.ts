/**
 * Coach Engine (Conversational Brain)
 * Uses Claude with RAG to provide coaching, motivation, and explanations
 * 
 * Core principles:
 * - Never invents exercises or modifies plans (Movement Engine does this)
 * - Uses RAG to ground responses in curated content
 * - All outputs pass through Safety Brain before reaching users
 * - Never provides medical diagnosis or treatment advice
 */

export {
  ChatOrchestrator,
  type ChatOrchestratorConfig,
} from './orchestrators/chat-orchestrator';

export {
  queryRag,
  queryMovementExplanations,
  type RagQueryParams,
  type RagQueryResult,
} from './tools/rag-query-tool';

export {
  COACH_SYSTEM_PROMPT,
  RAG_QUERY_INSTRUCTIONS,
} from './prompts/system-prompt';

export type {
  CoachMessage,
  CoachContext,
  CoachResponse,
  RagSource,
  ChatRequest,
  ExplainPlanRequest,
} from './types';

