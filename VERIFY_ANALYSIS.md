# Verification of Analysis

## ✅ Analysis is MOSTLY CORRECT - Here's the verification:

### 1. **URL Difference** ✅ CONFIRMED

**Test Script:**
```javascript
const API_URL = process.env.API_URL || "http://localhost:3001";
// Calls: http://localhost:3001/motivation/quiz/submit
```

**Frontend (Next.js API Route):**
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
// Calls: ${apiUrl}/motivation/quiz/submit
```

**Key Finding:** 
- ✅ If `NEXT_PUBLIC_API_URL` is NOT set → Frontend hits `localhost:3001` (same as script)
- ⚠️ If `NEXT_PUBLIC_API_URL` IS set → Frontend hits AWS Lambda (different from script)

**Action:** Check `apps/web/.env.local` for `NEXT_PUBLIC_API_URL`

### 2. **Payload Format** ✅ VERIFIED - MATCHES

**Test Script:**
```javascript
{
  userId: userId,
  answers: [
    { questionId: "q1", value: 4 },
    { questionId: "q2", value: 3 },
    ...
  ]
}
```

**Frontend:**
```typescript
{
  userId,
  answers: answerArray.map(([questionId, value]) => ({
    questionId,
    value: Number(value), // ✅ Ensures number type
  }))
}
```

**Result:** ✅ Payload format is IDENTICAL - both send `{ userId, answers: [{ questionId, value }] }`

### 3. **Path Difference** ❌ NOT AN ISSUE

**Test Script:** `/motivation/quiz/submit` ✅
**Frontend:** `/api/motivation/submit` → proxies to `/motivation/quiz/submit` ✅

**Result:** ✅ Path is correct (Next.js route proxies correctly)

### 4. **Lambda Environment Variables** ⚠️ LIKELY ISSUE

**If frontend is hitting AWS Lambda:**
- Lambda might be missing `USERS_TABLE_NAME` or `DYNAMO_TABLE_USERS`
- Lambda might have wrong table name
- Lambda might have wrong AWS region
- Lambda might not have DynamoDB permissions

## 🔍 How to Verify:

### Step 1: Check if Frontend is hitting AWS or Local

**Check Next.js terminal logs when you submit:**
```
[Next.js API] Raw response from API Gateway (500):
```

If the URL in the logs shows `https://y9iliioekl.execute-api.us-east-2.amazonaws.com` → **Frontend is hitting AWS**
If the URL shows `http://localhost:3001` → **Frontend is hitting local**

### Step 2: Check Environment Variables

**Check `apps/web/.env.local`:**
```bash
cat apps/web/.env.local | grep NEXT_PUBLIC_API_URL
```

If it shows AWS URL → That's why it's failing
If it's not set or shows localhost → Different issue

### Step 3: Check API Gateway Server Logs

**If hitting localhost:3001:**
- Check the API Gateway server terminal
- Look for `[req-...] ❌ ERROR` logs
- This will show the actual error

**If hitting AWS:**
- Check CloudWatch logs for the Lambda function
- Look for error messages about missing env vars or DynamoDB errors

## 🎯 Most Likely Scenario:

Based on the analysis:

1. **Frontend has `NEXT_PUBLIC_API_URL` set to AWS** → Hitting deployed Lambda
2. **Test script uses localhost** → Hitting local server
3. **Lambda is missing environment variables** → Generic 500 error
4. **Local server has correct env vars** → Works fine

## ✅ Solution:

### Option A: Test Frontend Against Local Server

1. **Remove or comment out `NEXT_PUBLIC_API_URL` in `apps/web/.env.local`**
2. **Restart Next.js dev server**
3. **Try quiz submission again**

### Option B: Fix Lambda Environment Variables

1. **Check CDK stack** (`packages/infra-cdk/lib/api-stack.ts`)
2. **Verify Lambda has:**
   - `USERS_TABLE_NAME` or `DYNAMO_TABLE_USERS`
   - `AWS_REGION`
   - DynamoDB permissions
3. **Redeploy if needed**

### Option C: Add Better Error Logging

The enhanced logging we added will show:
- Which URL is being called
- Full error details from API Gateway
- This will confirm the issue

## 📊 Verification Checklist:

- [ ] Check `apps/web/.env.local` for `NEXT_PUBLIC_API_URL`
- [ ] Check Next.js terminal for which URL is being called
- [ ] Check API Gateway terminal (if local) for error logs
- [ ] Check CloudWatch logs (if AWS) for Lambda errors
- [ ] Compare payload format (already verified ✅)
- [ ] Verify Lambda environment variables (if using AWS)

