/**
 * LLM output filter for Safety Brain
 * Filters and sanitizes LLM responses before they reach users
 */

import { detectRedFlags, shouldBlockContent, shouldModifyContent, type RedFlag } from '../rules/red-flag-detection';
import { detectMedicalAdvice } from '../rules/medical-advice-detection';

export interface FilterResult {
  safe: boolean;
  action: 'allow' | 'modify' | 'block' | 'escalate';
  originalContent: string;
  safeContent: string;
  redFlags: RedFlag[];
  medicalAdviceDetected: boolean;
  reason?: string;
}

/**
 * Filter LLM output through Safety Brain
 * This is the main entry point for safety filtering
 */
export function filterLlmOutput(content: string): FilterResult {
  const redFlags = detectRedFlags(content);
  const medicalAdvice = detectMedicalAdvice(content);

  // Critical: Block content with critical red flags
  if (shouldBlockContent(redFlags)) {
    return {
      safe: false,
      action: 'block',
      originalContent: content,
      safeContent: '', // Will be replaced with fallback message
      redFlags,
      medicalAdviceDetected: medicalAdvice.detected,
      reason: `Blocked due to ${redFlags.filter(f => f.severity === 'critical' || f.severity === 'high').map(f => f.description).join(', ')}`,
    };
  }

  // Block medical advice
  if (medicalAdvice.detected && !medicalAdvice.isAcceptable) {
    return {
      safe: false,
      action: 'block',
      originalContent: content,
      safeContent: '',
      redFlags,
      medicalAdviceDetected: true,
      reason: `Blocked medical advice: ${medicalAdvice.patterns.map(p => p.description).join(', ')}`,
    };
  }

  // Modify content with medium-severity issues
  if (shouldModifyContent(redFlags)) {
    const safeContent = sanitizeContent(content, redFlags);
    return {
      safe: true,
      action: 'modify',
      originalContent: content,
      safeContent,
      redFlags,
      medicalAdviceDetected: false,
      reason: 'Modified to remove medium-severity issues',
    };
  }

  // Allow safe content
  return {
    safe: true,
    action: 'allow',
    originalContent: content,
    safeContent: content,
    redFlags,
    medicalAdviceDetected: false,
  };
}

/**
 * Sanitize content by removing or replacing problematic text
 * This is a simple implementation - can be enhanced
 */
function sanitizeContent(content: string, redFlags: RedFlag[]): string {
  let sanitized = content;

  for (const flag of redFlags) {
    if (flag.severity === 'medium') {
      // Replace problematic patterns with safer alternatives
      switch (flag.category) {
        case 'over-promising':
          sanitized = sanitized.replace(/\b(guaranteed|promise|definitely will)\b/gi, 'may help');
          sanitized = sanitized.replace(/\b100% effective\b/gi, 'effective for many people');
          break;
        case 'fear-based':
          sanitized = sanitized.replace(/\byou will fall\b/gi, 'to help prevent falls');
          sanitized = sanitized.replace(/\btoo old\b/gi, 'starting gradually is important');
          break;
        default:
          // For other categories, add a general disclaimer
          sanitized += '\n\nNote: This is general guidance. Always listen to your body and consult healthcare providers as needed.';
      }
    }
  }

  return sanitized;
}

/**
 * Quick check if content is safe without full filtering
 */
export function isContentSafe(content: string): boolean {
  const result = filterLlmOutput(content);
  return result.safe && result.action === 'allow';
}

