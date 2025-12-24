import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { OpenSearchVectorStore } from '../packages/content-rag/src/store/vector-store';
import { EmbeddingGenerator } from '../packages/content-rag/src/pipeline/embeddings';

async function verify(videoIdArg?: string) {
  const endpoint = process.env.OPENSEARCH_ENDPOINT;
  if (!endpoint) {
    console.error('Missing OPENSEARCH_ENDPOINT');
    process.exit(1);
  }

  const videoId = videoIdArg || process.argv[2];
  if (!videoId) {
    console.error('Usage: npx tsx scripts/verify-ingest.ts <youtube_video_id>');
    process.exit(1);
  }

  const expectedDocId = `yt-${videoId}-0`;
  console.log(`🔎 Verifying presence of document ${expectedDocId}...`);

  const { Client } = require('@opensearch-project/opensearch');
  const { AwsSigv4Signer } = require('@opensearch-project/opensearch/aws');
  const { defaultProvider } = require('@aws-sdk/credential-providers');

  const client = new Client({
    node: endpoint,
    ...AwsSigv4Signer({ region: process.env.AWS_REGION || 'us-east-2', service: 'aoss', getCredentials: defaultProvider }),
  });

  // retry term query for id
  let found = false;
  let sourceContent: string | null = null;

  for (let attempt = 0; attempt < 6; attempt++) {
    const resp = await client.search({ index: 'retire-strong-rag-index', body: {
      size: 1,
      query: { term: { id: expectedDocId } },
      _source: ['id', 'content', 'collection']
    }});

    const total = resp.body.hits && resp.body.hits.total ? resp.body.hits.total.value : 0;
    if (total > 0) {
      console.log(`   ✅ Document found by id on attempt ${attempt + 1}`);
      const hit = resp.body.hits.hits[0];
      sourceContent = hit._source && hit._source.content ? hit._source.content : null;
      found = true;
      break;
    }

    console.log(`   Not found yet (attempt ${attempt + 1}), waiting 5s...`);
    await new Promise(r => setTimeout(r, 5000));
  }

  if (!found) {
    console.error('❌ Document never appeared via term query; indexing may have failed.');
    process.exit(1);
  }

  if (!sourceContent) {
    console.warn('   Document found but no content returned; cannot generate embedding for vector test. Marking verification as partial success.');
    process.exit(0);
  }

  // Generate embedding for the content and run vector search
  const embeddingGen = new EmbeddingGenerator();
  console.log('   Generating embedding for content to verify vector search...');
  const embedding = await embeddingGen.generateEmbedding(sourceContent.slice(0, 2000)); // limit to reasonable length

  const store = new OpenSearchVectorStore(endpoint);
  console.log('   Running vector search...');
  const results = await store.search({ query: 'verify', collection: 'youtube_content', limit: 3 }, embedding);

  if (results.length > 0 && results.some(r => r.chunk.id === expectedDocId || (r.chunk && r.chunk.id && r.chunk.id === expectedDocId))) {
    console.log('✅ SUCCESS: Vector search returned the ingested document among top results.');
  } else {
    console.error('❌ FAILURE: Vector search did not return the ingested document.');
    console.log('   Top results:', results.map(r => r.chunk.id));
    process.exit(1);
  }
}

verify().catch(err => { console.error('Verification error:', err); process.exit(1); });
