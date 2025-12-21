import { OpenSearchVectorStore } from '../packages/content-rag/src/store/vector-store';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testConnection() {
    const endpoint = process.env.OPENSEARCH_ENDPOINT;
    if (!endpoint) {
        console.error("❌ Missing OPENSEARCH_ENDPOINT in .env.local");
        console.log("   Please run 'pnpm cdk:deploy RelyingStrong-Rag-dev' first to get the endpoint.");
        process.exit(1);
    }

    console.log(`🔌 Testing connection to: ${endpoint}`);
    const store = new OpenSearchVectorStore(endpoint);

    try {
        // 1. Ensure Index
        console.log("   Checking index...");
        await store.ensureIndex();

        // 2. Insert Dummy Chunk
        const testId = `ping-${Date.now()}`;
        console.log(`   Inserting test chunk ${testId}...`);
        await store.addChunks([{
            id: testId,
            content: "Ping test content",
            collection: "internal_coaching_materials" as any,
            sourceTitle: "Ping Test",
            embedding: new Array(1024).fill(0.1), // Dummy embedding
            timestampStart: 0,
            timestampEnd: 10
        }]);

        // 3. Search Dummy Chunk (Wait 2s for consistency)
        console.log("   Waiting 2s for consistency...");
        await new Promise(r => setTimeout(r, 2000));

        console.log("   Searching...");
        const results = await store.search({
            query: "Ping",
            limit: 1
        }, new Array(1024).fill(0.1));

        if (results.length > 0 && results[0].chunk.id === testId) {
            console.log("✅ SUCCESS: Read/Write verified.");
        } else {
            console.error("❌ FAILURE: Search failed to find inserted document");
            console.log("   Results found:", results.length);
        }

    } catch (e: any) {
        console.error("❌ FAILURE: Connection error:", e.message);
        process.exit(1);
    }
}

testConnection().catch(console.error);
