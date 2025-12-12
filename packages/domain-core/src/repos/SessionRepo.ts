import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import type { MovementSession } from "../models/Plan.js";

export class SessionRepo {
  private client: DynamoDBDocumentClient;

  constructor(
    private tableName: string,
    region: string = "us-east-2",
    endpoint?: string
  ) {
    // Support local DynamoDB endpoint for development
    const endpointUrl = endpoint || process.env.AWS_ENDPOINT_URL;
    const dynamoClient = new DynamoDBClient({
      region,
      ...(endpointUrl && { endpoint: endpointUrl }),
      // Use dummy credentials for local development
      ...(endpointUrl && {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || "dummy",
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "dummy",
        },
      }),
    });
    this.client = DynamoDBDocumentClient.from(dynamoClient, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }

  async saveSessions(sessions: MovementSession[]): Promise<void> {
    const requests = sessions.map((session) => ({
      PutRequest: {
        Item: {
          ...session,
          itemType: "SESSION",
        },
      },
    }));

    // BatchWrite supports 25 items max; starter plan uses 3 so we keep it simple
    await this.client.send(
      new BatchWriteCommand({
        RequestItems: {
          [this.tableName]: requests,
        },
      })
    );
  }

  async updateSession(session: MovementSession): Promise<void> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          ...session,
          itemType: "SESSION",
        },
      })
    );
  }

  async getSession(sessionId: string, userId: string): Promise<MovementSession | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          sessionId,
          userId,
        },
      })
    );

    return (result.Item as MovementSession) || null;
  }

  async listSessionsForUser(userId: string): Promise<MovementSession[]> {
    const result = await this.client.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "#userId = :userId AND #itemType = :itemType",
        ExpressionAttributeNames: {
          "#userId": "userId",
          "#itemType": "itemType",
        },
        ExpressionAttributeValues: {
          ":userId": userId,
          ":itemType": "SESSION",
        },
      })
    );

    return (result.Items as MovementSession[]) || [];
  }

  async listSessionsForPlan(planId: string, userId: string): Promise<MovementSession[]> {
    const sessions = await this.listSessionsForUser(userId);
    return sessions.filter((session) => session.planId === planId);
  }
}

