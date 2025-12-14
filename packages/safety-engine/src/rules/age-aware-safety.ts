/**
 * Age-aware safety rules for older adults
 * Enforces conservative guidelines for users 50+
 */

export interface AgeAwareSafetyRule {
  name: string;
  description: string;
  check: (context: SafetyContext) => boolean;
  severity: 'low' | 'medium' | 'high';
}

export interface SafetyContext {
  userAge?: number;
  limitations?: string[];
  exerciseIntensity?: 'low' | 'moderate' | 'high';
  balanceRequired?: boolean;
  impactLevel?: 'low' | 'moderate' | 'high';
}

/**
 * Age-aware safety rules
 */
export const AGE_AWARE_RULES: AgeAwareSafetyRule[] = [
  {
    name: 'max-intensity-for-beginners',
    description: 'Users over 60 with no exercise history should start at low intensity',
    severity: 'high',
    check: (context: SafetyContext) => {
      const age = context.userAge || 0;
      const intensity = context.exerciseIntensity || 'low';
      
      if (age >= 60 && intensity === 'high') {
        return false; // Fail: too intense for older beginners
      }
      return true;
    },
  },
  {
    name: 'balance-progression',
    description: 'Balance exercises should progress gradually for users 65+',
    severity: 'high',
    check: (context: SafetyContext) => {
      const age = context.userAge || 0;
      const balanceRequired = context.balanceRequired || false;
      const hasBalanceIssues = context.limitations?.includes('balance') || false;
      
      if (age >= 65 && balanceRequired && hasBalanceIssues) {
        return false; // Fail: needs supported balance first
      }
      return true;
    },
  },
  {
    name: 'impact-level-check',
    description: 'High-impact exercises should be avoided for users with joint issues',
    severity: 'high',
    check: (context: SafetyContext) => {
      const impactLevel = context.impactLevel || 'low';
      const hasJointIssues = context.limitations?.some(lim => 
        lim.includes('knee') || lim.includes('hip') || lim.includes('joint')
      ) || false;
      
      if (hasJointIssues && impactLevel === 'high') {
        return false; // Fail: too much impact for joint issues
      }
      return true;
    },
  },
];

/**
 * Validate exercise recommendation against age-aware safety rules
 */
export function validateAgeAwareSafety(context: SafetyContext): {
  passed: boolean;
  failedRules: string[];
  severity: 'low' | 'medium' | 'high';
} {
  const failedRules: string[] = [];
  let maxSeverity: 'low' | 'medium' | 'high' = 'low';

  for (const rule of AGE_AWARE_RULES) {
    if (!rule.check(context)) {
      failedRules.push(rule.name);
      
      // Track highest severity
      if (rule.severity === 'high' || maxSeverity === 'low') {
        maxSeverity = rule.severity;
      }
    }
  }

  return {
    passed: failedRules.length === 0,
    failedRules,
    severity: maxSeverity,
  };
}

