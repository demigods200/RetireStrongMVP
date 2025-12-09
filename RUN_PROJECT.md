# Retire Strong - Project Run Commands

## 🚀 Quick Start

### Initial Setup (First Time Only)

```bash
# 1. Install all dependencies
pnpm install

# 2. Build all packages
pnpm build
```

---

## 🏃 Running the Project

### Option 1: Run Everything Together (Recommended)

**Single Command (runs both frontend and backend):**
```bash
pnpm dev
```

This runs:
- **Frontend (Web):** http://localhost:3000
- **Backend (API Gateway):** http://localhost:3001

**Note:** On Windows, you may need to run them separately (see Option 2).

---

### Option 2: Run in Separate Terminals (More Control)

**Terminal 1 - Frontend (Web App):**
```bash
pnpm --filter web dev
```
- Runs on: http://localhost:3000
- Hot reload enabled
- Next.js development server

**Terminal 2 - Backend (API Gateway):**
```bash
cd apps/api-gateway
pnpm dev
```
- Runs on: http://localhost:3001
- Express server with Lambda handlers
- Hot reload enabled (via tsx)

---

## 🔨 Build Commands

### Build Everything
```bash
# Build all packages and apps
pnpm build
```

### Build Individual Packages
```bash
# Build specific package
pnpm --filter domain-core build
pnpm --filter shared-api build
pnpm --filter motivation-engine build
pnpm --filter shared-ui build

# Build specific app
pnpm --filter web build
pnpm --filter api-gateway build
```

---

## 🧹 Clean Commands

### Clean Everything
```bash
# Remove all dist folders and node_modules
pnpm clean
```

### Clean Individual Packages
```bash
# Clean specific package
pnpm --filter domain-core clean
pnpm --filter api-gateway clean
```

---

## ✅ Verification Commands

### Check if Services are Running

**Frontend:**
```bash
curl http://localhost:3000
# Or open in browser: http://localhost:3000
```

**Backend API:**
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Type Checking
```bash
# Check types across all packages
pnpm type-check
```

### Linting
```bash
# Lint all packages
pnpm lint
```

---

## 🐳 Docker Option (Alternative)

If you prefer Docker:

```bash
cd infra/docker
docker-compose -f local-dev.docker-compose.yml up
```

This starts:
- Web app: http://localhost:3000
- API Gateway: http://localhost:3001
- DynamoDB Local: http://localhost:8000
- LocalStack: http://localhost:4566

---

## 📋 Common Workflows

### Development Workflow

```bash
# 1. Install dependencies (if new packages added)
pnpm install

# 2. Build all packages
pnpm build

# 3. Run development servers
pnpm dev
# OR run separately:
# Terminal 1: pnpm --filter web dev
# Terminal 2: cd apps/api-gateway && pnpm dev
```

### After Code Changes

**If you change shared packages:**
```bash
# Rebuild affected packages
pnpm --filter domain-core build
pnpm --filter shared-api build

# Restart dev servers (Ctrl+C and restart)
```

**If you change app code:**
- Frontend: Auto-reloads (Next.js hot reload)
- Backend: Auto-reloads (tsx watch mode)

---

## 🛠️ Troubleshooting

### Port Already in Use

**Kill process on port 3000:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

**Kill process on port 3001:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### TypeScript Errors

```bash
# Check all type errors
pnpm type-check

# Rebuild packages if needed
pnpm build
```

### Module Not Found Errors

```bash
# Reinstall dependencies
pnpm install

# Rebuild all packages
pnpm build
```

### API Gateway Not Starting

```bash
# Make sure api-gateway is built
cd apps/api-gateway
pnpm build

# Check if port 3001 is available
# Then start dev server
pnpm dev
```

---

## 📝 Environment Variables

Make sure you have environment files set up:

**Frontend:** `apps/web/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your-pool-id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-client-id
NEXT_PUBLIC_REGION=us-east-2
```

**Backend:** `apps/api-gateway/.env`
```env
AWS_REGION=us-east-2
DYNAMO_TABLE_USERS=retire-strong-users-dev
COGNITO_USER_POOL_ID=your-pool-id
COGNITO_CLIENT_ID=your-client-id
```

---

## 🎯 Quick Reference

| Command | Description |
|--------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm build` | Build all packages |
| `pnpm dev` | Run frontend + backend together |
| `pnpm --filter web dev` | Run frontend only |
| `cd apps/api-gateway && pnpm dev` | Run backend only |
| `pnpm type-check` | Check TypeScript types |
| `pnpm lint` | Lint all code |
| `pnpm clean` | Clean all build artifacts |

---

## 🌐 Access Points

Once running:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health
- **API Endpoints:**
  - `GET /health`
  - `POST /auth/signup`
  - `POST /auth/login`
  - `POST /users/onboarding`
  - `GET /motivation/quiz`
  - `POST /motivation/quiz/submit`

---

**Happy Coding! 🚀**

