# Testing Step 1.1 - Local Dev Environment

## Quick Test Guide

### Step 1: Start the Web App

Open Terminal 1:
```bash
pnpm --filter web dev
```

Wait for: "Ready on http://localhost:3000"

### Step 2: Start the API Gateway (SAM Local)

Open Terminal 2:
```bash
cd apps/api-gateway
sam local start-api --port 3001
```

Wait for: "Running on http://127.0.0.1:3001"

**Note:** If you don't have AWS SAM CLI installed, you can:
- Install it: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
- OR test the handler directly (see alternative below)

### Step 3: Test the Services

1. **Web App:** Open http://localhost:3000
   - Should see: "Retire Strong MVP is running"

2. **Health Endpoint:** Open http://localhost:3001/health
   - Should see: `{"status":"ok","timestamp":"..."}`

## Alternative: Test Without SAM CLI

If SAM CLI is not installed, you can test the handler directly:

```bash
cd apps/api-gateway
node -e "const {handler} = require('./dist/handlers/health.js'); handler().then(r => console.log(JSON.stringify(r, null, 2)));"
```

## Troubleshooting

**Port 3000 already in use:**
- Kill the process: `lsof -ti:3000 | xargs kill` (Mac/Linux)
- Or change port in `apps/web/package.json`: `"dev": "next dev -p 3001"`

**Port 3001 already in use:**
- Change port in SAM command: `sam local start-api --port 3002`

**SAM CLI not found:**
- Install from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
- Or use Docker Compose (see SETUP.md)

**TypeScript errors:**
- Run `pnpm type-check` to see all errors
- Make sure all dependencies are installed: `pnpm install`

