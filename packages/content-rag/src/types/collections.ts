/**
 * RAG collection types and definitions
 */

export type CollectionName =
  | 'clinical_guidelines'
  | 'behavior_change'
  | 'longevity_and_exercise'
  | 'internal_coaching_materials'
  | 'movement_explanations'
  | 'youtube_content';

export interface RagDocument {
  /** Unique document ID */
  id: string;
  /** Collection this document belongs to */
  collection: CollectionName;
  /** Document content/chunk */
  content: string;
  /** Source title or file name */
  sourceTitle: string;
  /** Topic tags for filtering */
  topics?: string[];
  /** Movement IDs referenced (for movement_explanations) */
  movementIds?: string[];
  /** Page number or timestamp range */
  location?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export interface RagChunk extends RagDocument {
  /** Embedding vector (when using vector search) */
  embedding?: number[];
  /** Chunk index within document */
  chunkIndex?: number;
}

/**
 * Collection metadata and descriptions
 */
export const COLLECTIONS: Record<CollectionName, { description: string; use: string }> = {
  clinical_guidelines: {
    description: 'WHO, ACSM, US Physical Activity Guidelines for older adults',
    use: 'Use for safety, dosage, and evidence-based exercise recommendations',
  },
  behavior_change: {
    description: 'Tiny Habits, Atomic Habits, stages of change, Self-Determination Theory',
    use: 'Use for motivation, habit formation, and behavior change strategies',
  },
  longevity_and_exercise: {
    description: 'Outlive, Younger Next Year, longevity research',
    use: 'Use for long-term framing and benefits of exercise',
  },
  internal_coaching_materials: {
    description: 'Vitality Coach slides, brand manifesto, internal docs',
    use: 'Use for tone, philosophy, and coaching approach',
  },
  movement_explanations: {
    description: 'Explanations of specific exercises linked to movement IDs',
    use: 'Use to explain why specific movements matter and how to do them safely',
  },
  youtube_content: {
    description: 'Transcripts from curated YouTube videos about exercise and longevity',
    use: 'Use for video-based explanations and alternative perspectives',
  },
};

