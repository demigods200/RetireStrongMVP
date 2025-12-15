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
  // Enhanced context from Milestone 4
  recentPainLevel?: number; // 0-3 scale
  recentSkipStreak?: number;
  adherenceRate?: number; // 0-1
  painIncreasing?: boolean;
  frequentPainLocations?: string[];
  avgDifficulty?: number; // 1-5 scale
  isNewUser?: boolean; // < 2 weeks of activity
}

/**
 * Age-aware safety rules (Enhanced for Milestone 4)
 */
export const AGE_AWARE_RULES: AgeAwareSafetyRule[] = [
  {
    name: 'max-intensity-for-beginners',
    description: 'Users over 60 with no exercise history should start at low intensity',
    severity: 'high',
    check: (context: SafetyContext) => {
      const age = context.userAge || 0;
      const intensity = context.exerciseIntensity || 'low';
      const isNew = context.isNewUser || false;
      
      if (age >= 60 && isNew && intensity === 'high') {
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
  // NEW: Pain-based safety checks
  {
    name: 'escalating-pain-check',
    description: 'Halt progression if pain levels are increasing',
    severity: 'high',
    check: (context: SafetyContext) => {
      const painIncreasing = context.painIncreasing || false;
      const recentPainLevel = context.recentPainLevel || 0;
      
      if (painIncreasing || recentPainLevel >= 2) {
        // Moderate to severe pain or increasing pain
        return false;
      }
      return true;
    },
  },
  {
    name: 'frequent-pain-location-check',
    description: 'Avoid exercises targeting areas with frequent pain',
    severity: 'medium',
    check: (context: SafetyContext) => {
      const frequentPainLocations = context.frequentPainLocations || [];
      const limitations = context.limitations || [];
      
      // If user has frequent pain in specific locations, ensure exercises account for it
      for (const painLocation of frequentPainLocations) {
        if (!limitations.includes(painLocation)) {
          // Pain location not accounted for in limitations
          return false;
        }
      }
      return true;
    },
  },
  // NEW: Adherence-based safety checks
  {
    name: 'low-adherence-regression',
    description: 'Reduce intensity if user is struggling with adherence',
    severity: 'medium',
    check: (context: SafetyContext) => {
      const adherenceRate = context.adherenceRate;
      const intensity = context.exerciseIntensity || 'low';
      const avgDifficulty = context.avgDifficulty || 3;
      
      // If adherence is low (<50%) and difficulty is high, fail
      if (adherenceRate !== undefined && adherenceRate < 0.5 && 
          (intensity === 'high' || avgDifficulty > 3.5)) {
        return false;
      }
      return true;
    },
  },
  {
    name: 'skip-streak-safety-pause',
    description: 'After 3+ skipped sessions, restart with easier variation',
    severity: 'medium',
    check: (context: SafetyContext) => {
      const skipStreak = context.recentSkipStreak || 0;
      const intensity = context.exerciseIntensity || 'low';
      
      // After a long skip streak, don't jump back into high intensity
      if (skipStreak >= 3 && intensity === 'high') {
        return false;
      }
      return true;
    },
  },
  // NEW: Age-specific intensity caps
  {
    name: 'age-70-plus-intensity-cap',
    description: 'Users 70+ should avoid high-intensity without medical clearance',
    severity: 'high',
    check: (context: SafetyContext) => {
      const age = context.userAge || 0;
      const intensity = context.exerciseIntensity || 'low';
      
      if (age >= 70 && intensity === 'high') {
        return false; // Fail: too intense for users 70+
      }
      return true;
    },
  },
  {
    name: 'age-75-plus-balance-support',
    description: 'Users 75+ should always have balance support options',
    severity: 'high',
    check: (context: SafetyContext) => {
      const age = context.userAge || 0;
      const balanceRequired = context.balanceRequired || false;
      const hasSupport = context.limitations?.includes('requires-support') || false;
      
      // For users 75+, if balance is required and no support mentioned, flag it
      if (age >= 75 && balanceRequired && !hasSupport) {
        return false;
      }
      return true;
    },
  },
  // NEW: Recovery time checks
  {
    name: 'adequate-rest-for-older-adults',
    description: 'Users 65+ need adequate rest between high-intensity sessions',
    severity: 'medium',
    check: (context: SafetyContext) => {
      const age = context.userAge || 0;
      const intensity = context.exerciseIntensity || 'low';
      const avgDifficulty = context.avgDifficulty || 3;
      
      // This check would need session history to validate rest days
      // For now, just flag if high intensity + high difficulty for 65+
      if (age >= 65 && intensity === 'high' && avgDifficulty > 4) {
        return false;
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

