import type { DropoffRiskFactors, DropoffRiskPrediction } from "./types.js";

/**
 * DropoffPredictor
 * ================
 * Simple rule-based model for predicting user drop-off risk.
 * 
 * IMPORTANT: This is a suggestion-only system. All outputs must be validated by:
 * - Movement Engine (for exercise safety)
 * - Safety Brain (for guardrail enforcement)
 * 
 * Future: Could be replaced with a real ML model, but keeping it simple and
 * deterministic for now ensures auditability.
 */
export class DropoffPredictor {
  /**
   * Predict drop-off risk based on user behavior patterns
   */
  predictDropoffRisk(factors: DropoffRiskFactors): DropoffRiskPrediction {
    const riskFactorScores: Array<{ factor: string; impact: number; description: string }> = [];
    let totalRiskScore = 0;
    let totalWeight = 0;

    // Weight: 0.25 - Adherence is a strong signal
    if (factors.adherenceRate < 0.5) {
      const impact = Math.max(0, (0.5 - factors.adherenceRate) * 2); // 0-1 scale
      riskFactorScores.push({
        factor: "low-adherence",
        impact,
        description: `Adherence rate is ${Math.round(factors.adherenceRate * 100)}% (target: 70%+)`,
      });
      totalRiskScore += impact * 0.25;
      totalWeight += 0.25;
    }

    // Weight: 0.20 - Recent behavior is predictive
    if (factors.recentSkipStreak >= 2) {
      const impact = Math.min(1, factors.recentSkipStreak / 5); // 0-1 scale
      riskFactorScores.push({
        factor: "skip-streak",
        impact,
        description: `Skipped ${factors.recentSkipStreak} sessions in a row`,
      });
      totalRiskScore += impact * 0.20;
      totalWeight += 0.20;
    }

    // Weight: 0.15 - Pain is a major barrier
    if (factors.averagePainLevel > 1.5 || factors.painTrend === "worsening") {
      const impact = factors.averagePainLevel > 2 ? 1.0 : 0.6;
      riskFactorScores.push({
        factor: "pain-barrier",
        impact,
        description: factors.painTrend === "worsening" 
          ? "Pain levels are increasing"
          : "Experiencing moderate to severe pain",
      });
      totalRiskScore += impact * 0.15;
      totalWeight += 0.15;
    }

    // Weight: 0.15 - Difficulty mismatch causes frustration
    if (factors.averageDifficulty > 3.5 || factors.difficultyTrend === "getting-harder") {
      const impact = factors.averageDifficulty > 4 ? 0.9 : 0.6;
      riskFactorScores.push({
        factor: "too-difficult",
        impact,
        description: "Sessions are too challenging",
      });
      totalRiskScore += impact * 0.15;
      totalWeight += 0.15;
    } else if (factors.averageDifficulty < 2.0 && factors.adherenceTrend === "declining") {
      const impact = 0.5;
      riskFactorScores.push({
        factor: "too-easy-boring",
        impact,
        description: "Sessions may be too easy, leading to boredom",
      });
      totalRiskScore += impact * 0.10;
      totalWeight += 0.10;
    }

    // Weight: 0.10 - Energy levels affect motivation
    if (factors.averageEnergyBefore < 2.5 || factors.energyTrend === "declining") {
      const impact = factors.averageEnergyBefore < 2.0 ? 0.8 : 0.5;
      riskFactorScores.push({
        factor: "low-energy",
        impact,
        description: "Consistently low energy before sessions",
      });
      totalRiskScore += impact * 0.10;
      totalWeight += 0.10;
    }

    // Weight: 0.10 - Engagement signals
    if (factors.lastActivityDaysAgo > 7) {
      const impact = Math.min(1, (factors.lastActivityDaysAgo - 7) / 14); // 0-1 over 21 days
      riskFactorScores.push({
        factor: "inactive-period",
        impact,
        description: `No activity for ${factors.lastActivityDaysAgo} days`,
      });
      totalRiskScore += impact * 0.10;
      totalWeight += 0.10;
    }

    // Weight: 0.05 - Declining trends are concerning
    if (factors.adherenceTrend === "declining") {
      riskFactorScores.push({
        factor: "declining-trend",
        impact: 0.6,
        description: "Adherence is trending downward",
      });
      totalRiskScore += 0.6 * 0.05;
      totalWeight += 0.05;
    }

    // Normalize risk score
    const riskScore = totalWeight > 0 ? totalRiskScore / totalWeight : 0;

    // Determine risk level
    let riskLevel: "low" | "medium" | "high" = "low";
    if (riskScore >= 0.65) {
      riskLevel = "high";
    } else if (riskScore >= 0.35) {
      riskLevel = "medium";
    }

    // Confidence is based on data completeness
    const confidence = this.calculateConfidence(factors);

    // Sort risk factors by impact
    const topRiskFactors = riskFactorScores.sort((a, b) => b.impact - a.impact).slice(0, 3);

    return {
      riskLevel,
      riskScore,
      confidence,
      factors,
      topRiskFactors,
    };
  }

  /**
   * Calculate confidence based on data availability and recency
   */
  private calculateConfidence(factors: DropoffRiskFactors): number {
    let confidence = 1.0;

    // Reduce confidence if data is stale
    if (factors.lastActivityDaysAgo > 14) {
      confidence *= 0.7;
    } else if (factors.lastActivityDaysAgo > 7) {
      confidence *= 0.9;
    }

    // Reduce confidence if adherence rate is based on very few sessions
    if (factors.adherenceRate === 0 || factors.adherenceRate === 1) {
      confidence *= 0.8; // Extremes suggest small sample
    }

    // Reduce confidence if feedback completion is low (less data)
    if (factors.feedbackCompletionRate < 0.5) {
      confidence *= 0.85;
    }

    return Math.max(0.1, confidence);
  }

  /**
   * Generate actionable recommendations based on risk prediction
   */
  generateRecommendations(prediction: DropoffRiskPrediction): string[] {
    const recommendations: string[] = [];

    for (const factor of prediction.topRiskFactors) {
      switch (factor.factor) {
        case "low-adherence":
          recommendations.push("Consider reducing session frequency or duration");
          recommendations.push("Check in with user about barriers to adherence");
          break;
        case "skip-streak":
          recommendations.push("Offer flexible scheduling options");
          recommendations.push("Send motivational reminder or check-in");
          break;
        case "pain-barrier":
          recommendations.push("Review exercises for pain-causing movements");
          recommendations.push("Suggest consulting healthcare provider");
          recommendations.push("Offer gentler regression options");
          break;
        case "too-difficult":
          recommendations.push("Regress to easier movement variations");
          recommendations.push("Reduce session duration or movement count");
          break;
        case "too-easy-boring":
          recommendations.push("Introduce progressions for challenge");
          recommendations.push("Add variety with new movement categories");
          break;
        case "low-energy":
          recommendations.push("Suggest different time of day for sessions");
          recommendations.push("Offer shorter, more manageable sessions");
          break;
        case "inactive-period":
          recommendations.push("Send gentle re-engagement message");
          recommendations.push("Offer fresh start with easier session");
          break;
        case "declining-trend":
          recommendations.push("Schedule personalized check-in");
          recommendations.push("Revisit goals and motivation");
          break;
      }
    }

    // Deduplicate and prioritize
    return Array.from(new Set(recommendations)).slice(0, 3);
  }
}

