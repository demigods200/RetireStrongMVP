/**
 * Content loader for RAG system
 * Loads seed content from JSON files and indexes them for search
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getRagSearchEngine } from '../query/search';
import type { RagChunk, CollectionName } from '../types/collections';

export interface LoaderConfig {
  /** Path to seed content directory */
  contentPath?: string;
  /** Whether to log loading progress */
  verbose?: boolean;
}

/**
 * Load all seed content into the RAG search engine
 */
export async function loadSeedContent(config: LoaderConfig = {}): Promise<void> {
  const {
    contentPath = join(process.cwd(), 'content', 'seed'),
    verbose = true,
  } = config;

  const searchEngine = getRagSearchEngine();

  // Check if search engine already has content
  const currentCount = searchEngine.getChunkCount();
  if (currentCount > 0) {
    if (verbose) {
      console.log(`📚 RAG already loaded with ${currentCount} chunks, skipping reload`);
    }
    return;
  }

  if (verbose) {
    console.log('📚 Loading RAG seed content...');
  }

  const collections: CollectionName[] = [
    'clinical_guidelines',
    'behavior_change',
    'longevity_and_exercise',
    'internal_coaching_materials',
    'movement_explanations',
  ];

  let totalLoaded = 0;
  const chunks: RagChunk[] = [];

  for (const collection of collections) {
    const filePath = join(contentPath, `${collection}.json`);

    if (!existsSync(filePath)) {
      if (verbose) {
        console.log(`⚠️  Skipping ${collection} - file not found: ${filePath}`);
      }
      continue;
    }

    try {
      const fileContent = readFileSync(filePath, 'utf-8');
      const collectionChunks: RagChunk[] = JSON.parse(fileContent);

      chunks.push(...collectionChunks);
      totalLoaded += collectionChunks.length;

      if (verbose) {
        console.log(`  ✓ ${collection}: ${collectionChunks.length} chunks`);
      }
    } catch (error: any) {
      console.error(`  ✗ Error loading ${collection}:`, error.message);
    }
  }

  if (chunks.length === 0) {
    console.warn('⚠️  No RAG content loaded! Coach will respond without grounded context.');
    return;
  }

  // Filter out chunks without embeddings (skip generating at startup)
  const chunksWithEmbeddings = chunks.filter(c => c.embedding && c.embedding.length > 0);
  const chunksWithoutEmbeddings = chunks.length - chunksWithEmbeddings.length;

  if (chunksWithoutEmbeddings > 0 && verbose) {
    console.log(`⚠️  Skipping ${chunksWithoutEmbeddings} chunks without pre-computed embeddings`);
  }

  if (chunksWithEmbeddings.length === 0) {
    console.warn('⚠️  No chunks with embeddings! Run scripts/generate-rag-embeddings.ts first.');
    return;
  }

  // Index chunks (no embedding generation needed, they're pre-computed)
  if (verbose) {
    console.log(`🔄 Indexing ${chunksWithEmbeddings.length} chunks with pre-computed embeddings...`);
  }

  try {
    // Load chunks directly without generating embeddings
    for (const chunk of chunksWithEmbeddings) {
      searchEngine.chunks.push(chunk);
    }

    if (verbose) {
      console.log(`✅ RAG loaded successfully: ${chunksWithEmbeddings.length} chunks indexed`);
      console.log(`   Collections: ${collections.join(', ')}`);
    }
  } catch (error: any) {
    console.error('❌ Failed to index RAG content:', error.message);
    throw error;
  }
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
  const chunkCount = searchEngine.getChunkCount();

  const collections: Record<CollectionName, number> = {
    clinical_guidelines: searchEngine.getChunksByCollection('clinical_guidelines').length,
    behavior_change: searchEngine.getChunksByCollection('behavior_change').length,
    longevity_and_exercise: searchEngine.getChunksByCollection('longevity_and_exercise').length,
    internal_coaching_materials: searchEngine.getChunksByCollection('internal_coaching_materials').length,
    movement_explanations: searchEngine.getChunksByCollection('movement_explanations').length,
  };

  return {
    loaded: chunkCount > 0,
    chunkCount,
    collections,
  };
}

