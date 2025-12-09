# Quiz Submission Testing Guide

## Prerequisites

Before testing the quiz submission, ensure:

1. **User exists in DynamoDB** - The user must have completed signup/login
2. **Onboarding completed** (optional but recommended) - User should have completed onboarding
3. **Frontend is running** - Next.js dev server should be running
4. **API URL configured** - `NEXT_PUBLIC_API_URL` should point to your AWS API Gateway

## Testing Methods

### Method 1: Browser Testing (Recommended - End-to-End)

This tests the complete flow from frontend to backend.

#### Steps:

1. **Start the frontend** (if not already running):
   ```bash
   pnpm dev:web
   # or
   pnpm dev
   ```

2. **Navigate to the quiz page**:
   - Open browser: `http://localhost:3000`
   - Login or signup if needed
   - Complete onboarding if prompted
   - Navigate to `/motivation/quiz` or use the app navigation

3. **Complete the quiz**:
   - Answer all questions (10-15 questions required)
   - Click "Complete" on the last question
   - Watch for success/error messages

4. **Check the result**:
   - Should redirect to `/motivation/result`
   - Should display your motivation profile and coach persona

5. **Check browser console** (F12 → Console tab):
   - Look for any error messages
   - Check the detailed logs we added

6. **Check Network tab** (F12 → Network tab):
   - Find the `/api/motivation/submit` request
   - Check request payload
   - Check response status and body

#### What to Look For:

✅ **Success indicators:**
- Quiz submits without errors
- Redirects to result page
- Shows motivation profile and persona
- No errors in browser console

❌ **Failure indicators:**
- Error message displayed in UI
- 400/500 status code in Network tab
- Error details in browser console
- No redirect to result page

---

### Method 2: Direct API Testing (Using Test Script)

This tests the API directly, bypassing the frontend.

#### Steps:

1. **Get a valid userId**:
   - Option A: From browser localStorage after login
     - Open browser DevTools (F12)
     - Go to Application/Storage → Local Storage
     - Find `userId` value
   - Option B: From DynamoDB
     - Check `retire-strong-users-dev` table
     - Get any `userId` from an existing user
   - Option C: Use a test user ID (if you know one)

2. **Run the test script**:
   ```bash
   # Test against AWS API
   API_URL=https://y9iliioekl.execute-api.us-east-2.amazonaws.com/dev \
   node test-quiz-submit.js <userId>
   
   # Example:
   API_URL=https://y9iliioekl.execute-api.us-east-2.amazonaws.com/dev \
   node test-quiz-submit.js us-east-2_abc123xyz
   ```

3. **Check the output**:
   - Should show success response
   - Should display profile and persona data
   - If error, check the error details

#### What to Look For:

✅ **Success:**
```
✅ Quiz submission successful!
Profile: { primaryMotivator: "...", ... }
Persona: { name: "...", ... }
```

❌ **Common Errors:**
- `USER_NOT_FOUND` - User doesn't exist in DynamoDB
- `VALIDATION_ERROR` - Payload format issue
- `CONFIGURATION_ERROR` - Lambda env vars missing
- `500 Internal Server Error` - Check CloudWatch logs

---

### Method 3: Check CloudWatch Logs

If there are errors, check the Lambda logs.

#### Steps:

1. **Open AWS Console** → CloudWatch → Log groups

2. **Find the log group**:
   - `/aws/lambda/retire-strong-submit-quiz-dev`

3. **Check recent logs**:
   - Look for your request
   - Check for error messages
   - Look for the detailed logs we added:
     - "Parsed request body"
     - "Body type check"
     - "Initializing services with table"
     - "Environment check"

4. **Look for specific errors**:
   - `USERS_TABLE_NAME or DYNAMO_TABLE_USERS environment variable is not set`
   - `User with ID ... not found`
   - `Validation error details`
   - DynamoDB errors (ResourceNotFoundException, AccessDeniedException)

---

## Troubleshooting

### Error: "User not found"

**Cause:** User doesn't exist in DynamoDB or userId is incorrect.

**Solution:**
1. Verify user exists in `retire-strong-users-dev` table
2. Check userId is correct (from localStorage or JWT token)
3. Complete onboarding first (creates user record)

### Error: "Validation error"

**Cause:** Payload doesn't match schema.

**Check:**
- `userId` is a string
- `answers` is an array
- Each answer has `questionId` (string) and `value` (number 1-5)
- 10-15 answers total

### Error: "CONFIGURATION_ERROR"

**Cause:** Lambda missing environment variables.

**Solution:**
1. Check Lambda function configuration in AWS Console
2. Verify `DYNAMO_TABLE_USERS` is set
3. Redeploy if needed: `pnpm cdk:deploy`

### Error: Network/CORS error

**Cause:** API Gateway CORS or network issue.

**Check:**
- API Gateway is deployed and accessible
- CORS headers are correct
- Network connectivity

---

## Expected Behavior

### Successful Flow:

1. User answers all quiz questions
2. Frontend sends POST to `/api/motivation/submit`
3. Next.js API route forwards to AWS API Gateway
4. Lambda processes request:
   - Validates payload
   - Calculates motivation profile
   - Picks coach persona
   - Saves to DynamoDB
   - Returns response
5. Frontend receives success response
6. Redirects to result page
7. Displays profile and persona

### Response Format:

```json
{
  "success": true,
  "data": {
    "profile": {
      "primaryMotivator": "achievement",
      "secondaryMotivators": ["autonomy", "purpose"],
      "scores": { ... }
    },
    "persona": {
      "name": "The Mentor",
      "description": "...",
      "tone": { ... }
    }
  }
}
```

---

## Quick Test Checklist

- [ ] Frontend is running
- [ ] User is logged in
- [ ] User has completed onboarding (optional)
- [ ] Navigate to `/motivation/quiz`
- [ ] Answer all questions
- [ ] Submit quiz
- [ ] Check for success/error in UI
- [ ] Check browser console for errors
- [ ] Check Network tab for request/response
- [ ] Verify redirect to result page
- [ ] Check CloudWatch logs if errors occur

---

## Next Steps After Testing

If quiz submission works:
- ✅ Test with different answer combinations
- ✅ Verify persona changes based on answers
- ✅ Check that profile is saved to DynamoDB
- ✅ Test error scenarios (invalid answers, missing userId, etc.)

If quiz submission fails:
- Check CloudWatch logs for detailed error
- Verify all prerequisites are met
- Review the error message and fix accordingly
- Test with the script to isolate frontend vs backend issues

