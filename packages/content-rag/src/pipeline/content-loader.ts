import { getRagSearchEngine } from '../query/search';
import type { CollectionName } from '../types/collections';

export interface LoaderConfig {
  /** Path to seed content directory */
  contentPath?: string;
  /** Whether to log loading progress */
  verbose?: boolean;
}

/**
 * Load all seed content into the RAG search engine
 * @deprecated For AWS RAG, content is pre-loaded into OpenSearch via scripts/deploy-rag-content.ts
 * This function now just ensures the SearchEngine is initialized.
 */
export async function loadSeedContent(config: LoaderConfig = {}): Promise<void> {
  const { verbose = true } = config;

  if (verbose) {
    if (process.env.OPENSEARCH_ENDPOINT) {
      console.log('🔗 RAG System using AWS OpenSearch Serverless.');
      console.log(`   Endpoint: ${process.env.OPENSEARCH_ENDPOINT}`);
    } else {
      console.warn('⚠️  No OPENSEARCH_ENDPOINT found. RAG functionality will be disabled.');
      console.warn('   Run scripts/deploy-rag-content.ts to hydrate the database.');
    }
  }

  // Ensure engine instance is created
  getRagSearchEngine();
}

/**
 * Get RAG loading status
 */
export function getRagStatus(): {
  loaded: boolean;
  chunkCount: number;
  collections: Record<CollectionName, number>;
} {
  const searchEngine = getRagSearchEngine();
  // With VectorStore, real-time counts are expensive/complex to fetch synchronously.
  // We return placeholder stats indicating "Cloud Managed".

  return {
    loaded: !!process.env.OPENSEARCH_ENDPOINT,
    chunkCount: -1, // -1 indicates "Unknown / Cloud Managed"
    collections: {
      clinical_guidelines: -1,
      behavior_change: -1,
      longevity_and_exercise: -1,
      internal_coaching_materials: -1,
      movement_explanations: -1,
      youtube_content: -1,
    }
  };
}

