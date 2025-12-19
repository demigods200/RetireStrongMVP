/**
 * Medical advice detection rules
 * Prevents the system from offering medical diagnosis or treatment advice
 */

export interface MedicalAdvicePattern {
  pattern: RegExp;
  category: 'diagnosis' | 'treatment' | 'prescription' | 'symptom-analysis';
  description: string;
}

/**
 * Patterns that indicate medical advice (which we must NOT provide)
 */
export const MEDICAL_ADVICE_PATTERNS: MedicalAdvicePattern[] = [
  // Diagnosis patterns
  {
    pattern: /\b(you (probably|likely|might) have|this (sounds like|could be)|I (think|believe) you have)\b/i,
    category: 'diagnosis',
    description: 'Attempting to diagnose a condition',
  },
  {
    pattern: /\b(symptoms of|signs of|indicates|suggests) \w+ (disease|disorder|condition|syndrome)\b/i,
    category: 'diagnosis',
    description: 'Identifying specific medical conditions',
  },

  // Treatment patterns
  {
    pattern: /\b(you should (take|use|try)|I recommend (taking|using)) \w+ (medication|drug|medicine)\b/i,
    category: 'prescription',
    description: 'Recommending specific medications',
  },
  {
    pattern: /\b(dosage|dose|how much to take|milligrams|mg|prescription)\b/i,
    category: 'prescription',
    description: 'Discussing medication dosages',
  },

  // Symptom analysis patterns
  {
    pattern: /\b(this pain means|your pain is (from|caused by)|indicates (a|an) \w+ problem)\b/i,
    category: 'symptom-analysis',
    description: 'Diagnosing cause of symptoms',
  },
  {
    pattern: /\b(this exercise will (cure|fix|treat|heal) (your )?(pain|injury|condition))\b/i,
    category: 'treatment',
    description: 'Promising medical outcomes from exercise',
  },
  {
    pattern: /\b(you (don't|do not) need to see a doctor|no need for (a )?doctor)\b/i,
    category: 'treatment',
    description: 'Advising against medical consultation',
  },
];

/**
 * Acceptable medical guidance patterns (these are OK)
 */
export const ACCEPTABLE_MEDICAL_PATTERNS: RegExp[] = [
  /\b(if you experience pain|stop if (you feel )?pain|listen to your body)\b/i,
  /\b(consult (with )?(your )?doctor|talk to (your )?doctor|see (your )?doctor)\b/i,
  /\b(before starting|check with (your )?doctor first)\b/i,
  /\b(general (wellness|fitness|exercise) guidance)\b/i,
  // Allow discussion of exercises for pain management/relief
  /\b(exercises? (to|that|can|may) (help|reduce|improve|manage|alleviate|relieve|soothe) (pain|discomfort|stiffness|soreness))\b/i,
  /\b(movements? (to|that|can|may) (help|reduce|improve|manage|alleviate|relieve|soothe) (pain|discomfort|stiffness|soreness))\b/i,
  /\b(stretches? (to|that|can|may) (help|reduce|improve|manage|alleviate|relieve|soothe) (pain|discomfort|stiffness|soreness))\b/i,
  // Specific knee/joint support allowance
  /\b(what exercises? can (help|support|improve) (my|the) knee)\b/i,
];

/**
 * Detect medical advice in content
 */
export function detectMedicalAdvice(content: string): {
  detected: boolean;
  patterns: MedicalAdvicePattern[];
  isAcceptable: boolean;
} {
  const detectedPatterns: MedicalAdvicePattern[] = [];

  // Check for problematic patterns
  for (const pattern of MEDICAL_ADVICE_PATTERNS) {
    if (pattern.pattern.test(content)) {
      detectedPatterns.push(pattern);
    }
  }

  // Check if content is acceptable medical guidance
  const isAcceptable = ACCEPTABLE_MEDICAL_PATTERNS.some(pattern =>
    pattern.test(content)
  ) && detectedPatterns.length === 0;

  return {
    detected: detectedPatterns.length > 0,
    patterns: detectedPatterns,
    isAcceptable,
  };
}

