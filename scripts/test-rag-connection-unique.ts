import { OpenSearchVectorStore } from '../packages/content-rag/src/store/vector-store';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testConnectionUnique() {
    const endpoint = process.env.OPENSEARCH_ENDPOINT;
    if (!endpoint) {
        console.error("❌ Missing OPENSEARCH_ENDPOINT in .env.local");
        process.exit(1);
    }

    console.log(`🔌 Testing connection to: ${endpoint}`);
    const store = new OpenSearchVectorStore(endpoint);

    try {
        await store.ensureIndex();

        const testId = `ping-unique-${Date.now()}`;
        console.log(`   Inserting unique test chunk ${testId}...`);

        // unique embedding: mostly 0.1 but first element is timestamp % 10 / 10
        const uniqueScalar = (Date.now() % 1000) / 1000;
        const embedding = new Array(1024).fill(0.1);
        embedding[0] = uniqueScalar;

        await store.addChunks([{
            id: testId,
            content: "Ping unique test content",
            collection: "internal_coaching_materials" as any,
            sourceTitle: "Ping Unique Test",
            embedding: embedding,
            timestampStart: 0,
            timestampEnd: 10
        }]);

        console.log("   Waiting 5s for consistency...");
        await new Promise(r => setTimeout(r, 5000));

        // --------------------
        // Confirm document presence by `id` field (term query) with retries
        // --------------------
        console.log("   Confirming document presence by term query on stored `id`...");
        const { Client } = require('@opensearch-project/opensearch');
        const { AwsSigv4Signer } = require('@opensearch-project/opensearch/aws');
        const { defaultProvider } = require('@aws-sdk/credential-providers');

        const client = new Client({
            node: endpoint,
            ...AwsSigv4Signer({ region: process.env.AWS_REGION || 'us-east-2', service: 'aoss', getCredentials: defaultProvider }),
        });

        let found = false;
        for (let attempt = 0; attempt < 6; attempt++) {
            const resp = await client.search({ index: 'retire-strong-rag-index', body: {
                size: 1,
                query: { term: { id: testId } },
                _source: ['id']
            }});

            if (resp.body.hits.total && resp.body.hits.total.value > 0) {
                console.log(`   ✅ Document found by id on attempt ${attempt + 1}`);
                found = true;
                break;
            }
            console.log(`   Not found yet (attempt ${attempt + 1}), waiting 5s...`);
            await new Promise(r => setTimeout(r, 5000));
        }

        if (!found) {
            console.error('   ❌ Document never appeared via term query; indexing may have failed.');
            process.exit(1);
        }

        // Now do a vector search (should find doc now that it's present in index)
        console.log("   Searching with same unique embedding (vector search)...");
        const results = await store.search({ query: "Ping" , limit: 1 }, embedding);

        if (results.length > 0 && results[0].chunk.id === testId) {
            console.log("✅ SUCCESS: Read/Write verified and unique doc found via vector search.");
        } else {
            console.error("❌ FAILURE: Unique vector search failed to find inserted document even though it is present");
            console.log("   Results found:", results.length);
            if (results.length > 0) console.log('   First result id:', results[0].chunk.id);
        }

    } catch (e: any) {
        console.error("❌ FAILURE: Connection error:", e.message);
        process.exit(1);
    }
}

testConnectionUnique().catch(console.error);
