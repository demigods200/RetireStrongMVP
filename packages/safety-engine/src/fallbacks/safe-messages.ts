/**
 * Safe fallback messages for Safety Brain
 * Used when content is blocked or needs to be replaced
 */

export const SAFE_FALLBACK_MESSAGES = {
  /**
   * Default fallback when content is blocked
   */
  default: `I want to make sure I'm giving you safe, appropriate guidance. Let me rephrase that in a way that's more helpful for your wellness journey. 

Remember, this is general fitness guidance designed to support your goals. If you have specific health concerns, it's always best to discuss them with your healthcare provider.`,

  /**
   * Fallback for medical advice detection
   */
  medicalAdvice: `I appreciate your question, but I'm not able to provide medical advice or diagnosis. 

For health concerns or symptoms, please consult with your doctor or healthcare provider. They can give you personalized guidance based on your complete health history.

I'm here to support you with exercise guidance and motivation within safe, general wellness principles.`,

  /**
   * Fallback for unsafe exercise suggestion
   */
  unsafeExercise: `I want to make sure any movement recommendations are safe and appropriate for you. 

Let's focus on exercises that are well-suited to your current fitness level and any limitations you've shared. Building strength and confidence happens gradually and safely.

If you'd like to explore a specific type of movement, let me know and I can suggest safer alternatives.`,

  /**
   * Fallback for over-promising results
   */
  overPromising: `I'm excited about your wellness journey, but I want to set realistic expectations. 

Movement and exercise can bring wonderful benefits - better balance, more energy, greater confidence in daily activities. But results vary for everyone and take consistent effort over time.

Let's focus on building sustainable habits that work for your life and goals.`,

  /**
   * Fallback for inappropriate content
   */
  inappropriate: `Let's keep our conversation focused on what matters most: your health, strength, and confidence as you age.

I'm here to support you with practical exercise guidance and encouragement that respects your goals and experience.`,

  /**
   * Fallback for intensity issues
   */
  intensityWarning: `Safety is always our top priority. For anyone starting or returning to exercise, especially over 50, it's important to build gradually.

We'll make sure you're starting at an appropriate level and progressing at a pace that keeps you safe while building strength and confidence.

If you experience any pain or discomfort, stop and let me know so we can adjust.`,
};

/**
 * Get appropriate fallback message based on intervention reason
 */
export function getFallbackMessage(reason: string): string {
  const lowerReason = reason.toLowerCase();

  if (lowerReason.includes('medical') || lowerReason.includes('diagnosis')) {
    return SAFE_FALLBACK_MESSAGES.medicalAdvice;
  }

  if (lowerReason.includes('unsafe') || lowerReason.includes('pain')) {
    return SAFE_FALLBACK_MESSAGES.unsafeExercise;
  }

  if (lowerReason.includes('promising') || lowerReason.includes('guarantee')) {
    return SAFE_FALLBACK_MESSAGES.overPromising;
  }

  if (lowerReason.includes('inappropriate') || lowerReason.includes('sexual')) {
    return SAFE_FALLBACK_MESSAGES.inappropriate;
  }

  if (lowerReason.includes('intensity') || lowerReason.includes('effort')) {
    return SAFE_FALLBACK_MESSAGES.intensityWarning;
  }

  return SAFE_FALLBACK_MESSAGES.default;
}

