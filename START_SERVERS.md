# Quick Start Guide - Retire Strong MVP

## Starting Both Servers

### Terminal 1: API Gateway (Backend)
```bash
cd ~/Documents/Retire\ Strong/RetireStrongMVP/apps/api-gateway
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
   GET  /users/me
```

### Terminal 2: Web App (Frontend)
```bash
cd ~/Documents/Retire\ Strong/RetireStrongMVP/apps/web
pnpm dev
```

**Expected output:**
```
▲ Next.js 15.5.7
- Local:        http://localhost:3000
✓ Ready in X.Xs
```

## Quick Test

1. **Open browser:** http://localhost:3000
2. **Log in** with your credentials
3. **Navigate to Account page**
4. **Should see:** Your user information (no 503 error!)

## Troubleshooting

### Port Already in Use

```bash
# Kill processes on port 3000 (web app)
lsof -ti:3000 | xargs kill

# Kill processes on port 3001 (API gateway)
lsof -ti:3001 | xargs kill
```

### Check if servers are running

```bash
# Check API Gateway
curl http://localhost:3001/health

# Check Web App
curl http://localhost:3000
```

### View credentials

```bash
cat ~/aws-credentials-backup/retire-strong-credentials.txt
```

## Configuration Files

- `apps/api-gateway/.env` - Backend configuration (includes AWS credentials)
- `apps/web/.env.local` - Frontend configuration (API URL, Cognito config)

## Environment Summary

| Component | Location | Status |
|-----------|----------|--------|
| API Gateway | http://localhost:3001 | ✅ Running with AWS credentials |
| Web App | http://localhost:3000 | ✅ Pointing to local API |
| DynamoDB | AWS us-east-2 | ✅ 4 tables accessible |
| Cognito | AWS us-east-2 | ✅ Configured |

---

**Everything is configured and ready to go! 🚀**
