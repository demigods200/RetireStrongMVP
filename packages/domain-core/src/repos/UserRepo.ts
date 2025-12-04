import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import type { User, CreateUserInput } from "../models/User";

export class UserRepo {
  private client: DynamoDBDocumentClient;
  private tableName: string;

  constructor(tableName: string, region: string = "us-east-1") {
    const dynamoClient = new DynamoDBClient({ region });
    this.client = DynamoDBDocumentClient.from(dynamoClient);
    this.tableName = tableName;
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const now = new Date().toISOString();
    const user: User = {
      ...input,
      createdAt: now,
      updatedAt: now,
      onboardingComplete: false,
    };

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: user,
      })
    );

    return user;
  }

  async getUserById(userId: string): Promise<User | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { userId },
      })
    );

    return (result.Item as User) || null;
  }

  async updateUser(user: User): Promise<User> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          ...user,
          updatedAt: new Date().toISOString(),
        },
      })
    );

    return user;
  }

  async getUserByEmail(_email: string): Promise<User | null> {
    // Note: In production, you'd use a GSI (Global Secondary Index) for email lookup
    // For MVP, we'll implement a simple scan or add GSI later
    // This is a placeholder - will be enhanced in future steps
    throw new Error("getUserByEmail not yet implemented - use Cognito for email lookup");
  }
}

