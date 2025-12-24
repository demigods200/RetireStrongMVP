#!/usr/bin/env bash
set -euo pipefail

# load-aws-creds.sh
# Find AWS_* variables in common .env files and export them into the current shell session
# Usage: bash scripts/load-aws-creds.sh

if [ -n "${AWS_ACCESS_KEY_ID:-}" ]; then
  echo "AWS credentials already present in environment."
  exit 0
fi

candidates=(
  ".env"
  "./.env"
  "../.env"
  "../.env.local"
  "apps/api-gateway/.env"
  "apps/web/.env.local"
  "packages/infra-cdk/.env"
)

found=false
for f in "${candidates[@]}"; do
  if [ -f "$f" ]; then
    echo "Checking $f for AWS credentials"
    # Extract matching lines (quietly) and export them
    while IFS= read -r line; do
      # Skip comments and blank lines
      [[ "$line" =~ ^[[:space:]]*# ]] && continue
      [[ -z "$line" ]] && continue
      case "$line" in
        AWS_ACCESS_KEY_ID=*|AWS_SECRET_ACCESS_KEY=*|AWS_SESSION_TOKEN=*|AWS_REGION=*)
          key=${line%%=*}
          val=${line#*=}
          # Strip surrounding quotes if present
          val="${val%\"}"
          val="${val#\"}"
          val="${val%\'}"
          val="${val#\'}"
          export "$key"="$val"
          found=true
          ;;
      esac
    done < <(grep -E '^(AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|AWS_SESSION_TOKEN|AWS_REGION)=' "$f" || true)
  fi
done

if [ "$found" = true ]; then
  echo "Exported AWS credentials into this shell session."
  # Print values masked for safety
  echo "AWS_ACCESS_KEY_ID=$(printf '%s' "${AWS_ACCESS_KEY_ID}" | sed -E 's/(.{4}).*/\1****/')"
  echo "AWS_REGION=${AWS_REGION:-unset}"
  exit 0
else
  echo "No AWS credentials found in candidate .env files. Please run 'aws configure' or place credentials in one of: ${candidates[*]}"
  exit 1
fi
