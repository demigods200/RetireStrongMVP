import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import type {
  RecommendationLog,
  EngineCallLog,
  LlmInteractionLog,
  SafetyInterventionLog,
} from '../models';

export interface DynamoWriterConfig {
  tableName: string;
  region?: string;
}

/**
 * Writes audit logs to DynamoDB
 * All logs go to the same table (retire-strong-logs-{env})
 * with different type prefixes for partitioning
 */
export class DynamoWriter {
  private client: DynamoDBDocumentClient;
  private tableName: string;

  constructor(config: DynamoWriterConfig) {
    const dynamoClient = new DynamoDBClient({
      region: config.region || process.env.AWS_REGION || 'us-east-2',
    });
    this.client = DynamoDBDocumentClient.from(dynamoClient);
    this.tableName = config.tableName;
  }

  /**
   * Write a recommendation log entry
   */
  async writeRecommendationLog(log: RecommendationLog): Promise<void> {
    await this.writeLog('recommendation', log);
  }

  /**
   * Write an engine call log entry
   */
  async writeEngineCallLog(log: EngineCallLog): Promise<void> {
    await this.writeLog('engine-call', log);
  }

  /**
   * Write an LLM interaction log entry
   */
  async writeLlmInteractionLog(log: LlmInteractionLog): Promise<void> {
    await this.writeLog('llm-interaction', log);
  }

  /**
   * Write a safety intervention log entry
   */
  async writeSafetyInterventionLog(log: SafetyInterventionLog): Promise<void> {
    await this.writeLog('safety-intervention', log);
  }

  /**
   * Generic write method for all log types
   */
  private async writeLog(
    type: 'recommendation' | 'engine-call' | 'llm-interaction' | 'safety-intervention',
    log: RecommendationLog | EngineCallLog | LlmInteractionLog | SafetyInterventionLog
  ): Promise<void> {
    try {
      const command = new PutCommand({
        TableName: this.tableName,
        Item: {
          pk: `LOG#${type}#${log.id}`,
          sk: log.timestamp,
          type,
          ...log,
        },
      });

      await this.client.send(command);
    } catch (error) {
      // Log write failures should not break the application
      // In production, consider sending to a dead-letter queue
      console.error(`Failed to write ${type} log:`, error);
    }
  }
}

