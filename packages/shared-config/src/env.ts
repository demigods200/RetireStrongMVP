import { z } from "zod";

const envSchema = z.object({
  // Stage
  RETIRE_STRONG_STAGE: z.enum(["dev", "staging", "prod"]).default("dev"),

  // AWS
  AWS_REGION: z.string().default("us-east-1"),
  CDK_DEFAULT_ACCOUNT: z.string().optional(),

  // DynamoDB Tables
  DYNAMO_TABLE_USERS: z.string().optional(),
  DYNAMO_TABLE_SESSIONS: z.string().optional(),
  DYNAMO_TABLE_CHECKINS: z.string().optional(),
  DYNAMO_TABLE_LOGS: z.string().optional(),

  // S3
  S3_CONTENT_BUCKET: z.string().optional(),
  S3_ANALYTICS_BUCKET: z.string().optional(),

  // Cognito
  COGNITO_USER_POOL_ID: z.string().optional(),
  COGNITO_CLIENT_ID: z.string().optional(),

  // API
  API_GATEWAY_URL: z.string().url().optional(),

  // Bedrock
  BEDROCK_MODEL_ID: z.string().default("anthropic.claude-3-5-sonnet-20241022-v2:0"),
  BEDROCK_REGION: z.string().default("us-east-1"),

  // Vectors
  VECTORS_INDEX_NAME: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  // Node Environment
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

export function getEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  const rawEnv = process.env;
  validatedEnv = envSchema.parse(rawEnv);
  return validatedEnv;
}

export function validateEnv(): void {
  getEnv(); // This will throw if invalid
}

