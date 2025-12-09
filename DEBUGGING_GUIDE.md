# Debugging Guide - Quiz Submission Issues

## Understanding the Logs

### Configuration Output (Not an Error!)
When you see output like:
```
📝 Configuration:
   USERS_TABLE_NAME: retire-strong-users-dev
   DYNAMO_TABLE_USERS: ❌ NOT SET (fallback)
   Using table: retire-strong-users-dev
   AWS_REGION: us-east-2
```

**This is NOT an error!** This is just startup information showing:
- ✅ Your environment variables are configured correctly
- ✅ The server knows which DynamoDB table to use
- ✅ The AWS region is set

### Finding the Actual Error

When a quiz submission fails, look for these log patterns in your API server terminal:

#### 1. Request Logs
```
[2024-12-04T...] POST /motivation/quiz/submit [req-...]
Request body: { "userId": "...", "answers": [...] }
```

#### 2. Error Logs (Look for these!)
```
[req-...] ❌ ERROR after XXXms
[req-...] Error type: Error
[req-...] Error message: <THE ACTUAL ERROR>
[req-...] Error stack: <STACK TRACE>
```

#### 3. Specific Error Patterns

**DynamoDB Undefined Values:**
```
⚠️  DynamoDB undefined values error detected!
Error message: Pass options.removeUndefinedValues=true...
```

**Table Not Found:**
```
⚠️  DynamoDB table not found!
Error message: ResourceNotFoundException...
```

**Access Denied:**
```
⚠️  AWS credentials or permissions issue!
Error message: AccessDeniedException...
```

## Getting Full Error Messages

### From API Server Terminal (Local Development)

1. **Check the terminal where you ran `pnpm --filter api-gateway dev`**
2. Look for lines starting with `[req-...] ❌ ERROR`
3. Copy the full error message, stack trace, and request ID

### From Browser Console (Frontend)

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for errors starting with:
   - `Quiz submission error`
   - `Quiz submission response status: 500`
4. Expand the error objects to see full details

### From Next.js API Route Logs

1. Check the terminal where you ran `pnpm --filter web dev`
2. Look for errors from `/api/motivation/submit`
3. These will show if the issue is in the Next.js proxy layer

## Getting AWS CloudWatch Logs (Production)

If you're running in AWS (not local dev), here's how to get logs:

### Option 1: AWS Console

1. Go to **AWS CloudWatch Console**
2. Click **Log groups** in the left sidebar
3. Find log groups matching:
   - `/aws/lambda/retire-strong-api-gateway-*`
   - `/aws/lambda/SubmitQuizFunction-*` (or similar)
4. Click on the log group
5. Click on the most recent log stream
6. Search for your request ID or error messages

### Option 2: AWS CLI

```bash
# List log groups
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/retire-strong"

# Get recent logs from a specific function
aws logs tail /aws/lambda/retire-strong-api-gateway-SubmitQuizFunction-XXXXX --follow

# Get logs from last 1 hour
aws logs tail /aws/lambda/retire-strong-api-gateway-SubmitQuizFunction-XXXXX --since 1h
```

### Option 3: SAM CLI (If using SAM Local)

```bash
# View logs from SAM local
sam logs -n SubmitQuizFunction --stack-name retire-strong-api --tail
```

## Common Issues and Solutions

### Issue: "removeUndefinedValues" Error

**Symptoms:**
```
Error: Pass options.removeUndefinedValues=true to remove undefined values
```

**Solution:**
1. Make sure domain-core is rebuilt:
   ```bash
   pnpm --filter @retire-strong/domain-core build
   ```
2. Restart API server completely
3. Verify the fix is in `packages/domain-core/dist/repos/UserRepo.js`

### Issue: "ResourceNotFoundException"

**Symptoms:**
```
Error: ResourceNotFoundException: Requested resource not found
```

**Solution:**
1. Check `.env` file in `apps/api-gateway/`:
   ```
   USERS_TABLE_NAME=retire-strong-users-dev
   AWS_REGION=us-east-2
   ```
2. Verify table exists:
   ```bash
   aws dynamodb describe-table --table-name retire-strong-users-dev --region us-east-2
   ```

### Issue: "AccessDeniedException"

**Symptoms:**
```
Error: AccessDeniedException: User is not authorized
```

**Solution:**
1. Check AWS credentials:
   ```bash
   aws sts get-caller-identity
   ```
2. Verify IAM permissions for DynamoDB access
3. Check if using correct AWS profile

### Issue: Frontend Shows Generic Error

**Symptoms:**
- Frontend shows "Failed to submit quiz" but no details
- Browser console shows 500 error

**Solution:**
1. Check API server terminal for detailed error logs
2. Check Next.js API route logs (`/api/motivation/submit`)
3. Look for the `[req-...] ❌ ERROR` pattern in API server logs

## Testing the Flow

### Test Direct API Call
```bash
node test-quiz-submit.js <your-user-id>
```

This bypasses the frontend and tests the API directly.

### Test with curl
```bash
curl -X POST http://localhost:3001/motivation/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "answers": [
      {"questionId": "q1", "value": 4},
      {"questionId": "q2", "value": 3}
      ...
    ]
  }'
```

### Check API Server is Running
```bash
curl http://localhost:3001/health
```

Should return: `{"status":"ok"}`

## Getting Help

When reporting issues, include:

1. **Full error message** from API server terminal
2. **Request ID** (from `[req-...]` logs)
3. **Stack trace** (if available)
4. **Request body** (sanitize any sensitive data)
5. **Environment**: Local dev or AWS?
6. **Recent changes**: Did you rebuild packages? Restart servers?

Example format:
```
Error: [req-abc123] ❌ ERROR after 234ms
Error message: Failed to save motivation profile: ResourceNotFoundException
Stack trace: [full stack trace]
Request body: { "userId": "...", "answers": [...] }
```

