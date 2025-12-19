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
export class RagSearchEngine {
  private embeddingGenerator: EmbeddingGenerator;
  public chunks: RagChunk[] = []; // Public so content-loader can access it directly

  constructor() {
    this.embeddingGenerator = new EmbeddingGenerator();
  }

  /**
   * Index chunks for searching
   * In production, this would write to a vector database
   */
  async indexChunks(chunks: RagChunk[]): Promise<void> {
    // Generate embeddings for chunks that don't have them
    for (const chunk of chunks) {
      if (!chunk.embedding) {
        chunk.embedding = await this.embeddingGenerator.generateEmbedding(chunk.content);
      }
    }

    this.chunks = chunks;
  }

  /**
   * Add a single chunk to the index
   */
  async addChunk(chunk: RagChunk): Promise<void> {
    if (!chunk.embedding) {
      chunk.embedding = await this.embeddingGenerator.generateEmbedding(chunk.content);
    }
    this.chunks.push(chunk);
  }

  /**
   * Search for relevant chunks
   */
  async search(query: SearchQuery): Promise<SearchResult[]> {
    const {
      query: queryText,
      collection,
      topics,
      movementIds,
      limit = 5,
      minSimilarity = 0.6,
    } = query;

    // Generate embedding for query
    const queryEmbedding = await this.embeddingGenerator.generateEmbedding(queryText);

    // Filter chunks based on collection, topics, and movementIds
    let filteredChunks = this.chunks;

    if (collection) {
      filteredChunks = filteredChunks.filter(c => c.collection === collection);
    }

    if (topics && topics.length > 0) {
      filteredChunks = filteredChunks.filter(c => 
        c.topics && topics.some(t => c.topics!.includes(t))
      );
    }

    if (movementIds && movementIds.length > 0) {
      filteredChunks = filteredChunks.filter(c =>
        c.movementIds && movementIds.some(id => c.movementIds!.includes(id))
      );
    }

    // Calculate similarity scores
    const results: SearchResult[] = filteredChunks
      .map(chunk => {
        if (!chunk.embedding) {
          return { chunk, score: 0 };
        }

        const score = EmbeddingGenerator.cosineSimilarity(
          queryEmbedding,
          chunk.embedding
        );

        return { chunk, score };
      })
      .filter(result => result.score >= minSimilarity)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results;
  }

  /**
   * Get chunks by collection
   */
  getChunksByCollection(collection: CollectionName): RagChunk[] {
    return this.chunks.filter(c => c.collection === collection);
  }

  /**
   * Get chunks by movement IDs
   */
  getChunksByMovementIds(movementIds: string[]): RagChunk[] {
    return this.chunks.filter(c =>
      c.movementIds && movementIds.some(id => c.movementIds!.includes(id))
    );
  }

  /**
   * Get total number of indexed chunks
   */
  getChunkCount(): number {
    return this.chunks.length;
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

