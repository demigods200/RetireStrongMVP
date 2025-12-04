# Testing Commands - Motivation Quiz Flow

## Step 1: Build All Packages

```bash
pnpm -r build
```

This builds all TypeScript packages (motivation-engine, shared-api, domain-core, etc.)

---

## Step 2: Start API Gateway (Terminal 1)

```bash
cd apps/api-gateway
pnpm dev
```

**Expected output:**
```
🚀 API Gateway running on http://localhost:3001
📋 Available endpoints:
   GET  /health
   GET  /motivation/quiz
   POST /motivation/quiz/submit
   POST /users/onboarding
```

**Keep this terminal running!**

---

## Step 3: Start Web App (Terminal 2)

Open a **new terminal** and run:

```bash
cd apps/web
pnpm dev
```

**Expected output:**
```
▲ Next.js 15.5.7
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

**Keep this terminal running!**

---

## Step 4: Verify Services Are Running

Open a **new terminal** and test:

```bash
# Test API Gateway health
curl http://localhost:3001/health

# Test quiz questions endpoint
curl http://localhost:3001/motivation/quiz
```

**Expected:**
- Health endpoint returns: `{"status":"ok","timestamp":"..."}`
- Quiz endpoint returns JSON with 12 questions

---

## Step 5: Test in Browser

1. **Open your browser**
2. **Navigate to:** `http://localhost:3000/motivation/quiz`
3. **Complete the quiz:**
   - Answer all 12 questions
   - Use Previous/Next buttons
   - Click "Complete" on the last question
4. **View persona reveal screen**
5. **Check persona widget in Navbar**

---

## Quick Test Script (All-in-One)

If you want to test everything at once:

```bash
# Terminal 1: Build and start API Gateway
cd apps/api-gateway
pnpm build
pnpm dev

# Terminal 2: Start Web App
cd apps/web
pnpm dev

# Terminal 3: Test endpoints
sleep 5
curl http://localhost:3001/health
curl http://localhost:3001/motivation/quiz | head -50
```

---

## Troubleshooting Commands

### Check if ports are in use:
```bash
# Windows
netstat -ano | findstr :3001
netstat -ano | findstr :3000

# Kill process if needed (Windows)
taskkill /PID <process_id> /F
```

### Check API Gateway logs:
Look at Terminal 1 for any error messages

### Check Web App logs:
Look at Terminal 2 for any error messages

### Test API directly:
```bash
# Health check
curl http://localhost:3001/health

# Get quiz questions
curl http://localhost:3001/motivation/quiz

# Test quiz submission (example)
curl -X POST http://localhost:3001/motivation/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-123","answers":[{"questionId":"q1","value":1}]}'
```

---

## Complete Testing Flow

1. ✅ Build packages: `pnpm -r build`
2. ✅ Start API Gateway: `cd apps/api-gateway && pnpm dev` (Terminal 1)
3. ✅ Start Web App: `cd apps/web && pnpm dev` (Terminal 2)
4. ✅ Verify API: `curl http://localhost:3001/health`
5. ✅ Open browser: `http://localhost:3000/motivation/quiz`
6. ✅ Complete quiz flow
7. ✅ Verify persona widget appears in Navbar

---

## Notes

- **Keep both terminals running** while testing
- **API Gateway** must be running before the web app can fetch questions
- **Web App** must be running to test the UI
- Both services run in the **foreground** (you'll see logs)
- Press `Ctrl+C` in each terminal to stop the services

