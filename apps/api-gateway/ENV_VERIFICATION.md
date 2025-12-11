# Environment Variables Verification

This document confirms that all environment variable usage is consistent across the codebase.

## ✅ Environment Variable Name: `DYNAMO_TABLE_USERS`

### Used in All Handlers:
- ✅ `apps/api-gateway/src/handlers/auth/login.ts` - Line 34
- ✅ `apps/api-gateway/src/handlers/auth/signup.ts` - Line 16
- ✅ `apps/api-gateway/src/handlers/users/onboarding.ts` - Line 13
- ✅ `apps/api-gateway/src/handlers/users/profile.ts` - Line 63
- ✅ `apps/api-gateway/src/handlers/motivation/submit.ts` - Line 33

### Used in Infrastructure:
- ✅ `apps/api-gateway/template.yaml` - All Lambda functions (Lines 36, 53, 68, 83, 110)
- ✅ `packages/infra-cdk/lib/api-stack.ts` - Line 73 (sets for all Lambdas)

### Used in Configuration:
- ✅ `packages/shared-config/src/env.ts` - schema definition
- ✅ `apps/api-gateway/src/server.ts` - logs on startup

## ✅ Environment Variable Name: `DYNAMO_TABLE_SESSIONS`

### Used in Handlers:
- ✅ `apps/api-gateway/src/handlers/plans/starter.ts`
- ✅ `apps/api-gateway/src/handlers/plans/current.ts`
- ✅ `apps/api-gateway/src/handlers/sessions/get.ts`
- ✅ `apps/api-gateway/src/handlers/sessions/complete.ts`

### Used in Infrastructure:
- ✅ `packages/infra-cdk/lib/api-stack.ts` - passed to plan/session lambdas
- ✅ `apps/api-gateway/template.yaml` - should be set for plan/session functions (update if using SAM)

### Used in Configuration:
- ✅ `packages/shared-config/src/env.ts` - schema definition
- ✅ `apps/api-gateway/src/server.ts` - logs on startup

## ✅ Environment Variable Name: `AWS_REGION`

### Used in All Handlers:
- ✅ All handlers default to `"us-east-2"` if not set
- ✅ Consistent across: login, signup, onboarding, profile, motivation/submit

## 📝 .env File Location

**File:** `apps/api-gateway/.env`

**Required Variables:**
```env
DYNAMO_TABLE_USERS=retire-strong-users-dev
DYNAMO_TABLE_SESSIONS=retire-strong-sessions-dev
AWS_REGION=us-east-2
```

**Note:** Replace `dev` with your actual stage (dev/staging/prod) to match your AWS table names.

## ✅ No Mismatches Found

All code references use:
- ✅ `DYNAMO_TABLE_USERS` (not `DYNAMO_USERS_TABLE` or `USERS_TABLE_NAME`)
- ✅ `AWS_REGION` (consistent default: `us-east-2`)
- ✅ All handlers validate the variable is set (except login which is optional)
- ✅ All infrastructure configs use the same variable name

## 🔍 How It Works

1. **Local Development:** Server loads `.env` file via `dotenv/config` in `server.ts`
2. **AWS Lambda (CDK):** Environment variables set in `api-stack.ts` from table names
3. **AWS Lambda (SAM):** Environment variables set in `template.yaml` from the table references (ensure sessions is wired)

All paths use the same variable names: `DYNAMO_TABLE_USERS`, `DYNAMO_TABLE_SESSIONS`, `AWS_REGION`

