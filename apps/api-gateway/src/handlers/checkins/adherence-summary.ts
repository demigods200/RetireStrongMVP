import { withCORS } from "../../lib/cors";
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { CheckinService, CheckinRepo } from "@retire-strong/domain-core";
import { DropoffPredictor } from "@retire-strong/ml-hints";
import type { DropoffRiskFactors } from "@retire-strong/ml-hints";

/**
 * GET /checkins/adherence-summary
 * Get adherence summary and drop-off risk analysis
 * 
 * Query params:
 * - userId: string (required)
 * - days: number (optional, default 30)
 */

const handlerImpl: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const { userId, days: daysParam } = event.queryStringParameters || {};

    if (!userId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "userId is required",
          },
        }),
      };
    }

    const days = daysParam ? parseInt(daysParam, 10) : 30;

    const checkinsTable = process.env.CHECKINS_TABLE_NAME || process.env.DYNAMO_TABLE_CHECKINS || "";
    const region = process.env.AWS_REGION || "us-east-2";

    if (!checkinsTable) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: {
            code: "CONFIGURATION_ERROR",
            message: "CHECKINS_TABLE_NAME must be set",
          },
        }),
      };
    }

    const checkinRepo = new CheckinRepo(checkinsTable, region);
    const checkinService = new CheckinService(checkinRepo);

    // Get adherence summary
    const summary = await checkinService.getRecentAdherenceSummary(userId, days);

    // Get drop-off risk analysis
    const dropoffAnalysis = await checkinService.analyzeDropoffRisk(userId);

    // Optional: Get ML-based risk prediction (if ML hints available)
    const dropoffPredictor = new DropoffPredictor();
    const mlRiskFactors: DropoffRiskFactors = {
      recentSkipStreak: summary.recentSkipStreak,
      adherenceRate: summary.adherenceRate,
      adherenceTrend: summary.motivationTrend === "increasing" ? "improving" : 
                      summary.motivationTrend === "decreasing" ? "declining" : "stable",
      averageDifficulty: summary.averageDifficulty,
      difficultyTrend: summary.trendingEasier ? "getting-easier" : "stable",
      averagePainLevel: summary.averagePainLevel,
      painTrend: summary.painIncreasing ? "worsening" : "stable",
      frequentPainLocations: summary.frequentPainLocations,
      averageEnergyBefore: summary.averageEnergyBefore,
      energyTrend: "stable", // Would need more history to determine
      sessionDurationTrend: "stable",
      feedbackCompletionRate: 1.0, // Assuming all check-ins have feedback
      lastActivityDaysAgo: 0, // Would need to calculate from last session
    };

    const mlPrediction = dropoffPredictor.predictDropoffRisk(mlRiskFactors);
    const mlRecommendations = dropoffPredictor.generateRecommendations(mlPrediction);

    console.log(`[${new Date().toISOString()}] Adherence summary retrieved:`, {
      userId,
      adherenceRate: summary.adherenceRate,
      riskLevel: dropoffAnalysis.riskLevel,
      mlRiskScore: mlPrediction.riskScore,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        summary: {
          periodStart: summary.periodStart,
          periodEnd: summary.periodEnd,
          sessionsCompleted: summary.sessionsCompleted,
          sessionsPlanned: summary.sessionsPlanned,
          adherenceRate: summary.adherenceRate,
          averageDifficulty: summary.averageDifficulty,
          trendingEasier: summary.trendingEasier,
          averagePainLevel: summary.averagePainLevel,
          painIncreasing: summary.painIncreasing,
          frequentPainLocations: summary.frequentPainLocations,
          averageEnergyBefore: summary.averageEnergyBefore,
          averageEnergyAfter: summary.averageEnergyAfter,
          recentSkipStreak: summary.recentSkipStreak,
          motivationTrend: summary.motivationTrend,
        },
        dropoffRisk: {
          riskLevel: dropoffAnalysis.riskLevel,
          riskScore: dropoffAnalysis.riskScore,
          factors: dropoffAnalysis.factors,
          recommendations: dropoffAnalysis.recommendations,
        },
        mlInsights: {
          riskLevel: mlPrediction.riskLevel,
          riskScore: mlPrediction.riskScore,
          confidence: mlPrediction.confidence,
          topRiskFactors: mlPrediction.topRiskFactors,
          recommendations: mlRecommendations,
        },
      }),
    };
  } catch (error: any) {
    console.error("[adherence-summary] Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve adherence summary",
          details: error.message,
        },
      }),
    };
  }
};



export const handler = withCORS(handlerImpl);
