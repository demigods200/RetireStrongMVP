#!/bin/bash

# Milestone 3 Quick Test Script
# Runs the application with real AWS Bedrock integration

echo "🚀 Retire Strong - Milestone 3 Testing"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root"
    exit 1
fi

# Check for .env file
if [ ! -f "apps/api-gateway/.env" ]; then
    echo "📝 Creating .env file for API Gateway..."
    cat > apps/api-gateway/.env << 'EOF'
USERS_TABLE_NAME=retire-strong-users-dev
SESSIONS_TABLE_NAME=retire-strong-sessions-dev
LOGS_TABLE_NAME=retire-strong-logs-dev
AWS_REGION=us-east-2
PORT=3001
EOF
    echo "✅ .env file created"
    echo ""
    echo "⚠️  NOTE: Make sure you have AWS credentials configured for Bedrock access"
    echo ""
else
    echo "✅ .env file exists"
fi

echo ""
echo "☁️  Running with AWS Bedrock (Claude + Titan Embeddings)"
echo ""
echo "This will start two servers:"
echo "  1. API Gateway on http://localhost:3001"
echo "  2. Web App on http://localhost:3000"
echo ""
echo "To test Milestone 3:"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Navigate to /coach"
echo "  3. Try these queries:"
echo "     ✅ 'Why is balance important for older adults?'"
echo "     ✅ 'How can I improve my strength?'"
echo "     ❌ 'Do I have arthritis?' (Safety Brain should block)"
echo ""
echo "Requirements:"
echo "  - AWS credentials configured (~/.aws/credentials)"
echo "  - Bedrock access enabled in your AWS account"
echo "  - DynamoDB tables created (users, sessions, logs)"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""
echo "Starting in 3 seconds..."
sleep 3

# Function to kill all background jobs on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Start API Gateway
echo "Starting API Gateway..."
cd apps/api-gateway
pnpm dev > ../../logs/api-gateway.log 2>&1 &
API_PID=$!
cd ../..

# Wait a moment for API Gateway to start
sleep 2

# Start Web App
echo "Starting Web App..."
cd apps/web
pnpm dev > ../../logs/web.log 2>&1 &
WEB_PID=$!
cd ../..

echo ""
echo "✅ Servers starting..."
echo ""
echo "📊 Logs:"
echo "  - API Gateway: logs/api-gateway.log"
echo "  - Web App: logs/web.log"
echo ""
echo "🌐 Open: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Wait for user interrupt
wait

