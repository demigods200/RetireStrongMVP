import type { EngagementSignals, PersonalizationHint } from "./types.js";

/**
 * EngagementAnalyzer
 * ==================
 * Analyzes user engagement patterns to provide personalization hints.
 * 
 * These are soft suggestions that can improve user experience but are NOT
 * safety-critical. All suggestions must still pass through Movement Engine
 * and Safety Brain validation.
 */
export class EngagementAnalyzer {
  /**
   * Generate personalization hints based on engagement signals
   */
  generatePersonalizationHints(signals: EngagementSignals): PersonalizationHint[] {
    const hints: PersonalizationHint[] = [];

    // Time of day optimization
    if (signals.timeOfDayPreference) {
      hints.push({
        hintType: "timing",
        suggestion: `Schedule sessions in the ${signals.timeOfDayPreference}`,
        reasoning: `User shows best adherence during ${signals.timeOfDayPreference} sessions`,
        confidence: 0.75,
        priority: "medium",
      });
    }

    // Session duration optimization
    if (signals.sessionDurationPreference && signals.sessionDurationPreference < 20) {
      hints.push({
        hintType: "duration",
        suggestion: `Keep sessions under ${signals.sessionDurationPreference} minutes`,
        reasoning: "User prefers shorter, focused sessions",
        confidence: 0.8,
        priority: "high",
      });
    }

    // Content personalization - favorites
    if (signals.favoriteMovementCategories && signals.favoriteMovementCategories.length > 0) {
      hints.push({
        hintType: "content",
        suggestion: `Include more ${signals.favoriteMovementCategories.join(", ")} movements`,
        reasoning: "User shows high engagement with these movement types",
        confidence: 0.7,
        priority: "medium",
      });
    }

    // Content personalization - avoid least favorites
    if (signals.leastFavoriteMovementCategories && signals.leastFavoriteMovementCategories.length > 0) {
      hints.push({
        hintType: "content",
        suggestion: `Minimize ${signals.leastFavoriteMovementCategories.join(", ")} movements when possible`,
        reasoning: "User shows lower engagement with these movement types",
        confidence: 0.65,
        priority: "low",
      });
    }

    // Frequency optimization
    if (signals.optimalRestDays) {
      hints.push({
        hintType: "frequency",
        suggestion: `Schedule ${signals.optimalRestDays} rest days between sessions`,
        reasoning: "User adheres best with this rest pattern",
        confidence: 0.7,
        priority: "medium",
      });
    }

    // Day of week preference
    if (signals.bestDayOfWeek && signals.bestDayOfWeek.length > 0) {
      hints.push({
        hintType: "timing",
        suggestion: `Prioritize sessions on ${signals.bestDayOfWeek.join(", ")}`,
        reasoning: "User has highest completion rate on these days",
        confidence: 0.75,
        priority: "medium",
      });
    }

    return hints.sort((a, b) => {
      // Sort by priority and confidence
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });
  }

  /**
   * Detect engagement patterns from historical data
   * This is a simplified pattern detection - could be enhanced with real ML
   */
  detectEngagementPatterns(sessionHistory: Array<{
    date: string;
    completed: boolean;
    timeOfDay?: string;
    durationMinutes?: number;
    movementCategories?: string[];
    enjoyed?: boolean;
  }>): EngagementSignals {
    const signals: EngagementSignals = {
      userId: "detected", // Would come from input
    };

    // Time of day analysis
    const timeOfDayCompletions: Record<string, { completed: number; total: number }> = {
      morning: { completed: 0, total: 0 },
      afternoon: { completed: 0, total: 0 },
      evening: { completed: 0, total: 0 },
    };

    for (const session of sessionHistory) {
      if (session.timeOfDay && timeOfDayCompletions[session.timeOfDay]) {
        timeOfDayCompletions[session.timeOfDay].total++;
        if (session.completed) {
          timeOfDayCompletions[session.timeOfDay].completed++;
        }
      }
    }

    // Find best time of day (highest completion rate with min 3 sessions)
    let bestTime: string | undefined;
    let bestRate = 0;
    for (const [time, stats] of Object.entries(timeOfDayCompletions)) {
      if (stats.total >= 3) {
        const rate = stats.completed / stats.total;
        if (rate > bestRate) {
          bestRate = rate;
          bestTime = time as "morning" | "afternoon" | "evening";
        }
      }
    }
    signals.timeOfDayPreference = bestTime as any;

    // Session duration analysis
    const completedDurations = sessionHistory
      .filter((s) => s.completed && s.durationMinutes)
      .map((s) => s.durationMinutes!);
    
    if (completedDurations.length >= 3) {
      const avgDuration = completedDurations.reduce((a, b) => a + b, 0) / completedDurations.length;
      signals.sessionDurationPreference = Math.round(avgDuration);
    }

    // Movement category preferences
    const categoryEnjoyment: Record<string, { enjoyed: number; total: number }> = {};
    
    for (const session of sessionHistory) {
      if (session.movementCategories && session.enjoyed !== undefined) {
        for (const category of session.movementCategories) {
          if (!categoryEnjoyment[category]) {
            categoryEnjoyment[category] = { enjoyed: 0, total: 0 };
          }
          categoryEnjoyment[category].total++;
          if (session.enjoyed) {
            categoryEnjoyment[category].enjoyed++;
          }
        }
      }
    }

    // Find top 2 favorite categories
    const sortedCategories = Object.entries(categoryEnjoyment)
      .filter(([_, stats]) => stats.total >= 2)
      .map(([cat, stats]) => ({ category: cat, rate: stats.enjoyed / stats.total }))
      .sort((a, b) => b.rate - a.rate);
    
    if (sortedCategories.length > 0 && sortedCategories[0].rate > 0.6) {
      signals.favoriteMovementCategories = sortedCategories.slice(0, 2).map((c) => c.category);
    }

    // Find least favorite (low enjoyment rate)
    const leastFavorite = sortedCategories.filter((c) => c.rate < 0.4).map((c) => c.category);
    if (leastFavorite.length > 0) {
      signals.leastFavoriteMovementCategories = leastFavorite;
    }

    // Day of week analysis
    const dayCompletions: Record<string, { completed: number; total: number }> = {};
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    for (const session of sessionHistory) {
      const dayOfWeek = dayNames[new Date(session.date).getDay()];
      if (!dayCompletions[dayOfWeek]) {
        dayCompletions[dayOfWeek] = { completed: 0, total: 0 };
      }
      dayCompletions[dayOfWeek].total++;
      if (session.completed) {
        dayCompletions[dayOfWeek].completed++;
      }
    }

    const bestDays = Object.entries(dayCompletions)
      .filter(([_, stats]) => stats.total >= 2 && stats.completed / stats.total > 0.7)
      .map(([day]) => day);
    
    if (bestDays.length > 0) {
      signals.bestDayOfWeek = bestDays;
    }

    return signals;
  }
}

