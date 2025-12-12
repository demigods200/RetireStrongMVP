# Milestone 2 - 503 Error Fix

## Problem Summary
You're getting a 503 error when trying to get user account information. The root cause: **Network timeout connecting to AWS from your VirtualBox VM**.

## What I Found

1. ✅ Your AWS infrastructure is deployed and working
2. ✅ Your local API gateway server is running (port 3001)
3. ✅ Your web app is running (port 3000)
4. ❌ Your web app was configured to use the AWS API Gateway URL
5. ❌ Connection from VM to AWS is timing out (10+ seconds)

## Solution: Use Local API Gateway

I've updated your `apps/web/.env.local` to use `http://localhost:3001` instead of the AWS URL.

## ⚠️ IMPORTANT: Add AWS Credentials

Your local API gateway server needs AWS credentials to connect to your DynamoDB tables. You have two options:

### Option A: Add Credentials to .env (Quick Fix)

1. **Get your AWS credentials:**
   - Go to AWS Console → IAM → Security Credentials
   - Or use existing credentials if you have them

2. **Add to `apps/api-gateway/.env`:**

```bash
# Edit the file
nano apps/api-gateway/.env

# Add these two lines at the end:
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
```

3. **Restart the API gateway server:**
   - Press `Ctrl+C` in terminal 11
   - Run: `pnpm --filter api-gateway dev`

### Option B: Configure AWS CLI (Better for Multiple Projects)

```bash
# Install AWS CLI if not already installed
sudo apt update
sudo apt install awscli -y

# Configure credentials
aws configure
# Enter your:
#   AWS Access Key ID
#   AWS Secret Access Key
#   Default region: us-east-2
#   Default output format: json
```

Then the API gateway will automatically use these credentials.

## Next Steps

1. **Add AWS credentials** (choose Option A or B above)

2. **Restart both servers:**

   Terminal 1 (API Gateway):
   ```bash
   cd apps/api-gateway
   pnpm dev
   ```

   Terminal 2 (Web App):
   ```bash
   cd apps/web
   pnpm dev
   ```

3. **Test the application:**
   - Open http://localhost:3000
   - Log in
   - Go to Account page
   - Should see your user information (no more 503 error!)

## Verification

To verify everything is working:

```bash
# Test local API health
curl http://localhost:3001/health

# Test with your auth token (replace TOKEN with your actual token)
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/users/me
```

## Switching Back to AWS API Gateway

When you want to test with the deployed AWS API Gateway (e.g., for production testing):

1. Edit `apps/web/.env.local`
2. Uncomment the AWS URL:
   ```env
   # NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_API_URL=https://y9iliioekl.execute-api.us-east-2.amazonaws.com/dev
   ```
3. Restart the web server

## Network Issue Note

The AWS API Gateway connection timeout suggests network connectivity issues from your VirtualBox VM to AWS. This could be:
- VPN or proxy interference
- VirtualBox network configuration (NAT vs Bridged)
- Firewall rules
- DNS resolution issues

For local development/testing, using localhost is the recommended approach.

## Files Changed

- `apps/web/.env.local` - Updated to use `http://localhost:3001`
- `packages/domain-core/src/repos/UserRepo.ts` - Added support for local DynamoDB endpoint
- `packages/domain-core/src/repos/SessionRepo.ts` - Added support for local DynamoDB endpoint
- `packages/domain-core/src/repos/PlanRepo.ts` - Added support for local DynamoDB endpoint

These changes allow you to optionally use DynamoDB Local in the future if needed.
