/**
 * ML Hints Package
 * =================
 * Optional ML-powered personalization hints for Retire Strong.
 * 
 * IMPORTANT PRINCIPLES:
 * 1. ML hints are suggestions only - never final authority
 * 2. All hints must pass through Movement Engine (deterministic safety rules)
 * 3. All hints must pass through Safety Brain (guardrail override layer)
 * 4. ML can be disabled without affecting core functionality
 * 5. All predictions are auditable and explainable
 * 
 * This package provides:
 * - Drop-off risk prediction (to prevent user churn)
 * - Engagement pattern analysis (to optimize scheduling and content)
 * - Personalization hints (to improve user experience)
 * 
 * Future enhancements could include:
 * - Real ML models (e.g., logistic regression, random forest)
 * - A/B testing framework
 * - Continuous learning from user feedback
 */

export { DropoffPredictor } from "./dropoff-predictor.js";
export { EngagementAnalyzer } from "./engagement-analyzer.js";
export type {
  DropoffRiskFactors,
  DropoffRiskPrediction,
  PersonalizationHint,
  EngagementSignals,
} from "./types.js";

