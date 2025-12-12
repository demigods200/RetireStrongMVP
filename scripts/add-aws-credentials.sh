#!/bin/bash

echo "=========================================="
echo "Add AWS Credentials for Local Development"
echo "=========================================="
echo ""
echo "This script will add your AWS credentials to apps/api-gateway/.env"
echo ""
echo "⚠️  WARNING: Never commit your .env file with real credentials!"
echo ""

# Check if .env exists
if [ ! -f "apps/api-gateway/.env" ]; then
    echo "Error: apps/api-gateway/.env not found"
    exit 1
fi

# Prompt for credentials
echo "Enter your AWS Access Key ID:"
read -r AWS_ACCESS_KEY_ID

echo "Enter your AWS Secret Access Key:"
read -rs AWS_SECRET_ACCESS_KEY
echo ""

# Check if credentials already exist in .env
if grep -q "^AWS_ACCESS_KEY_ID=" apps/api-gateway/.env; then
    echo ""
    echo "AWS credentials already exist in .env file."
    echo "Do you want to replace them? (y/n)"
    read -r REPLACE
    if [ "$REPLACE" != "y" ]; then
        echo "Cancelled."
        exit 0
    fi
    # Remove existing credentials
    sed -i '/^AWS_ACCESS_KEY_ID=/d' apps/api-gateway/.env
    sed -i '/^AWS_SECRET_ACCESS_KEY=/d' apps/api-gateway/.env
fi

# Add credentials
echo "" >> apps/api-gateway/.env
echo "# AWS Credentials for local development (added by script)" >> apps/api-gateway/.env
echo "AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID" >> apps/api-gateway/.env
echo "AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY" >> apps/api-gateway/.env

echo ""
echo "✅ AWS credentials added successfully!"
echo ""
echo "Next steps:"
echo "1. Restart your API gateway server:"
echo "   cd apps/api-gateway"
echo "   pnpm dev"
echo ""
echo "2. Test the connection:"
echo "   curl http://localhost:3001/health"
echo ""
