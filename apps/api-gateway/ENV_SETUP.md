# Environment Variables Setup

For local development, create a `.env` file in the `apps/api-gateway/` directory with the following variables:

## Required Variables

```env
# DynamoDB Table Names
# Replace 'dev' with your actual stage (dev, staging, or prod)
DYNAMO_TABLE_USERS=retire-strong-users-dev
DYNAMO_TABLE_SESSIONS=retire-strong-sessions-dev

# AWS Region
AWS_REGION=us-east-2
```

## Optional Variables

```env
# Cognito Configuration (if using AWS Cognito)
COGNITO_USER_POOL_ID=your-user-pool-id
COGNITO_CLIENT_ID=your-client-id

# For DynamoDB Local (if using local DynamoDB)
AWS_ENDPOINT_URL=http://localhost:8000
```

## Table Names by Stage

Based on your CDK configuration, the table names follow this pattern:
- **users**: `retire-strong-users-<stage>`
- **sessions**: `retire-strong-sessions-<stage>`
- **checkins**: `retire-strong-checkins-<stage>`
- **logs**: `retire-strong-logs-<stage>`

## Quick Setup

1. Create `.env` file in `apps/api-gateway/`:
   ```bash
   cd apps/api-gateway
   echo "DYNAMO_TABLE_USERS=retire-strong-users-dev" > .env
   echo "DYNAMO_TABLE_SESSIONS=retire-strong-sessions-dev" >> .env
   echo "AWS_REGION=us-east-2" >> .env
   ```

2. Replace `dev` with your actual stage if different

3. Restart the API server:
   ```bash
   pnpm dev
   ```

The server will automatically load variables from the `.env` file.

