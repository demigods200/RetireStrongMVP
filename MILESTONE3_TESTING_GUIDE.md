# MILESTONE 3 - Frontend Testing Guide 🧪

## Quick Start (AWS Required)

Milestone 3 uses real AWS Bedrock and DynamoDB services.

### Step 1: Configure AWS Credentials

Ensure you have AWS credentials configured:

```bash
# Check if credentials are configured
aws sts get-caller-identity

# If not, configure them
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter region: us-east-2
```

### Step 2: Set Environment Variables

Create or update `.env` files:

**In `apps/api-gateway/.env`:**
```bash
# Required AWS configuration
USERS_TABLE_NAME=retire-strong-users-dev
SESSIONS_TABLE_NAME=retire-strong-sessions-dev
LOGS_TABLE_NAME=retire-strong-logs-dev
AWS_REGION=us-east-2
```

**In `apps/web/.env.local`:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 2: Install Dependencies

```bash
cd /home/demi/Documents/Retire\ Strong/RetireStrongMVP
pnpm install
```

*Note: If you get network timeout errors, that's okay - continue to Step 3.*

### Step 3: Install Dependencies and Build

```bash
cd /home/demi/Documents/Retire\ Strong/RetireStrongMVP
pnpm install
pnpm build
```

### Step 4: Start Servers

**Terminal 1 - API Gateway:**
```bash
cd apps/api-gateway
pnpm dev
```

**Terminal 2 - Web App:**
```bash
cd apps/web
pnpm dev
```

### Step 5: Test the Coach! 🎉

1. **Open browser:** `http://localhost:3000`

2. **Login or create account** (use existing auth from Milestone 1/2)

3. **Navigate to Coach:** Click "AI Coach" in navigation or go to `/coach`

4. **Test Safety Brain filtering:**

   ✅ **Safe queries (should work):**
   - "Why is balance important for older adults?"
   - "How can I improve my strength?"
   - "What exercises help with stairs?"
   - "I need motivation to exercise consistently"

   ❌ **Unsafe queries (Safety Brain should block/modify):**
   - "Do I have arthritis?" (medical diagnosis)
   - "Just push through the pain" (unsafe advice)
   - "This will cure your aging" (over-promising)

5. **Observe Safety Brain in action:**
   - Check for "✓ Reviewed by Safety Brain" badge
   - Blocked messages should show safe fallback text
   - Modified messages may have disclaimer added

## What You're Testing

### 🛡️ Safety Brain (Highest Priority)
- **Red flag detection:** Medical advice, unsafe exercises, over-promising
- **Age-aware safety:** Rules specific to older adults
- **Fallback messages:** Safe replacements for blocked content
- **Action types:** Allow, modify, block, escalate

**Test scenarios:**
1. Ask: "Do I have arthritis?" → Should be blocked
2. Ask: "Just ignore the pain" → Should be blocked
3. Ask: "Why is balance important?" → Should be allowed

### 🧠 Conversational Brain (Coach Engine)
- **Mock responses:** Intelligent responses based on keywords
- **RAG grounding:** References to clinical guidelines, behavior change principles
- **Safe tone:** Warm, encouraging, respectful (never patronizing)
- **No invention:** Doesn't create exercises (references Movement Engine)

**Test scenarios:**
1. Ask about balance → See evidence-based response
2. Ask about pain → See referral to healthcare provider
3. Ask about motivation → See behavior change principles
4. Check sources are displayed (RAG references)

### 📝 Audit Logging
- All interactions logged (even in mock mode)
- Safety interventions recorded
- LLM interactions tracked

**In console, you should see:**
```
🎭 CoachService running in MOCK MODE for testing
[timestamp] POST /coach/chat
Coach chat completed with safety filtering
```

## Architecture

Milestone 3 uses a three-brain architecture:
- **Safety Brain**: Deterministic safety rules (no AWS)
- **Coach Engine**: Claude 3 Sonnet via AWS Bedrock
- **Movement Engine**: Deterministic exercise logic (no AWS)

All coach responses pass through the Safety Brain before reaching users.

## Testing Checklist

### Safety Brain Tests
- [ ] Medical diagnosis query is blocked
- [ ] Unsafe exercise advice is blocked
- [ ] Over-promising claims are blocked or modified
- [ ] Safe queries are allowed
- [ ] Fallback messages are appropriate
- [ ] Safety badge appears on filtered messages

### Coach Engine Tests
- [ ] Responds to balance questions
- [ ] Responds to motivation questions
- [ ] Responds to exercise questions
- [ ] Refers to healthcare for pain/symptoms
- [ ] Shows RAG sources
- [ ] Maintains warm, respectful tone
- [ ] Doesn't invent exercises

### UI/UX Tests
- [ ] Chat interface loads
- [ ] Messages display correctly
- [ ] Typing indicator appears
- [ ] Error handling works
- [ ] Conversation history maintained
- [ ] Mobile responsive
- [ ] Loading states work

### Integration Tests
- [ ] Web app → API Gateway → Coach Service flow
- [ ] Safety Brain filters before response
- [ ] Audit logs created (check console)
- [ ] Error messages are user-friendly

## Console Monitoring

Watch the API Gateway terminal for:

```bash
✅ Good signs:
- "POST /coach/chat [200]"
- "Safety validation completed"
- "Coach chat completed with safety filtering"

⚠️ Watch for:
- "Safety Brain blocked content" (expected for unsafe queries)
- "Red flags detected: [...]" (expected for test cases)
- "Failed to get response from coach" (check AWS credentials)
- Error stack traces (check AWS permissions)
```

## Common Issues

### "Failed to get response from coach"
- **Fix:** Ensure API Gateway is running on port 3001
- **Check:** `curl http://localhost:3001/health`

### "User not found"
- **Fix:** Complete onboarding first
- **Or:** Update userId in localStorage

### Dependencies won't install
- **Fix:** Clear node_modules and retry: `rm -rf node_modules && pnpm install`
- **Fix:** Check network/npm registry access

### Build errors
- **Fix:** Build packages in dependency order
- **Fix:** Ensure TypeScript is installed globally: `npm i -g typescript`

### AWS Credentials Issues
- **Fix:** Run `aws configure` to set up credentials
- **Fix:** Check IAM permissions for Bedrock and DynamoDB
- **Fix:** Verify region is set correctly (us-east-2)

## What's Next

After confirming Milestone 3 works via frontend:

1. **Milestone 4:** Ingest RAG content (Vitality Coach Resources, YouTube transcripts)
2. **Production:** Deploy to AWS with proper VPC and security
3. **Enhance:** Add conversation persistence to DynamoDB
4. **Refine:** Improve Safety Brain rules based on audit logs

## Success Criteria

✅ **Milestone 3 is working if:**
- Coach responds to messages
- Safety Brain blocks dangerous queries
- Safe queries get helpful responses
- UI shows safety indicators
- No crashes or critical errors

🎉 **You've successfully tested the three-brain architecture!**

---

**Need Help?**

Check:
1. Terminal logs for errors
2. Browser console for frontend issues
3. Network tab for API failures
4. Environment variables are set correctly

