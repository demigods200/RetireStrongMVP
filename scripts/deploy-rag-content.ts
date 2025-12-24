import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { OpenSearchVectorStore } from '../packages/content-rag/src/store/vector-store';
import type { RagChunk } from '../packages/content-rag/src/types/collections';

// Try loading multiple .env files so the script works when run from repo root
// and when env vars are stored under apps/api-gateway/.env or in .env
const dotenvResult: any = dotenv.config({ path: ['.env.local', '.env', 'apps/api-gateway/.env'] });
if (dotenvResult && dotenvResult.parsed) {
    console.log(`Loaded environment file with ${Object.keys(dotenvResult.parsed).length} entries`);
} else {
    console.log('No .env file loaded by dotenv; relying on process environment');
}

const SEED_DIR = join(__dirname, '../content/seed');
const OPENSEARCH_ENDPOINT = process.env.OPENSEARCH_ENDPOINT;

if (!OPENSEARCH_ENDPOINT) {
    console.error('❌ Missing OPENSEARCH_ENDPOINT in environment.');
    console.error('   Please deploy the infrastructure first and set the endpoint in .env.local');
    process.exit(1);
}

async function deployContent() {
    console.log('🚀 Starting RAG Content Deployment to AWS OpenSearch...');
    console.log(`target: ${OPENSEARCH_ENDPOINT}`);

    const vectorStore = new OpenSearchVectorStore(OPENSEARCH_ENDPOINT);

    // Ensure index exists
    try {
        await vectorStore.ensureIndex();
    } catch (e: any) {
        console.error('❌ Failed to connect or create index:', e.message);
        process.exit(1);
    }

    // Read all JSON files in content/seed
    const files = readdirSync(SEED_DIR).filter(f => f.endsWith('.json'));

    if (files.length === 0) {
        console.warn('⚠️ No JSON seed files found in content/seed/');
        return;
    }

    let totalChunks = 0;

    for (const file of files) {
        console.log(`\n📄 Processing ${file}...`);
        const filePath = join(SEED_DIR, file);

        try {
            const content = readFileSync(filePath, 'utf-8');
            const chunks: RagChunk[] = JSON.parse(content);

            if (!Array.isArray(chunks)) {
                console.warn(`   Skipping ${file}: Not a JSON array.`);
                continue;
            }

            console.log(`   Found ${chunks.length} chunks.`);

            // Validate chunks have embeddings
            const validChunks = chunks.filter(c => c.embedding && c.embedding.length > 0);

            if (validChunks.length < chunks.length) {
                console.warn(`   ⚠️ Warning: ${chunks.length - validChunks.length} chunks missing embeddings and will be skipped.`);
            }

            if (validChunks.length > 0) {
                process.stdout.write('   Uploading... ');
                await vectorStore.addChunks(validChunks);
                console.log('✅ Done.');
                totalChunks += validChunks.length;
            }

        } catch (e: any) {
            console.error(`   ❌ Error processing ${file}:`, e.message);
        }
    }

    console.log(`\n✨ Deployment Complete! Total chunks indexed: ${totalChunks}`);
}

deployContent().catch(console.error);
