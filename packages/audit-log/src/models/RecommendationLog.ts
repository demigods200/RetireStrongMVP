/**
 * Log entry for coach recommendations
 * Used to audit what the coach suggests to users
 */
export interface RecommendationLog {
  /** Unique log ID */
  id: string;
  /** Timestamp in ISO 8601 format */
  timestamp: string;
  /** User ID receiving the recommendation */
  userId: string;
  /** Type of recommendation */
  type: 'explanation' | 'motivation' | 'clarification' | 'plan_intro' | 'other';
  /** The recommendation content that was shown to the user (post Safety Brain) */
  content: string;
  /** Original content before Safety Brain filtering (if modified) */
  originalContent?: string;
  /** Whether Safety Brain modified the output */
  safetyModified: boolean;
  /** Movement IDs referenced (if any) */
  movementIds?: string[];
  /** Plan ID referenced (if any) */
  planId?: string;
  /** Session ID referenced (if any) */
  sessionId?: string;
  /** Additional context */
  metadata?: Record<string, unknown>;
}

