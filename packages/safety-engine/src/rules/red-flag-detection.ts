/**
 * Red flag detection rules for Safety Brain
 * Detects dangerous patterns in LLM or engine outputs
 */

export interface RedFlag {
  pattern: RegExp;
  category: 'medical-diagnosis' | 'unsafe-exercise' | 'over-promising' | 'fear-based' | 'inappropriate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

/**
 * Comprehensive list of red flag patterns
 * These patterns trigger Safety Brain interventions
 */
export const RED_FLAGS: RedFlag[] = [
  // Medical diagnosis (CRITICAL)
  {
    pattern: /\b(you have|diagnosed with|I diagnose|medical condition|disease|illness|disorder)\b/i,
    category: 'medical-diagnosis',
    severity: 'critical',
    description: 'Attempting to provide medical diagnosis',
  },
  {
    pattern: /\b(prescribe|prescription|medication|drug|medicine|treatment plan)\b/i,
    category: 'medical-diagnosis',
    severity: 'critical',
    description: 'Attempting to prescribe treatment or medication',
  },
  {
    pattern: /\b(consult (your )?doctor|see (your )?doctor|talk to (your )?doctor)\b/i,
    category: 'medical-diagnosis',
    severity: 'low', // This is actually GOOD advice - low severity but flag for review
    description: 'Recommending doctor consultation (acceptable)',
  },

  // Unsafe exercise instructions (HIGH)
  {
    pattern: /\b(ignore (the )?pain|push through (the )?pain|no pain no gain)\b/i,
    category: 'unsafe-exercise',
    severity: 'high',
    description: 'Encouraging users to ignore pain',
  },
  {
    pattern: /\b(maximum effort|go all out|push to (the )?limit|exhaust yourself)\b/i,
    category: 'unsafe-exercise',
    severity: 'high',
    description: 'Encouraging excessive intensity for older adults',
  },
  {
    pattern: /\b(skip warm[- ]?up|no need to warm up)\b/i,
    category: 'unsafe-exercise',
    severity: 'medium',
    description: 'Suggesting to skip warm-up',
  },

  // Over-promising results (MEDIUM)
  {
    pattern: /\b(guaranteed|promise|definitely will|100% effective|miracle|cure)\b/i,
    category: 'over-promising',
    severity: 'medium',
    description: 'Making unrealistic promises about results',
  },
  {
    pattern: /\b(reverse aging|anti[- ]?aging|look (10|20) years younger)\b/i,
    category: 'over-promising',
    severity: 'medium',
    description: 'Making anti-aging claims',
  },

  // Fear-based messaging (MEDIUM)
  {
    pattern: /\b(you will fall|you will get hurt|you will die|risk of death)\b/i,
    category: 'fear-based',
    severity: 'medium',
    description: 'Using fear-based messaging',
  },
  {
    pattern: /\b(too old|too late|you can't|you won't be able to)\b/i,
    category: 'fear-based',
    severity: 'medium',
    description: 'Discouraging or ageist language',
  },

  // Inappropriate content (HIGH)
  {
    pattern: /\b(sexy|sexual|hot body|bikini body)\b/i,
    category: 'inappropriate',
    severity: 'high',
    description: 'Inappropriate or sexualized language',
  },
];

/**
 * Check content for red flags
 * Returns all detected red flags
 */
export function detectRedFlags(content: string): RedFlag[] {
  const detected: RedFlag[] = [];

  for (const flag of RED_FLAGS) {
    if (flag.pattern.test(content)) {
      detected.push(flag);
    }
  }

  return detected;
}

/**
 * Determine if content should be blocked based on red flags
 * Critical severity = always block
 * High severity = block
 * Medium severity = modify
 * Low severity = warn but allow
 */
export function shouldBlockContent(redFlags: RedFlag[]): boolean {
  return redFlags.some(flag => 
    flag.severity === 'critical' || flag.severity === 'high'
  );
}

/**
 * Determine if content should be modified
 */
export function shouldModifyContent(redFlags: RedFlag[]): boolean {
  return redFlags.some(flag => flag.severity === 'medium') && !shouldBlockContent(redFlags);
}

