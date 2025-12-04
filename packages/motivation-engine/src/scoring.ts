/**
 * Motivation Scoring Logic
 * Maps quiz answers to MotivationProfile
 */

import type { QuizAnswer, MotivationProfile, MotivatorType } from "./types.js";
import { QUIZ_QUESTIONS } from "./questions.js";

export function calculateMotivationProfile(answers: QuizAnswer[]): MotivationProfile {
  // Initialize scores for all motivator types
  const scores: Record<MotivatorType, number> = {
    achievement: 0,
    autonomy: 0,
    social: 0,
    health_fear: 0,
    independence: 0,
    mastery: 0,
    purpose: 0,
  };

  // Calculate scores based on answers
  answers.forEach((answer) => {
    const question = QUIZ_QUESTIONS.find((q) => q.id === answer.questionId);
    if (question) {
      // Weight the answer value by the question's category
      scores[question.category] += answer.value;
    }
  });

  // Find primary motivator (highest score)
  const primaryMotivator = Object.entries(scores).reduce((a, b) =>
    scores[a[0] as MotivatorType] > scores[b[0] as MotivatorType] ? a : b
  )[0] as MotivatorType;

  // Find secondary motivators (top 2-3 after primary)
  const sortedMotivators = Object.entries(scores)
    .filter(([type]) => type !== primaryMotivator)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([type]) => type as MotivatorType);

  return {
    primaryMotivator,
    secondaryMotivators: sortedMotivators,
    scores,
  };
}

