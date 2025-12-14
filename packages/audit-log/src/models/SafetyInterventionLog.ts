/**
 * Log entry for Safety Brain interventions
 * Used to track when Safety Brain blocks or modifies outputs
 */
export interface SafetyInterventionLog {
  /** Unique log ID */
  id: string;
  /** Timestamp in ISO 8601 format */
  timestamp: string;
  /** User ID (if applicable) */
  userId?: string;
  /** Source that triggered the intervention */
  source: 'coach-engine' | 'movement-engine' | 'api-handler';
  /** Type of intervention */
  interventionType: 'block' | 'modify' | 'escalate' | 'warn';
  /** Safety rules that triggered the intervention */
  triggeredRules: string[];
  /** Severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Original content that was flagged */
  originalContent: string;
  /** Modified/replacement content (if applicable) */
  modifiedContent?: string;
  /** Reason for intervention */
  reason: string;
  /** Red flags detected */
  redFlags: string[];
  /** Whether this was escalated for human review */
  escalated: boolean;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

