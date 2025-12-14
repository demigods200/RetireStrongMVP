#!/bin/bash

# Validation script for Milestone 3
# Checks that all required packages and files exist

echo "🔍 Validating Milestone 3 Implementation..."
echo ""

ERRORS=0

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
    else
        echo "❌ MISSING: $1"
        ((ERRORS++))
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo "✅ $1/"
    else
        echo "❌ MISSING: $1/"
        ((ERRORS++))
    fi
}

echo "Checking audit-log package..."
check_dir "packages/audit-log/src"
check_file "packages/audit-log/package.json"
check_file "packages/audit-log/src/index.ts"
check_file "packages/audit-log/src/logger.ts"
check_file "packages/audit-log/src/models/RecommendationLog.ts"
check_file "packages/audit-log/src/models/SafetyInterventionLog.ts"

echo ""
echo "Checking safety-engine package..."
check_dir "packages/safety-engine/src"
check_file "packages/safety-engine/package.json"
check_file "packages/safety-engine/src/index.ts"
check_file "packages/safety-engine/src/engine/validate-output.ts"
check_file "packages/safety-engine/src/rules/red-flag-detection.ts"
check_file "packages/safety-engine/src/filters/llm-output-filter.ts"

echo ""
echo "Checking content-rag package..."
check_dir "packages/content-rag/src"
check_file "packages/content-rag/package.json"
check_file "packages/content-rag/src/index.ts"
check_file "packages/content-rag/src/query/search.ts"
check_file "packages/content-rag/src/types/collections.ts"

echo ""
echo "Checking coach-engine package..."
check_dir "packages/coach-engine/src"
check_file "packages/coach-engine/package.json"
check_file "packages/coach-engine/src/index.ts"
check_file "packages/coach-engine/src/orchestrators/chat-orchestrator.ts"
check_file "packages/coach-engine/src/prompts/system-prompt.ts"

echo ""
echo "Checking domain-core updates..."
check_file "packages/domain-core/src/services/CoachService.ts"

echo ""
echo "Checking shared-api updates..."
check_file "packages/shared-api/src/schemas/CoachSchemas.ts"

echo ""
echo "Checking API Gateway handlers..."
check_dir "apps/api-gateway/src/handlers/coach"
check_file "apps/api-gateway/src/handlers/coach/chat.ts"
check_file "apps/api-gateway/src/handlers/coach/explain-plan.ts"

echo ""
echo "Checking web app..."
check_file "apps/web/src/app/api/coach/chat/route.ts"
check_file "apps/web/src/features/coach/components/CoachChat.tsx"

echo ""
echo "Checking documentation..."
check_file "MILESTONE3_COMPLETE.md"

echo ""
echo "========================================="
if [ $ERRORS -eq 0 ]; then
    echo "✅ All Milestone 3 files present!"
    echo "========================================="
    echo ""
    echo "Next steps:"
    echo "1. Install dependencies: pnpm install"
    echo "2. Build packages: pnpm build"
    echo "3. Start servers: pnpm dev"
    echo "4. Test coach at: http://localhost:3000/coach"
    exit 0
else
    echo "❌ Found $ERRORS missing files/directories"
    echo "========================================="
    exit 1
fi

