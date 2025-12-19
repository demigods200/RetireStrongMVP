/**
 * Types for coach engine (Conversational Brain)
 */

export interface CoachMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface CoachContext {
  /** User ID */
  userId: string;
  /** User's name */
  userName?: string;
  /** User age (for age-aware responses) */
  userAge?: number;
  /** User limitations */
  limitations?: string[];
  /** Current plan ID (if any) */
  currentPlanId?: string;
  /** Motivation profile */
  motivationProfile?: string;
  /** Conversation history */
  conversationHistory?: CoachMessage[];
  /** Coach Persona */
  coachPersona?: {
    name: string;
    description?: string;
    tone?: unknown;
  };
}

export interface CoachResponse {
  /** The coach's message */
  message: string;
  /** Whether this response was filtered by Safety Brain */
  safetyFiltered: boolean;
  /** Original response before filtering (if modified) */
  originalMessage?: string;
  /** RAG sources used */
  sources?: RagSource[];
  /** Suggested follow-up questions */
  suggestedFollowUps?: string[];
}

export interface RagSource {
  collection: string;
  title: string;
  excerpt: string;
}

export interface ChatRequest {
  /** User's message */
  userMessage: string;
  /** Context for the conversation */
  context: CoachContext;
  /** Whether to use RAG for this request */
  useRag?: boolean;
}

export interface ExplainPlanRequest {
  /** Plan to explain */
  plan: unknown;
  /** Context for the explanation */
  context: CoachContext;
}

