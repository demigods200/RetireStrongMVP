import { randomUUID } from 'crypto';
import type {
  RecommendationLog,
  EngineCallLog,
  LlmInteractionLog,
  SafetyInterventionLog,
} from './models';
import { DynamoWriter } from './writers/dynamo-writer';

export interface AuditLoggerConfig {
  tableName: string;
  region?: string;
}

/**
 * Main audit logger for safety-critical operations
 * 
 * Usage:
 * ```typescript
 * const logger = new AuditLogger({ tableName: 'retire-strong-logs-dev' });
 * 
 * await logger.logRecommendation({
 *   userId: 'user123',
 *   type: 'explanation',
 *   content: 'Safe explanation...',
 *   safetyModified: false,
 * });
 * ```
 */
export class AuditLogger {
  private writer: DynamoWriter;

  constructor(config: AuditLoggerConfig) {
    this.writer = new DynamoWriter(config);
  }

  /**
   * Log a coach recommendation
   */
  async logRecommendation(
    data: Omit<RecommendationLog, 'id' | 'timestamp'>
  ): Promise<void> {
    const log: RecommendationLog = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...data,
    };

    await this.writer.writeRecommendationLog(log);
  }

  /**
   * Log a movement engine call
   */
  async logEngineCall(
    data: Omit<EngineCallLog, 'id' | 'timestamp'>
  ): Promise<void> {
    const log: EngineCallLog = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...data,
    };

    await this.writer.writeEngineCallLog(log);
  }

  /**
   * Log an LLM interaction
   */
  async logLlmInteraction(
    data: Omit<LlmInteractionLog, 'id' | 'timestamp'>
  ): Promise<void> {
    const log: LlmInteractionLog = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...data,
    };

    await this.writer.writeLlmInteractionLog(log);
  }

  /**
   * Log a safety intervention
   */
  async logSafetyIntervention(
    data: Omit<SafetyInterventionLog, 'id' | 'timestamp'>
  ): Promise<void> {
    const log: SafetyInterventionLog = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...data,
    };

    await this.writer.writeSafetyInterventionLog(log);
  }
}

