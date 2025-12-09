# Quiz Submission Debugging Guide

## Common Issues and Solutions

### Issue 1: Frontend hitting AWS instead of localhost

**Symptom**: Quiz submission fails with generic errors, but test script works against localhost.

**Solution**: 
1. Check `apps/web/.env.local` (or `.env`) for `NEXT_PUBLIC_API_URL`
2. If it's set to AWS URL (e.g., `https://y9iliioekl.execute-api.us-east-2.amazonaws.com/dev`), temporarily change it to:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```
3. Restart the Next.js dev server: `pnpm dev` (or `pnpm dev:web`)

**Verify**: Check browser DevTools → Network tab. The request should go to `http://localhost:3001/motivation/quiz/submit` (via Next.js API route).

### Issue 2: Payload shape mismatch

**Symptom**: 400 Bad Request with validation errors.

**Expected payload format**:
```json
{
  "userId": "string",
  "answers": [
    { "questionId": "q1", "value": 4 },
    { "questionId": "q2", "value": 3 },
    ...
  ]
}
```

**Requirements**:
- `userId`: string (required)
- `answers`: array of 10-15 objects (required)
- Each answer: `{ questionId: string, value: number }` where value is 1-5

**Check**:
- Browser DevTools → Network → Request payload
- Ensure `value` is a number, not a string
- Ensure you have 10-15 answers

### Issue 3: Lambda environment variables missing

**Symptom**: 500 Internal Server Error with "CONFIGURATION_ERROR" or DynamoDB errors.

**Required Lambda environment variables**:
- `DYNAMO_TABLE_USERS` (or `USERS_TABLE_NAME` as fallback)
- `AWS_REGION` (now set automatically by CDK)

**Check**:
1. AWS Console → Lambda → Your function → Configuration → Environment variables
2. CloudWatch Logs for the function - should show which env vars are available
3. If missing, redeploy with CDK: `pnpm cdk:deploy`

**Note**: The handler now logs available env vars when `DYNAMO_TABLE_USERS` is missing.

### Issue 4: Wrong AWS region

**Symptom**: DynamoDB errors like "ResourceNotFoundException" even though table exists.

**Solution**: 
- CDK now sets `AWS_REGION` in Lambda environment variables
- Handler defaults to the region from env var or Lambda context
- If you deployed to a different region, update the CDK stack or redeploy

## Quick Diagnostic Steps

1. **Test against localhost first**:
   ```bash
   # In apps/web/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```
   Restart dev server and try quiz submission.

2. **If localhost works but AWS doesn't**:
   - Check Lambda CloudWatch logs
   - Verify Lambda has `DYNAMO_TABLE_USERS` env var
   - Verify table name matches what's in DynamoDB
   - Check IAM permissions for Lambda to access DynamoDB

3. **If both fail**:
   - Check browser DevTools → Network → Request/Response
   - Verify payload format matches schema
   - Check API Gateway logs (if using AWS)
   - Check local server logs (if using localhost)

4. **Test with script**:
   ```bash
   # Test against localhost
   API_URL=http://localhost:3001 node test-quiz-submit.js <userId>
   
   # Test against AWS
   API_URL=https://y9iliioekl.execute-api.us-east-2.amazonaws.com/dev node test-quiz-submit.js <userId>
   ```

## Recent Fixes Applied

1. ✅ Added `AWS_REGION` to Lambda environment variables in CDK
2. ✅ Improved error logging in handler (shows available env vars)
3. ✅ Added logging in Next.js API route (shows which API URL is used)
4. ✅ Enhanced payload validation logging (shows types and structure)

## Environment Variable Reference

### Frontend (Next.js)
- `NEXT_PUBLIC_API_URL`: API Gateway URL (default: `http://localhost:3001`)

### Backend Lambda
- `DYNAMO_TABLE_USERS`: DynamoDB table name (required)
- `AWS_REGION`: AWS region (set by CDK, default: `us-east-1`)
- `STAGE`: Deployment stage (dev/staging/prod)
- `NODE_ENV`: Node environment (development/production)

### Local Development (api-gateway)
- `USERS_TABLE_NAME` or `DYNAMO_TABLE_USERS`: DynamoDB table name
- `AWS_REGION`: AWS region (default: `us-east-2` for local)
- Set in `apps/api-gateway/.env` file

