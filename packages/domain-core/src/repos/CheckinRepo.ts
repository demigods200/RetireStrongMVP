import {
  DynamoDBClient,
  QueryCommand,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand as DocQueryCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { Checkin, SessionCheckin, WeeklyCheckin, AdherenceSummary } from "../models/Checkin";

/**
 * CheckinRepo
 * ===========
 * Manages persistence of check-ins (session, weekly, milestone) to DynamoDB.
 * 
 * Table schema:
 * - PK: userId (partition key)
 * - SK: date (sort key, ISO 8601 format)
 * - Additional attributes: all checkin fields
 */
export class CheckinRepo {
  private client: DynamoDBDocumentClient;
  private tableName: string;

  constructor(
    tableName: string,
    region: string = "us-east-2",
    endpoint?: string
  ) {
    const dynamoClient = new DynamoDBClient({
      region,
      ...(endpoint && { endpoint }),
    });

    this.client = DynamoDBDocumentClient.from(dynamoClient, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
      },
    });

    this.tableName = tableName;
  }

  /**
   * Save a check-in (session, weekly, or milestone)
   */
  async saveCheckin(checkin: Checkin): Promise<void> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          ...checkin,
          itemType: "CHECKIN",
        },
      })
    );
  }

  /**
   * Get a specific check-in by userId and date
   */
  async getCheckin(userId: string, date: string): Promise<Checkin | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          userId,
          date,
        },
      })
    );

    if (!result.Item) {
      return null;
    }

    const { itemType, ...checkin } = result.Item;
    return checkin as Checkin;
  }

  /**
   * Get all check-ins for a user within a date range
   */
  async getCheckinsInRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Checkin[]> {
    const result = await this.client.send(
      new DocQueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "userId = :userId AND #date BETWEEN :startDate AND :endDate",
        ExpressionAttributeNames: {
          "#date": "date",
        },
        ExpressionAttributeValues: {
          ":userId": userId,
          ":startDate": startDate,
          ":endDate": endDate,
        },
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return [];
    }

    return result.Items.map((item) => {
      const { itemType, ...checkin } = item;
      return checkin as Checkin;
    });
  }

  /**
   * Get recent check-ins for a user (last N items)
   */
  async getRecentCheckins(userId: string, limit: number = 10): Promise<Checkin[]> {
    const result = await this.client.send(
      new DocQueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
        ScanIndexForward: false, // Sort descending (newest first)
        Limit: limit,
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return [];
    }

    return result.Items.map((item) => {
      const { itemType, ...checkin } = item;
      return checkin as Checkin;
    });
  }

  /**
   * Get all session check-ins for a user in a date range
   */
  async getSessionCheckinsInRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<SessionCheckin[]> {
    const allCheckins = await this.getCheckinsInRange(userId, startDate, endDate);
    return allCheckins.filter((c): c is SessionCheckin => c.checkinType === "session");
  }

  /**
   * Get the most recent weekly check-in for a user
   */
  async getLatestWeeklyCheckin(userId: string): Promise<WeeklyCheckin | null> {
    const recentCheckins = await this.getRecentCheckins(userId, 20);
    const weeklyCheckins = recentCheckins.filter(
      (c): c is WeeklyCheckin => c.checkinType === "weekly"
    );
    return weeklyCheckins[0] || null;
  }

  /**
   * Calculate adherence summary for personalization engine
   * This aggregates check-in data to inform movement engine decisions
   */
  async calculateAdherenceSummary(
    userId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<AdherenceSummary> {
    const sessionCheckins = await this.getSessionCheckinsInRange(userId, periodStart, periodEnd);

    if (sessionCheckins.length === 0) {
      // No data, return empty summary
      return {
        userId,
        periodStart,
        periodEnd,
        sessionsCompleted: 0,
        sessionsPlanned: 0,
        adherenceRate: 0,
        averageDifficulty: 3, // Neutral
        trendingEasier: false,
        averagePainLevel: 0,
        painIncreasing: false,
        frequentPainLocations: [],
        averageEnergyBefore: 3,
        averageEnergyAfter: 3,
        frequentModifications: [],
        recentSkipStreak: 0,
        motivationTrend: "stable",
        riskScore: 0,
      };
    }

    // Calculate metrics
    const completedCount = sessionCheckins.filter((c) =>
      ["completed-full", "completed-modified", "completed-partial"].includes(c.adherence)
    ).length;
    const totalPlanned = sessionCheckins.length;
    const adherenceRate = completedCount / totalPlanned;

    // Difficulty analysis
    const difficultyMap = { too_easy: 2, just_right: 3, too_hard: 4, varied: 3 };
    const difficultyScores = sessionCheckins.map((c) => difficultyMap[c.difficulty]);
    const averageDifficulty = difficultyScores.reduce((a, b) => a + b, 0) / difficultyScores.length;
    
    // Check if trending easier (compare first half vs second half)
    const halfPoint = Math.floor(difficultyScores.length / 2);
    const firstHalf = difficultyScores.slice(0, halfPoint);
    const secondHalf = difficultyScores.slice(halfPoint);
    const trendingEasier = firstHalf.length > 0 && secondHalf.length > 0 &&
      (secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length) <
      (firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length);

    // Pain analysis
    const painMap = { none: 0, mild: 1, moderate: 2, severe: 3 };
    const painScores = sessionCheckins.map((c) => painMap[c.painLevel]);
    const averagePainLevel = painScores.reduce((a, b) => a + b, 0) / painScores.length;
    
    const painIncreasing = firstHalf.length > 0 && secondHalf.length > 0 &&
      (secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length) >
      (firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length);

    // Collect frequent pain locations
    const painLocationCounts: Record<string, number> = {};
    sessionCheckins.forEach((c) => {
      c.painLocations?.forEach((loc) => {
        painLocationCounts[loc] = (painLocationCounts[loc] || 0) + 1;
      });
    });
    const frequentPainLocations = Object.entries(painLocationCounts)
      .filter(([_, count]) => count >= 2)
      .map(([loc]) => loc);

    // Energy analysis
    const energyMap = { very_low: 1, low: 2, moderate: 3, high: 4, very_high: 5 };
    const energyBeforeScores = sessionCheckins
      .filter((c) => c.energyBefore)
      .map((c) => energyMap[c.energyBefore!]);
    const energyAfterScores = sessionCheckins
      .filter((c) => c.energyAfter)
      .map((c) => energyMap[c.energyAfter!]);
    
    const averageEnergyBefore = energyBeforeScores.length > 0
      ? energyBeforeScores.reduce((a, b) => a + b, 0) / energyBeforeScores.length
      : 3;
    const averageEnergyAfter = energyAfterScores.length > 0
      ? energyAfterScores.reduce((a, b) => a + b, 0) / energyAfterScores.length
      : 3;

    // Modification patterns
    const modificationCounts: Record<string, { movementId: string; modificationType: string; count: number }> = {};
    sessionCheckins.forEach((c) => {
      c.modifications?.forEach((mod) => {
        const key = `${mod.movementId}-${mod.modificationType}`;
        if (!modificationCounts[key]) {
          modificationCounts[key] = {
            movementId: mod.movementId,
            modificationType: mod.modificationType,
            count: 0,
          };
        }
        modificationCounts[key].count++;
      });
    });
    const frequentModifications = Object.values(modificationCounts)
      .filter((m) => m.count >= 2)
      .sort((a, b) => b.count - a.count);

    // Recent skip streak
    let recentSkipStreak = 0;
    for (let i = sessionCheckins.length - 1; i >= 0; i--) {
      if (sessionCheckins[i].adherence.startsWith("skipped")) {
        recentSkipStreak++;
      } else {
        break;
      }
    }

    // Risk score calculation (0-1, higher = higher drop-off risk)
    let riskScore = 0;
    if (adherenceRate < 0.5) riskScore += 0.3;
    if (recentSkipStreak >= 2) riskScore += 0.2;
    if (averagePainLevel > 1.5) riskScore += 0.2;
    if (averageDifficulty > 3.5) riskScore += 0.15;
    if (averageEnergyBefore < 2.5) riskScore += 0.15;
    riskScore = Math.min(riskScore, 1);

    // Motivation trend (simplified - could be enhanced with weekly checkin data)
    let motivationTrend: "increasing" | "stable" | "decreasing" = "stable";
    if (adherenceRate > 0.8 && !trendingEasier) motivationTrend = "increasing";
    if (adherenceRate < 0.5 || recentSkipStreak >= 3) motivationTrend = "decreasing";

    return {
      userId,
      periodStart,
      periodEnd,
      sessionsCompleted: completedCount,
      sessionsPlanned: totalPlanned,
      adherenceRate,
      averageDifficulty,
      trendingEasier,
      averagePainLevel,
      painIncreasing,
      frequentPainLocations,
      averageEnergyBefore,
      averageEnergyAfter,
      frequentModifications,
      recentSkipStreak,
      motivationTrend,
      riskScore,
    };
  }
}

