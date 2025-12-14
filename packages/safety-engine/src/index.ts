/**
 * Safety Engine (Safety Brain)
 * Highest authority layer that validates all outputs before they reach users
 * 
 * Core principles:
 * - Deterministic rules only (no LLM, no RAG)
 * - Can override any output from Conversational Brain or Personalization Brain
 * - Detects red flags, medical advice, unsafe content
 * - Provides safe fallback messages
 * - Escalates critical issues for human review
 */

export {
  validateTextOutput,
  validatePlanOutput,
  quickSafetyCheck,
  type SafetyValidationResult,
} from './engine/validate-output';

export {
  filterLlmOutput,
  isContentSafe,
  type FilterResult,
} from './filters/llm-output-filter';

export {
  detectRedFlags,
  shouldBlockContent,
  shouldModifyContent,
  RED_FLAGS,
  type RedFlag,
} from './rules/red-flag-detection';

export {
  validateAgeAwareSafety,
  AGE_AWARE_RULES,
  type AgeAwareSafetyRule,
  type SafetyContext,
} from './rules/age-aware-safety';

export {
  detectMedicalAdvice,
  MEDICAL_ADVICE_PATTERNS,
  ACCEPTABLE_MEDICAL_PATTERNS,
  type MedicalAdvicePattern,
} from './rules/medical-advice-detection';

export {
  getFallbackMessage,
  SAFE_FALLBACK_MESSAGES,
} from './fallbacks/safe-messages';

