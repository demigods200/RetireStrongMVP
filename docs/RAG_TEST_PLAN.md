# RAG System Test Plan (Non-Ingestion)

This plan details how to verify the **infrastructure**, **connectivity**, and **application logic** of the new AWS RAG system *without* running the heavy ingestion scripts.

## 1. Infrastructure Verification (AWS CDK)

**Goal**: Confirm that OpenSearch Serverless and IAM roles are correctly provisioned.

### Step 1.1: Deploy Stacks
Run the deployment commands for the new stacks.
```bash
# Deploys the Vector Database
pnpm cdk:deploy RetireStrong-Rag-dev

# Deploys the API and updates Lambda environment variables
pnpm cdk:deploy RetireStrong-Api-dev
```

### Step 1.2: Verify Outputs
After deployment, check the CloudFormation outputs in your terminal or AWS Console.
*   **Look for**: `RetireStrong-Rag-dev.RagCollectionEndpoint`
*   **Format**: `https://<id>.<region>.aoss.amazonaws.com`
*   **Verification**: Copy this URL. You will need it for connectivity testing.

### Step 1.3: Check CloudWatch Logs (Post-Deploy)
*   Go to **AWS CloudWatch > Log Groups**.
*   Look for `/aws/lambda/retire-strong-coach-chat-dev`.
*   **Verify**: The log stream should *not* show errors related to "Missing OPENSEARCH_ENDPOINT".

---

## 2. Connectivity Verification (Script)

**Goal**: Confirm your local machine (or Lambda) can actually talk to the OpenSearch endpoint.

### Step 2.1: Create a "Ping" Script
Create a temporary file `scripts/test-rag-connection.ts` to test value insertion and retrieval.

```typescript
import { OpenSearchVectorStore } from '../packages/content-rag/src/store/vector-store';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testConnection() {
    const endpoint = process.env.OPENSEARCH_ENDPOINT;
    if (!endpoint) throw new Error("Missing OPENSEARCH_ENDPOINT");

    console.log(`Testing connection to: ${endpoint}`);
    const store = new OpenSearchVectorStore(endpoint);

    // 1. Ensure Index
    await store.ensureIndex();
    
    // 2. Insert Dummy Chunk
    const testId = `ping-${Date.now()}`;
    await store.addChunks([{
        id: testId,
        content: "Ping test content",
        collection: "internal_coaching_materials" as any,
        sourceTitle: "Ping Test",
        embedding: new Array(1024).fill(0.1), // Dummy embedding
        timestampStart: 0,
        timestampEnd: 10
    }]);

    console.log("✅ Write successful");

    // 3. Search Dummy Chunk (Wait 2s for consistency)
    await new Promise(r => setTimeout(r, 2000));
    const results = await store.search({
        query: "Ping",
        limit: 1
    }, new Array(1024).fill(0.1));

    if (results.length > 0 && results[0].chunk.id === testId) {
        console.log("✅ Read/Search successful");
    } else {
        console.error("❌ Search failed to find inserted document");
    }
}

testConnection().catch(console.error);
```

### Step 2.2: Run the Test
```bash
npx tsx scripts/test-rag-connection.ts
```
*   **Success**: Prints "✅ Read/Search successful".
*   **Failure**: "403 Forbidden" (Check AWS credentials) or "Connection Timed Out" (Check Network Policy in `rag-stack.ts`).

---

## 3. Application Logic verification (Unit Tests)

**Goal**: Verify the `RagSearchEngine` correctly toggles between Cloud and In-Memory modes based on environment variables.

### Step 3.1: Run Package Tests
Navigate to the RAG package and run tests (ensure you have tests written or mocked).
```bash
cd packages/content-rag
pnpm test
```

### Step 3.2: Verify Fallback Logic
1.  **Without Env Var**: Unset `OPENSEARCH_ENDPOINT`. Run the Coach (via `pnpm dev:api`). Call the `/coach/chat` endpoint.
    *   **Expectation**: Logs say "⚠️ No OPENSEARCH_ENDPOINT found. Using in-memory RAG."
2.  **With Env Var**: Set `OPENSEARCH_ENDPOINT` to a dummy string.
    *   **Expectation**: Logs say "🔗 Connecting to OpenSearch Vector Store..." (It will fail connection, but proves the logic switch works).

---

## 4. End-to-End Verification (Coach Chat)

**Goal**: Verify the Coach Lambda can query the RAG system and generate a response.

### Step 4.1: Deploy with Dummy Data
If you successfully ran Step 2 (Ping Script), your OpenSearch index has 1 document ("Ping test content").

### Step 4.2: Ask the Coach
Send a chat message to the deployed API (or local proxy).
*   **Message**: "What is the result of the ping test?"
*   **Why**: The RAG system should retrieve the "Ping test content" chunk.
*   **Verify**: The LLM response should mention "Ping test content" if retrieval worked.

---

## Summary Checklist

- [ ] **Infrastructure**: Stack deployed, Endpoint URL obtained.
- [ ] **Connectivity**: `test-rag-connection.ts` writes and reads a dummy vector.
- [ ] **Logic**: Coach logs show correct "Connecting to OpenSearch" message.
- [ ] **End-to-End**: Coach can answer a question based on uploaded dummy data.
