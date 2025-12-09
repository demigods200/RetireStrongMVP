# Frontend Error Debugging Guide

## How to See Full Error Details When Quiz Submission Fails

### Method 1: On-Screen Error Display (Easiest)

When a quiz submission fails, you'll now see a **detailed error box** at the top of the quiz page:

1. **Error Message** - The main error message
2. **Error Code** - The specific error code (e.g., `INTERNAL_ERROR`, `NETWORK_ERROR`)
3. **Request ID** - If available, for tracking the request in logs
4. **"Show Details" Button** - Click to expand and see:
   - Full error details (JSON)
   - Stack trace (if available)
   - Tips for debugging

**Example:**
```
❌ Error: Failed to save motivation profile: ResourceNotFoundException
Error Code: INTERNAL_ERROR
Request ID: req-1234567890-abc123

▶ Show Details
```

Click "Show Details" to see the full error information.

### Method 2: Browser Console (Most Detailed)

The browser console contains the **most comprehensive error logs**:

1. **Open Browser DevTools:**
   - Press `F12` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)
   - Or right-click → "Inspect" → "Console" tab

2. **Look for Error Logs:**
   When an error occurs, you'll see logs like:
   ```
   ============================================================
   ❌ QUIZ SUBMISSION ERROR
   ============================================================
   Response Status: 500 Internal Server Error
   Response OK: false
   Error Code: INTERNAL_ERROR
   Error Message: Failed to save motivation profile: ...
   Request ID: req-1234567890-abc123
   Full Error Object: { ... }
   Full Response Data: { ... }
   Stack Trace: ...
   ============================================================
   ```

3. **Expand Objects:**
   - Click the `▶` arrows to expand nested objects
   - Copy the full error details for debugging

### Method 3: Network Tab (Request/Response)

See the actual HTTP request and response:

1. **Open Browser DevTools** → **Network** tab
2. **Submit the quiz**
3. **Find the request** to `/api/motivation/submit`
4. **Click on it** to see:
   - **Request** tab: What was sent
   - **Response** tab: What was received
   - **Headers** tab: HTTP headers
   - **Preview** tab: Formatted JSON response

### Method 4: Next.js API Route Logs

Check the terminal where you're running the Next.js dev server:

```bash
# Look for logs like:
============================================================
❌ [Next.js API] Network error calling API Gateway
============================================================
API URL: http://localhost:3001
Error Type: TypeError
Error Message: Failed to fetch
...
```

### Method 5: API Gateway Server Logs

Check the terminal where you're running the API Gateway server:

```bash
# Look for logs like:
[2024-12-04T...] POST /motivation/quiz/submit [req-abc123]
Request body: { "userId": "...", "answers": [...] }

[req-abc123] ❌ ERROR after 234ms
[req-abc123] Error type: Error
[req-abc123] Error message: <THE ACTUAL ERROR>
[req-abc123] Error stack: <FULL STACK TRACE>
```

## Understanding Error Codes

### `NETWORK_ERROR`
- **Meaning:** Can't connect to API Gateway
- **Check:** Is API server running on port 3001?
- **Solution:** Start API server: `cd apps/api-gateway && pnpm dev`

### `PARSE_ERROR`
- **Meaning:** API returned invalid JSON
- **Check:** API server logs for what it actually returned
- **Solution:** Check API server is working correctly

### `INTERNAL_ERROR`
- **Meaning:** Something went wrong in the backend
- **Check:** API Gateway server logs for details
- **Solution:** Look at the error details/stack trace

### `VALIDATION_ERROR`
- **Meaning:** Request data doesn't match schema
- **Check:** Are all questions answered? (10-15 answers required)
- **Solution:** Complete the quiz properly

### `USER_NOT_FOUND`
- **Meaning:** User doesn't exist in database
- **Check:** Did you complete onboarding first?
- **Solution:** Complete onboarding before taking quiz

### `CONFIGURATION_ERROR`
- **Meaning:** Server configuration issue
- **Check:** Environment variables set correctly?
- **Solution:** Check `.env` file in `apps/api-gateway/`

## Quick Debugging Checklist

When quiz submission fails:

1. ✅ **Check on-screen error** - Click "Show Details"
2. ✅ **Open browser console** (F12) - Look for detailed logs
3. ✅ **Check Network tab** - See request/response
4. ✅ **Check Next.js logs** - Terminal running `pnpm --filter web dev`
5. ✅ **Check API Gateway logs** - Terminal running `pnpm --filter api-gateway dev`
6. ✅ **Copy error details** - Share with developer if needed

## Sharing Error Information

When reporting an error, include:

1. **Error message** from on-screen display
2. **Error code** (e.g., `INTERNAL_ERROR`)
3. **Request ID** (if shown)
4. **Full error details** (from "Show Details" or console)
5. **Stack trace** (if available)
6. **Screenshot** of the error display
7. **Browser console logs** (copy/paste)

## Example Error Report

```
Error: Failed to save motivation profile: ResourceNotFoundException
Error Code: INTERNAL_ERROR
Request ID: req-1234567890-abc123

Error Details:
{
  "code": "INTERNAL_ERROR",
  "message": "Failed to save motivation profile: ResourceNotFoundException: Requested resource not found",
  "details": "...",
  "stack": "..."
}

Browser Console shows:
[Full console logs here]

API Gateway logs show:
[Full server logs here]
```

