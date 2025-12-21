/**
 * RAG query tool for coach engine
 * Allows the LLM to query RAG collections for grounded responses
 */

import { getRagSearchEngine, type CollectionName } from '@retire-strong/content-rag';

export interface RagQueryParams {
  /** The question to search for */
  query: string;
  /** Collection to search (optional) */
  collection?: CollectionName;
  /** Topic filters (optional) */
  topics?: string[];
  /** Maximum number of results */
  limit?: number;
}

export interface RagQueryResult {
  /** Results found */
  results: Array<{
    content: string;
    source: string;
    collection: string;
    score: number;
  }>;
  /** Total results found */
  totalResults: number;
}

/**
 * Query RAG for relevant content
 * This is a tool that the LLM can use to get grounded information
 */
export async function queryRag(params: RagQueryParams): Promise<RagQueryResult> {
  const { query, collection, topics, limit = 3 } = params;

  const searchEngine = getRagSearchEngine();

  const searchResults = await searchEngine.search({
    query,
    collection,
    topics,
    limit,
    minSimilarity: 0.6,
  });

  const results = searchResults.map(result => ({
    content: result.chunk.content,
    source: result.chunk.sourceTitle,
    collection: result.chunk.collection,
    score: result.score,
  }));

  return {
    results,
    totalResults: results.length,
  };
}

/**
 * Query RAG for movement-specific explanations
 */
export async function queryMovementExplanations(
  movementIds: string[]
): Promise<RagQueryResult> {
  const searchEngine = getRagSearchEngine();

  const chunks = await searchEngine.getChunksByMovementIds(movementIds);

  const results = chunks.map(chunk => ({
    content: chunk.content,
    source: chunk.sourceTitle,
    collection: chunk.collection,
    score: 1.0, // Exact match
  }));

  return {
    results,
    totalResults: results.length,
  };
}

