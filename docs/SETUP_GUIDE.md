# Retire Strong MVP - Setup Guide

This guide details how to set up the Retire Strong MVP project on a **new machine**.

## 1. Prerequisites

Before cloning, ensure you have the following installed:

*   **Node.js**: Version **20.18.0** or later (LTS recommended).
    *   *Verify*: `node -v`
*   **pnpm**: Version **9.0** or later.
    *   *Install*: `npm install -g pnpm`
    *   *Verify*: `pnpm -v`
*   **AWS CLI**: Configured with credentials that have access to Bedrock (Titan, Claude) and DynamoDB.
    *   *Install*: [AWS CLI Install Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
    *   *Verify*: `aws sts get-caller-identity`

## 2. Installation

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd retire-strong
    ```

2.  **Install Dependencies**
    **Important**: This project is a monorepo using **pnpm workspaces**. Do **not** use `npm install`.
    ```bash
    pnpm install
    ```

## 3. Environment Configuration

1.  **Copy Environment File**
    ```bash
    cp .env.example .env.local
    ```

2.  **Configure AWS Region**
    Ensure your `.env.local` points to a region where Bedrock is enabled (e.g., `us-east-1` or `us-west-2`).
    ```env
    AWS_REGION=us-east-1
    ```

## 4. RAG Content Setup (AWS & Whisper)

We have migrated to an AWS-native RAG pipeline.

1.  **Install Ingestion Dependencies**
    You need `yt-dlp` (Python) installed on your system.
    ```bash
    # Install Node deps
    pnpm add -w -D openai dotenv @opensearch-project/opensearch @aws-sdk/credential-providers
    ```

2.  **Configure Environment**
    Update `.env.local` with your keys:
    ```env
    OPENAI_API_KEY=sk-...
    OPENSEARCH_ENDPOINT=https://<id>.<region>.aoss.amazonaws.com
    ```
    *(Note: You get the OpenSearch Endpoint after deploying the CDK stack)*

3.  **Run Playlist Ingestion**
    This script downloads audio (yt-dlp), transcribes (Whisper), and indexes to AWS.
    ```bash
    npx tsx scripts/ingest-playlist.ts "https://www.youtube.com/playlist?list=..."
    ```

4.  **Deploy Seed Content (PDFs/Internal Docs)**
    This pushes your pre-computed `content/seed/*.json` files to AWS.
    ```bash
    npx tsx scripts/deploy-rag-content.ts
    ```

## 5. Deployment (Infra)

Deploy the infrastructure including the new OpenSearch Serverless collection:

```bash
pnpm cdk:deploy Retiestrong-Rag-dev
pnpm cdk:deploy Retiestrong-Api-dev
```

## 5. Running Locally

Start the development server (Frontend + API Gateway + Database):

```bash
pnpm dev
```

> **Note**: You do **NOT** need to build the frontend (e.g., `pnpm build`) manually for development. The `dev` command starts the Next.js development server which compiles code on-the-fly.

*   **Web App**: [http://localhost:3000](http://localhost:3000)
*   **API Gateway**: Running locally on port 3001 (proxied via Next.js)

## 6. Troubleshooting

### "npm error code EUNSUPPORTEDPROTOCOL"
*   **Cause**: You tried to run `npm install`.
*   **Fix**: Delete `node_modules` and `package-lock.json` (if created), and run `pnpm install`.

### "Bedrock Exception / Access Denied"
*   **Cause**: Your AWS CLI profile in the terminal does not have Bedrock model access enabled in the AWS Console.
*   **Fix**: Go to AWS Console > Bedrock > Model Access and request access for **Titan Embeddings V2** and **Claude 3 Sonnet**.

### "fetch failed" during ingestion
*   **Cause**: Network firewall blocking YouTube or AWS endpoints.
*   **Fix**: Run on a non-restricted network.

### "Port 3000 already in use"
*   **Cause**: A previous dev server process is still running.
*   **Command**: Find and kill the process:
    ```bash
    # Check what is running on port 3000
    lsof -i :3000
    
    # Kill process by PID
    kill -9 <PID>
    
    # One-liner to kill process on port 3000
    lsof -t -i:3000 | xargs kill -9
    ```
