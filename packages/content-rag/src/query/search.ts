/**
 * RAG search and query functionality
 * For MVP: Simple in-memory search
 * For production: Connect to vector database (OpenSearch, Pinecone, etc.)
 */

import { EmbeddingGenerator } from '../pipeline/embeddings';
import type { RagChunk, CollectionName } from '../types/collections';

export interface SearchQuery {
  /** Search query text */
  query: string;
  /** Collection to search in (optional, searches all if not specified) */
  collection?: CollectionName;
  /** Topic filters (optional) */
  topics?: string[];
  /** Movement IDs to filter by (optional) */
  movementIds?: string[];
  /** Maximum number of results */
  limit?: number;
  /** Minimum similarity threshold (0-1) */
  minSimilarity?: number;
}

export interface SearchResult {
  /** The chunk that matched */
  chunk: RagChunk;
  /** Similarity score (0-1, higher is better) */
  score: number;
}

/**
 * RAG search engine
 * For MVP, uses in-memory store with simple similarity search
 */
import type { VectorStore } from '../store/vector-store';

/**
 * RAG search engine
 * Connects to OpenSearch Serverless if configured, otherwise falls back to in-memory
 */
export class RagSearchEngine {
  private embeddingGenerator: EmbeddingGenerator;
  private vectorStore: VectorStore | null = null;

  constructor() {
    this.embeddingGenerator = new EmbeddingGenerator();

    if (process.env.OPENSEARCH_ENDPOINT) {
      console.log('🔗 Connecting to OpenSearch Vector Store:', process.env.OPENSEARCH_ENDPOINT);
      // Dynamic import to avoid crash if dependencies (opensearch) are missing in local env
      // This allows the code to run in "in-memory" mode without needing the AWS deps installed
      import('../store/vector-store')
        .then(({ OpenSearchVectorStore }) => {
          this.vectorStore = new OpenSearchVectorStore(process.env.OPENSEARCH_ENDPOINT!);
        })
        .catch(err => {
          console.error('Failed to load OpenSearchVectorStore. Ensure @opensearch-project/opensearch is installed.', err);
        });
    } else {
      console.warn('⚠️ No OPENSEARCH_ENDPOINT found. RAG search will assume empty results.');
    }
  }

  /**
   * Index chunks for searching
   */
  async indexChunks(chunks: RagChunk[]): Promise<void> {
    // Generate embeddings for chunks that don't have them
    for (const chunk of chunks) {
      if (!chunk.embedding || chunk.embedding.length === 0) {
        chunk.embedding = await this.embeddingGenerator.generateEmbedding(chunk.content);
      }
    }

    if (this.vectorStore) {
      // In production, we might not want to re-index everything on startup every time.
      // But for this transition helper, we allow it.
      await this.vectorStore.ensureIndex();
      await this.vectorStore.addChunks(chunks);
    }
  }

  /**
   * Add a single chunk
   */
  async addChunk(chunk: RagChunk): Promise<void> {
    if (!chunk.embedding || chunk.embedding.length === 0) {
      chunk.embedding = await this.embeddingGenerator.generateEmbedding(chunk.content);
    }

    if (this.vectorStore) {
      await this.vectorStore.addChunks([chunk]);
    }
  }

  /**
   * Search for relevant chunks
   */
  async search(query: SearchQuery): Promise<SearchResult[]> {
    const {
      query: queryText,
      minSimilarity = 0.6,
    } = query;

    // Generate embedding for query
    const queryEmbedding = await this.embeddingGenerator.generateEmbedding(queryText);

    if (this.vectorStore) {
      try {
        return await this.vectorStore.search(query, queryEmbedding);
      } catch (error) {
        console.error('OpenSearch search failed:', error);
        return [];
      }
    } else {
      console.warn('RAG Search attempted without Vector Store connection.');
      return [];
    }
  }

  /**
   * Get chunks by collection
   * (Limited support with VectorStore - usually redundant for search)
   */
  getChunksByCollection(collection: CollectionName): RagChunk[] {
    // With VectorStore, we cannot return all chunks synchronously or easily.
    // Returning empty array as this method was primarily for the in-memory debug view.
    return [];
  }

  /**
   * Get chunks by movement IDs
   */
  async getChunksByMovementIds(movementIds: string[]): Promise<RagChunk[]> {
    if (this.vectorStore) {
      return await this.vectorStore.getChunksByMovementIds(movementIds);
    }
    return [];
  }

  /**
   * Get total number of indexed chunks
   */
  getChunkCount(): number {
    return 0; // Unknown without counting in DB
  }
}

/**
 * Singleton instance for the application
 * In production, this would be replaced with a proper database connection
 */
let searchEngineInstance: RagSearchEngine | null = null;

export function getRagSearchEngine(): RagSearchEngine {
  if (!searchEngineInstance) {
    searchEngineInstance = new RagSearchEngine();
  }
  return searchEngineInstance;
}

