import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import type { MovementPlan } from "../models/Plan.js";

export class PlanRepo {
  private client: DynamoDBDocumentClient;

  constructor(
    private tableName: string,
    region: string = "us-east-2",
    endpoint?: string
  ) {
    const dynamoClient = new DynamoDBClient({
      region,
      ...(endpoint ? { endpoint } : {}),
    });
    this.client = DynamoDBDocumentClient.from(dynamoClient, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }

  async savePlan(plan: MovementPlan): Promise<void> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          sessionId: `plan#${plan.planId}`,
          userId: plan.userId,
          itemType: "PLAN",
          plan,
          createdAt: plan.createdAt,
        },
      })
    );
  }

  async getPlan(planId: string, userId: string): Promise<MovementPlan | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          sessionId: `plan#${planId}`,
          userId,
        },
      })
    );

    const item = result.Item as { plan?: MovementPlan } | undefined;
    return item?.plan ?? null;
  }

  async getLatestPlanForUser(userId: string): Promise<MovementPlan | null> {
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
          ":itemType": "PLAN",
        },
      })
    );

    const plans =
      result.Items?.map((item) => (item as { plan: MovementPlan }).plan).filter(Boolean) || [];

    if (plans.length === 0) return null;

    return plans.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
  }
}

