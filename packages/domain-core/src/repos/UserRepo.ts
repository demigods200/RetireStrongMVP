import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import type { User, CreateUserInput } from "../models/User.js";

export class UserRepo {
  private client: DynamoDBDocumentClient;
  private tableName: string;

  constructor(tableName: string, region: string = "us-east-2") {
    const dynamoClient = new DynamoDBClient({ region });
    this.client = DynamoDBDocumentClient.from(dynamoClient, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: false,
      },
      unmarshallOptions: {
        wrapNumbers: false,
      },
    });
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
    // Clean the user object to remove any undefined values before saving
    const cleanUser = this.removeUndefinedValues({
      ...user,
      updatedAt: new Date().toISOString(),
    });

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: cleanUser,
      })
    );

    return user;
  }

  // Helper to recursively remove undefined values
  private removeUndefinedValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj
        .map(item => this.removeUndefinedValues(item))
        .filter(item => item !== undefined);
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = this.removeUndefinedValues(value);
        }
      }
      return cleaned;
    }
    
    return obj;
  }

  async getUserByEmail(_email: string): Promise<User | null> {
    // Note: In production, you'd use a GSI (Global Secondary Index) for email lookup
    // For MVP, we'll implement a simple scan or add GSI later
    // This is a placeholder - will be enhanced in future steps
    throw new Error("getUserByEmail not yet implemented - use Cognito for email lookup");
  }
}

