import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getRagSearchEngine } from '../packages/content-rag/src/query/search';

async function run() {
  const engine = getRagSearchEngine();
  const query = process.argv[2] || "Summarize the main points of the video 'The World's Greatest Stretch' by Squat University.";
  const minSimilarity = parseFloat(process.argv[3] || '0.6');
  console.log('Query:', query);
  console.log('minSimilarity:', minSimilarity);

  const results = await engine.search({ query, collection: 'youtube_content', limit: 5, minSimilarity });

  console.log('Results length:', results.length);
  for (const r of results) {
    console.log('---');
    console.log('ID:', r.chunk.id);
    console.log('Source:', r.chunk.sourceTitle, 'Collection:', r.chunk.collection, 'Score:', r.score);
    console.log('Excerpt:', r.chunk.content.slice(0, 200));
  }
}

run().catch(err => { console.error('Error querying RAG:', err); process.exit(1); });