/**
 * Log entry for movement engine calls
 * Used to audit all exercise selection and plan generation
 */
export interface EngineCallLog {
  /** Unique log ID */
  id: string;
  /** Timestamp in ISO 8601 format */
  timestamp: string;
  /** User ID for whom the plan was generated */
  userId: string;
  /** Type of engine operation */
  operation: 'build_starter_plan' | 'select_movements' | 'update_plan' | 'apply_regression' | 'apply_progression';
  /** Input to the movement engine */
  input: Record<string, unknown>;
  /** Output from the movement engine */
  output: Record<string, unknown>;
  /** Safety rules applied during this call */
  rulesApplied: string[];
  /** Whether Safety Brain intervened on the output */
  safetyIntervention: boolean;
  /** Duration in milliseconds */
  durationMs: number;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

