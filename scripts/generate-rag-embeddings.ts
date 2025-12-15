/**
 * Script to pre-generate embeddings for RAG seed content
 * Run this offline to avoid blocking server startup
 * 
 * Usage: tsx scripts/generate-rag-embeddings.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { EmbeddingGenerator } from '../packages/content-rag/src/pipeline/embeddings';
import type { RagChunk } from '../packages/content-rag/src/types/collections';

async function generateEmbeddings() {
  console.log('🚀 Generating embeddings for RAG seed content...\n');

  const contentPath = join(__dirname, '..', 'content', 'seed');
  const embeddingGenerator = new EmbeddingGenerator();

  const collections = [
    'clinical_guidelines',
    'behavior_change',
    'longevity_and_exercise',
    'internal_coaching_materials',
    'movement_explanations',
  ];

  let totalProcessed = 0;

  for (const collection of collections) {
    const filePath = join(contentPath, `${collection}.json`);

    if (!existsSync(filePath)) {
      console.log(`⚠️  Skipping ${collection} - file not found`);
      continue;
    }

    console.log(`📄 Processing ${collection}...`);

    const fileContent = readFileSync(filePath, 'utf-8');
    const chunks: RagChunk[] = JSON.parse(fileContent);

    let updated = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]!;

      if (chunk.embedding && chunk.embedding.length > 0) {
        console.log(`   ${i + 1}/${chunks.length} - Already has embedding, skipping`);
        continue;
      }

      console.log(`   ${i + 1}/${chunks.length} - Generating embedding...`);

      try {
        chunk.embedding = await embeddingGenerator.generateEmbedding(chunk.content);
        updated++;
      } catch (error: any) {
        console.error(`   ❌ Failed for chunk ${chunk.id}:`, error.message);
        continue;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Save updated chunks back to file
    writeFileSync(filePath, JSON.stringify(chunks, null, 2), 'utf-8');

    console.log(`   ✅ ${updated} new embeddings generated for ${collection}\n`);
    totalProcessed += updated;
  }

  console.log(`\n🎉 Done! Generated ${totalProcessed} embeddings total.`);
  console.log('📝 Embeddings saved to JSON files in content/seed/');
}

generateEmbeddings().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

