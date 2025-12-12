# Quick Fix for 503 Error

## The Problem
Your web app was trying to connect to AWS API Gateway, but the connection was timing out from your VirtualBox VM (10+ second timeouts).

## The Solution  
I've updated your setup to use the **local API gateway** (running on port 3001) instead of AWS.

## ⚠️ Action Required: Add Your AWS Credentials

Your local API gateway needs credentials to connect to your DynamoDB tables in AWS.

### Quick Method (2 minutes):

**1. Run the helper script:**
```bash
cd ~/Documents/Retire\ Strong/RetireStrongMVP
./scripts/add-aws-credentials.sh
```

**2. Enter your AWS credentials when prompted**

**3. Restart your API gateway:**
- Go to terminal 11 (where API gateway is running)
- Press `Ctrl+C` to stop it
- Run: `pnpm --filter api-gateway dev`

**4. Restart your web app (optional but recommended):**
- Go to terminal 12 (where web app is running)
- Press `Ctrl+C` to stop it
- Run: `pnpm --filter web dev`

**5. Test it:**
- Open http://localhost:3000
- Log in
- Go to Account page
- You should see your user info (no more 503!) ✅

### Alternative Method (AWS CLI):

If you prefer to use AWS CLI:

```bash
# Install AWS CLI
sudo apt install awscli -y

# Configure it
aws configure
# Enter:
#   - AWS Access Key ID
#   - AWS Secret Access Key
#   - Default region: us-east-2
#   - Output format: json

# Then restart both servers
```

## Where to Get AWS Credentials

If you don't remember your AWS credentials:

1. Go to: https://console.aws.amazon.com/iam/home#/security_credentials
2. Click "Create access key"
3. Copy the Access Key ID and Secret Access Key
4. Use them in the script above

## What I Changed

- ✅ Updated `apps/web/.env.local` to use `http://localhost:3001`
- ✅ Updated DynamoDB repository code to support local development
- ✅ Created helper scripts for you

## Need Help?

If you still see errors, check:

1. **Both servers are running:**
   - Terminal 11: API gateway on port 3001
   - Terminal 12: Web app on port 3000

2. **AWS credentials are correct:**
   - Run: `aws dynamodb list-tables --region us-east-2`
   - Should show your tables

3. **Check API gateway logs** in terminal 11 for any error messages

---

**Read MILESTONE2_FIX.md for detailed explanation and troubleshooting.**
