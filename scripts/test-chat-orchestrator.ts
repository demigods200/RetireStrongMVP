import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { ChatOrchestrator } from '../packages/coach-engine/src/orchestrators/chat-orchestrator';

// Simple fallback queryRag stub that uses OpenSearch full-text match to find candidate docs
async function stubQueryRag(query: string, limit = 3) {
  const { Client } = require('@opensearch-project/opensearch');
  const { AwsSigv4Signer } = require('@opensearch-project/opensearch/aws');
  const { defaultProvider } = require('@aws-sdk/credential-providers');

  const endpoint = process.env.OPENSEARCH_ENDPOINT;
  const client = new Client({
    node: endpoint,
    ...AwsSigv4Signer({ region: process.env.AWS_REGION || 'us-east-2', service: 'aoss', getCredentials: defaultProvider }),
  });

  const resp = await client.search({ index: 'retire-strong-rag-index', body: {
    size: limit,
    query: { match: { content: query } },
    _source: ['id','content','sourceTitle','collection']
  }});

  const hits = resp.body.hits.hits || [];
  return hits.map((hit: any) => ({
    content: hit._source.content,
    source: hit._source.sourceTitle,
    collection: hit._source.collection,
    score: hit._score || 1.0,
  }));
}

async function run() {
  const orchestrator = new ChatOrchestrator();

  // Override the imported queryRag by patching the function on the prototype that calls it
  // This avoids the embedding/Bedrock dependency for local tests
  // @ts-ignore
  orchestrator['__originalQueryRag'] = true; // marker
  // Monkeypatch invokeModel to avoid calling Bedrock
  // @ts-ignore
  orchestrator['invokeModel'] = async (systemPrompt: string, messages: any[]) => {
    console.log('--- SYSTEM PROMPT (truncated) ---');
    console.log(systemPrompt.slice(0, 600));
    console.log('--- MESSAGES ---');
    console.log(messages.slice(-2));
    return 'MOCK_RESPONSE: I found some relevant content and can summarize it.';
  };

  // If Bedrock credentials are not available locally, stub EmbeddingGenerator.generateEmbedding
  try {
    // Patch compiled distribution as the running code imports from dist
    const embMod = require('../packages/content-rag/dist/pipeline/embeddings');
    if (embMod && embMod.EmbeddingGenerator) {
      embMod.EmbeddingGenerator.prototype.generateEmbedding = async function(text: string) {
        // deterministic dummy embedding
        return new Array(1024).fill(0.1);
      };
    }
  } catch (e) {
    // ignore if not available
  }

  // Monkeypatch the queryRag module function used by ChatOrchestrator to fallback to OpenSearch match search
  const ragTool = require('../packages/coach-engine/src/tools/rag-query-tool');
  ragTool.queryRag = async (params: any) => ({ results: await stubQueryRag(params.query, params.limit || 3), totalResults: 0 });

  const response = await orchestrator.chat({
    userMessage: "Summarize the main points of the video 'The World's Greatest Stretch' by Squat University.",
    context: {},
    useRag: true,
  });

  console.log('Response message:', response.message);
  console.log('Sources returned:', response.sources);
}

run().catch(err => { console.error(err); process.exit(1); });