/**
 * Content RAG Package
 * Handles RAG ingestion, embedding, and query for coach engine
 * 
 * Collections:
 * - clinical_guidelines: Safety and dosage guidance
 * - behavior_change: Motivation and habits
 * - longevity_and_exercise: Long-term framing
 * - internal_coaching_materials: Tone and philosophy
 * - movement_explanations: Exercise-specific explanations
 */

export {
  RagSearchEngine,
  getRagSearchEngine,
  type SearchQuery,
  type SearchResult,
} from './query/search';

export {
  EmbeddingGenerator,
  type EmbeddingConfig,
} from './pipeline/embeddings';

export {
  loadSeedContent,
  getRagStatus,
  type LoaderConfig,
} from './pipeline/content-loader';

export {
  COLLECTIONS,
  type CollectionName,
  type RagDocument,
  type RagChunk,
} from './types/collections';

