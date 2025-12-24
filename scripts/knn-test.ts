import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { defaultProvider } from '@aws-sdk/credential-providers';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const endpoint = process.env.OPENSEARCH_ENDPOINT;
if (!endpoint) {
  console.error('Missing OPENSEARCH_ENDPOINT in .env.local');
  process.exit(1);
}

async function main() {
  const client = new Client({ node: endpoint, ...AwsSigv4Signer({ region: process.env.AWS_REGION || 'us-east-2', service: 'aoss', getCredentials: defaultProvider }) });

  const body = {
    size: 5,
    query: {
      knn: {
        embedding: {
          vector: new Array(1024).fill(0.1),
          k: 5,
        }
      }
    }
  };

  try {
    const resp = await client.search({ index: 'retire-strong-rag-index', body });
    console.log('knn hits:', resp.body.hits.hits.length);
    console.log(JSON.stringify(resp.body.hits.hits.slice(0,5), null, 2));
  } catch (e: any) {
    console.error('knn query failed:', e.message, e.body || '');
  }
}

main().catch(console.error);
