#!/bin/bash
set -e

echo "🚀 Setting up local development environment for Retire Strong MVP"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Install it with:"
    echo "  sudo apt update"
    echo "  sudo apt install docker.io -y"
    echo "  sudo systemctl start docker"
    echo "  sudo usermod -aG docker \$USER"
    echo ""
    echo "Then log out and log back in (or run: newgrp docker)"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${YELLOW}⚠️  AWS CLI is not installed. Installing...${NC}"
    sudo apt update
    sudo apt install awscli -y
fi

echo -e "${GREEN}✅ AWS CLI is installed${NC}"
echo ""

# Check if DynamoDB Local is already running
if docker ps --format '{{.Names}}' | grep -q "^dynamodb-local$"; then
    echo -e "${YELLOW}⚠️  DynamoDB Local is already running${NC}"
else
    # Check if stopped container exists
    if docker ps -a --format '{{.Names}}' | grep -q "^dynamodb-local$"; then
        echo "Starting existing DynamoDB Local container..."
        docker start dynamodb-local
    else
        echo "Starting DynamoDB Local..."
        docker run -d --name dynamodb-local \
          -p 8000:8000 \
          amazon/dynamodb-local:latest \
          -jar DynamoDBLocal.jar -sharedDb -inMemory
    fi
    
    # Wait for DynamoDB to be ready
    echo "Waiting for DynamoDB Local to be ready..."
    sleep 3
fi

echo -e "${GREEN}✅ DynamoDB Local is running${NC}"
echo ""

# Configure dummy AWS credentials for local development
echo "Configuring AWS CLI for local DynamoDB..."
aws configure set aws_access_key_id dummy --profile local
aws configure set aws_secret_access_key dummy --profile local
aws configure set region us-east-2 --profile local

export AWS_PROFILE=local
export AWS_ACCESS_KEY_ID=dummy
export AWS_SECRET_ACCESS_KEY=dummy
export AWS_REGION=us-east-2

echo -e "${GREEN}✅ AWS CLI configured${NC}"
echo ""

# Function to create table if it doesn't exist
create_table_if_not_exists() {
    local table_name=$1
    local key_schema=$2
    local attribute_definitions=$3
    
    if aws dynamodb describe-table --table-name "$table_name" --endpoint-url http://localhost:8000 &> /dev/null; then
        echo -e "${YELLOW}⚠️  Table $table_name already exists${NC}"
    else
        echo "Creating table: $table_name..."
        aws dynamodb create-table \
          --table-name "$table_name" \
          --attribute-definitions $attribute_definitions \
          --key-schema $key_schema \
          --billing-mode PAY_PER_REQUEST \
          --endpoint-url http://localhost:8000 &> /dev/null
        echo -e "${GREEN}✅ Created table: $table_name${NC}"
    fi
}

# Create tables
echo "Creating DynamoDB tables..."
echo ""

create_table_if_not_exists \
  "retire-strong-users-dev" \
  "AttributeName=userId,KeyType=HASH" \
  "AttributeName=userId,AttributeType=S"

create_table_if_not_exists \
  "retire-strong-sessions-dev" \
  "AttributeName=userId,KeyType=HASH AttributeName=sessionId,KeyType=RANGE" \
  "AttributeName=userId,AttributeType=S AttributeName=sessionId,AttributeType=S"

create_table_if_not_exists \
  "retire-strong-checkins-dev" \
  "AttributeName=userId,KeyType=HASH AttributeName=checkinId,KeyType=RANGE" \
  "AttributeName=userId,AttributeType=S AttributeName=checkinId,AttributeType=S"

create_table_if_not_exists \
  "retire-strong-logs-dev" \
  "AttributeName=logId,KeyType=HASH" \
  "AttributeName=logId,AttributeType=S"

echo ""
echo "Verifying tables..."
aws dynamodb list-tables --endpoint-url http://localhost:8000

echo ""
echo -e "${GREEN}✅ All tables created${NC}"
echo ""

# Create/update .env file in api-gateway
ENV_FILE="apps/api-gateway/.env"
echo "Creating $ENV_FILE..."

cat > "$ENV_FILE" << 'EOF'
# DynamoDB Table Names
USERS_TABLE_NAME=retire-strong-users-dev
SESSIONS_TABLE_NAME=retire-strong-sessions-dev

# AWS Region
AWS_REGION=us-east-2

# Local DynamoDB endpoint
AWS_ENDPOINT_URL=http://localhost:8000

# Dummy credentials for local development
AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy
EOF

echo -e "${GREEN}✅ Created $ENV_FILE${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Local development environment is ready!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Restart your API gateway:"
echo "   cd apps/api-gateway"
echo "   pnpm dev"
echo ""
echo "2. Start your web app (in another terminal):"
echo "   cd apps/web"
echo "   pnpm dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "To stop DynamoDB Local:"
echo "  docker stop dynamodb-local"
echo ""
echo "To start it again:"
echo "  docker start dynamodb-local"
echo ""
