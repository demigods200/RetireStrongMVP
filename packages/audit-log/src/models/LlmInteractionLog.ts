/**
 * Log entry for LLM interactions
 * Used to audit all calls to Claude and track token usage
 */
export interface LlmInteractionLog {
  /** Unique log ID */
  id: string;
  /** Timestamp in ISO 8601 format */
  timestamp: string;
  /** User ID associated with this interaction */
  userId: string;
  /** Type of LLM interaction */
  type: 'chat' | 'explain_plan' | 'clarify_limitations' | 'generate_engine_input';
  /** User input/query */
  userInput: string;
  /** LLM response (before Safety Brain) */
  llmResponse: string;
  /** Final output after Safety Brain filtering */
  finalOutput: string;
  /** Whether Safety Brain modified the response */
  safetyFiltered: boolean;
  /** Tools/functions called by the LLM */
  toolsCalled?: string[];
  /** Token usage stats */
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
  /** Model used */
  model: string;
  /** Duration in milliseconds */
  durationMs: number;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

