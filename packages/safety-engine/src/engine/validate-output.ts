/**
 * Main Safety Brain validation engine
 * Highest authority layer that validates all outputs before they reach users
 */

import { filterLlmOutput, type FilterResult } from '../filters/llm-output-filter';
import { validateAgeAwareSafety, type SafetyContext } from '../rules/age-aware-safety';
import { getFallbackMessage } from '../fallbacks/safe-messages';

export interface SafetyValidationResult {
  /** Whether output is safe to show to user */
  safe: boolean;
  /** Action taken by Safety Brain */
  action: 'allow' | 'modify' | 'block' | 'escalate';
  /** Original content before filtering */
  originalContent: string;
  /** Safe content to show to user (may be modified or replaced with fallback) */
  safeContent: string;
  /** Safety rules that were triggered */
  triggeredRules: string[];
  /** Red flags detected */
  redFlags: string[];
  /** Severity of issues found */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Human-readable reason for intervention */
  reason?: string;
  /** Whether this should be escalated for human review */
  shouldEscalate: boolean;
}

/**
 * Validate text output (from LLM or coach engine)
 * This is the main entry point for the Safety Brain
 */
export function validateTextOutput(
  content: string,
  context?: SafetyContext
): SafetyValidationResult {
  // First, run through LLM output filter
  const filterResult: FilterResult = filterLlmOutput(content);

  // Check age-aware safety rules if context provided
  let ageAwareResult = { passed: true, failedRules: [] as string[], severity: 'low' as const };
  if (context) {
    ageAwareResult = validateAgeAwareSafety(context);
  }

  // Determine final action based on both filters
  const allFailedRules = [
    ...filterResult.redFlags.map(f => f.description),
    ...ageAwareResult.failedRules,
  ];

  // Determine severity
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (filterResult.redFlags.some(f => f.severity === 'critical')) {
    severity = 'critical';
  } else if (filterResult.redFlags.some(f => f.severity === 'high') || ageAwareResult.severity === 'high') {
    severity = 'high';
  } else if (filterResult.redFlags.some(f => f.severity === 'medium') || ageAwareResult.severity === 'medium') {
    severity = 'medium';
  }

  // Determine action and safe content
  let action: 'allow' | 'modify' | 'block' | 'escalate' = filterResult.action;
  let safeContent = filterResult.safeContent;

  // Override with block if age-aware rules failed critically
  if (!ageAwareResult.passed && ageAwareResult.severity === 'high') {
    action = 'block';
    safeContent = '';
  }

  // If blocked, use fallback message
  if (action === 'block') {
    const reason = filterResult.reason || ageAwareResult.failedRules.join(', ');
    safeContent = getFallbackMessage(reason);
  }

  // Escalate critical issues for human review
  const shouldEscalate = severity === 'critical' || 
    (severity === 'high' && filterResult.medicalAdviceDetected);

  return {
    safe: action === 'allow' || action === 'modify',
    action,
    originalContent: content,
    safeContent,
    triggeredRules: allFailedRules,
    redFlags: filterResult.redFlags.map(f => f.category),
    severity,
    reason: filterResult.reason,
    shouldEscalate,
  };
}

/**
 * Validate exercise plan output (from movement engine)
 * Ensures plans don't violate safety constraints
 */
export function validatePlanOutput(
  plan: unknown,
  context?: SafetyContext
): SafetyValidationResult {
  // For now, plans from movement engine are trusted
  // But we still check the descriptive text if any
  const planStr = JSON.stringify(plan, null, 2);
  
  // Validate any text descriptions in the plan
  return validateTextOutput(planStr, context);
}

/**
 * Quick safety check without full validation
 */
export function quickSafetyCheck(content: string): boolean {
  const result = validateTextOutput(content);
  return result.safe && result.action === 'allow';
}

