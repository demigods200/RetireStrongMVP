# AWS Requirements for Retire Strong MVP

## Overview

This document lists all AWS resources, permissions, and access requirements needed from your company to complete the Retire Strong MVP project.

---

## 1. AWS Account Access

### **Option A: Full AWS Account Access (Recommended)**
**What to ask for:**
- AWS Account ID
- AWS Console login credentials (or SSO access)
- Region preference (e.g., `us-east-1`, `us-west-2`)

**Why needed:**
- Deploy infrastructure using CDK
- Create and manage AWS resources
- Monitor costs and usage

### **Option B: Limited Access (Alternative)**
**What to ask for:**
- IAM user with specific permissions (see Section 2)
- Access keys (Access Key ID and Secret Access Key)
- Region preference

**Why needed:**
- Deploy resources programmatically
- Cannot use AWS Console (limited visibility)

---

## 2. Required AWS Services & Resources

### **2.1 AWS Cognito (Authentication)**
**Resources needed:**
- ✅ User Pool (for user signup/login)
- ✅ User Pool Client (for web app authentication)

**What to ask for:**
- User Pool ID (format: `us-east-1_XXXXXXXXX`)
- User Pool Client ID
- Region where Cognito is deployed

**Estimated cost:** Free tier: 50,000 MAU (Monthly Active Users) free

---

### **2.2 Amazon DynamoDB (Database)**
**Resources needed:**
- ✅ `retire-strong-users-{stage}` table
- ✅ `retire-strong-sessions-{stage}` table
- ✅ `retire-strong-checkins-{stage}` table
- ✅ `retire-strong-logs-{stage}` table

**What to ask for:**
- Table names (or permission to create them)
- Region where tables are deployed
- Read/Write capacity (or use On-Demand billing)

**Estimated cost:** Free tier: 25 GB storage, 200M read/write units free

---

### **2.3 AWS Lambda (Backend API)**
**Resources needed:**
- ✅ Lambda functions for API handlers:
  - Health check
  - Signup
  - Login
  - Onboarding
  - (Future: Coach, Sessions, etc.)

**What to ask for:**
- Permission to create Lambda functions
- Execution role with necessary permissions
- Region preference

**Estimated cost:** Free tier: 1M requests, 400,000 GB-seconds free

---

### **2.4 API Gateway (REST API)**
**Resources needed:**
- ✅ REST API endpoint
- ✅ API routes configured
- ✅ CORS settings

**What to ask for:**
- API endpoint URL
- API ID
- Region

**Estimated cost:** Free tier: 1M API calls/month free

---

### **2.5 Amazon S3 (Content Storage)**
**Resources needed:**
- ✅ `retire-strong-content-{stage}-{account}` bucket
  - For exercise videos
  - For processed content
  - For analytics events

**What to ask for:**
- Bucket name (or permission to create)
- Region
- Access policies

**Estimated cost:** Free tier: 5 GB storage, 20,000 GET requests free

---

### **2.6 AWS Bedrock (AI/ML) - Future**
**Resources needed:**
- ✅ Access to Claude Sonnet 4.5 model
- ✅ IAM permissions for Bedrock

**What to ask for:**
- Bedrock access enabled in account
- Model access permissions
- Region (Bedrock availability)

**Estimated cost:** Pay-per-use (varies by model)

---

### **2.7 CloudFront (CDN) - Optional**
**Resources needed:**
- ✅ Distribution for web app
- ✅ Distribution for API (optional)

**What to ask for:**
- Permission to create CloudFront distributions
- Custom domain (if needed)

**Estimated cost:** Free tier: 1 TB data transfer, 10M requests free

---

## 3. IAM Permissions Required

### **Minimum Permissions Needed:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:*",
        "dynamodb:*",
        "lambda:*",
        "apigateway:*",
        "s3:*",
        "iam:CreateRole",
        "iam:AttachRolePolicy",
        "iam:PassRole",
        "bedrock:InvokeModel",
        "bedrock:ListFoundationModels",
        "cloudformation:*",
        "cloudwatch:*",
        "logs:*"
      ],
      "Resource": "*"
    }
  ]
}
```

**What to ask for:**
- IAM user with these permissions, OR
- IAM role with these permissions, OR
- Add these permissions to existing IAM user/role

**Note:** For production, use least-privilege principle (scope permissions to specific resources)

---

## 4. Environment/Stage Setup

### **Stages Needed:**
- ✅ **dev** - Development environment
- ✅ **staging** - Pre-production testing
- ✅ **prod** - Production environment

**What to ask for:**
- Which stages to deploy?
- Naming convention for resources?
- Separate AWS accounts per stage? (Recommended for prod)

---

## 5. Network & Security

### **VPC (Optional for MVP)**
**What to ask for:**
- VPC ID (if using existing VPC)
- Subnet IDs
- Security group IDs

**Note:** For MVP, Lambda can run without VPC (simpler)

### **Custom Domain (Optional)**
**What to ask for:**
- Domain name (e.g., `retirestrong.com`)
- Route 53 hosted zone (if using AWS Route 53)
- SSL certificate (ACM)

---

## 6. Monitoring & Logging

### **CloudWatch**
**What to ask for:**
- Permission to create log groups
- Permission to create alarms
- Log retention period preference

**Estimated cost:** Free tier: 5 GB ingestion, 5 GB storage free

---

## 7. Cost Management

### **Budget Alerts**
**What to ask for:**
- Monthly budget limit (e.g., $100, $500, $1000)
- Email for budget alerts
- Cost allocation tags preference

---

## 8. Deployment Method

### **Option A: CDK Deployment (Recommended)**
**What to ask for:**
- Permission to use AWS CDK
- CDK bootstrap in account
- Region(s) for deployment

**Commands needed:**
```bash
cdk bootstrap aws://ACCOUNT-ID/REGION
cdk deploy --all --context stage=dev
```

### **Option B: Manual Setup**
**What to ask for:**
- Manual creation of resources (you provide list)
- Or access to create resources via Console

---

## 9. Quick Start Checklist for Your Company

### **Essential (Must Have):**
- [ ] AWS Account access (or IAM user with permissions)
- [ ] AWS Region selection (e.g., `us-east-1`)
- [ ] Cognito User Pool (or permission to create)
- [ ] DynamoDB tables (or permission to create)
- [ ] Lambda execution permissions
- [ ] API Gateway access
- [ ] S3 bucket (or permission to create)

### **Important (Should Have):**
- [ ] CloudWatch logging access
- [ ] Budget alerts set up
- [ ] IAM permissions for CDK deployment
- [ ] Stage naming convention (dev/staging/prod)

### **Optional (Nice to Have):**
- [ ] Custom domain
- [ ] CloudFront distribution
- [ ] VPC configuration
- [ ] Separate AWS accounts per stage

---

## 10. Estimated Monthly Costs

### **Development Environment:**
- **Cognito:** $0 (free tier covers MVP)
- **DynamoDB:** $0-5 (free tier + minimal usage)
- **Lambda:** $0 (free tier covers MVP)
- **API Gateway:** $0 (free tier covers MVP)
- **S3:** $0-1 (free tier + minimal storage)
- **Bedrock:** $5-20 (depending on usage)
- **CloudWatch:** $0-2 (free tier + minimal logs)

**Total Estimated:** **$5-30/month for dev**

### **Production Environment:**
- Depends on usage (users, API calls, storage)
- Scale with traffic
- Estimated: **$50-500/month** for moderate usage

---

## 11. What to Send to Your Company

### **Email Template:**

```
Subject: AWS Infrastructure Requirements for Retire Strong MVP

Hi [Company Contact],

To complete the Retire Strong MVP project, I need the following AWS resources and access:

ESSENTIAL REQUIREMENTS:
1. AWS Account Access
   - AWS Account ID: [needed]
   - Region: [preferred region, e.g., us-east-1]
   - IAM user with permissions OR full account access

2. AWS Services Needed:
   - Cognito (User authentication)
   - DynamoDB (Database)
   - Lambda (Backend API)
   - API Gateway (REST API)
   - S3 (Content storage)
   - Bedrock (AI/ML - for future features)

3. Deployment Method:
   - Option A: CDK deployment (recommended) - I can deploy everything
   - Option B: Manual setup - You create resources, I provide list

4. Environment Setup:
   - Development environment (dev)
   - Staging environment (optional)
   - Production environment (for launch)

ESTIMATED COSTS:
- Development: ~$5-30/month
- Production: ~$50-500/month (scales with usage)

TIMELINE:
- Setup: 1-2 days
- Deployment: 1 day
- Testing: Ongoing

Please let me know:
1. Which option you prefer (CDK or manual)
2. AWS account access method
3. Any security/compliance requirements
4. Budget constraints

I've attached a detailed requirements document (AWS_REQUIREMENTS_FOR_COMPANY.md) with all technical details.

Best regards,
[Your Name]
```

---

## 12. Alternative: Local Development Without AWS

### **If AWS is not available yet:**
- ✅ Use LocalStack for local AWS emulation
- ✅ Use DynamoDB Local
- ✅ Mock API responses
- ✅ Test UI/UX without real AWS

**What you can do:**
- Test all frontend features
- Test form validation
- Test user flows
- Develop and test locally

**Limitations:**
- No real user authentication
- No persistent data storage
- No AI/ML features

---

## 13. Step-by-Step Setup Process

### **Once you have AWS access:**

1. **Verify Access:**
   ```bash
   aws sts get-caller-identity
   ```

2. **Install CDK:**
   ```bash
   npm install -g aws-cdk
   cdk --version
   ```

3. **Bootstrap CDK:**
   ```bash
   cd packages/infra-cdk
   cdk bootstrap aws://ACCOUNT-ID/REGION
   ```

4. **Deploy Infrastructure:**
   ```bash
   cdk deploy --all --context stage=dev
   ```

5. **Get Environment Variables:**
   - CDK outputs will show:
     - Cognito User Pool ID
     - Cognito Client ID
     - DynamoDB table names
     - API Gateway URL

6. **Configure Application:**
   - Set environment variables in Lambda functions
   - Update frontend API URL
   - Test end-to-end flow

---

## 14. Security Considerations

### **What to discuss with company:**
- [ ] Data encryption requirements
- [ ] Compliance requirements (HIPAA, GDPR, etc.)
- [ ] Access logging and audit trails
- [ ] Backup and disaster recovery
- [ ] Multi-factor authentication (MFA)
- [ ] Secrets management (AWS Secrets Manager)

---

## 15. Support & Documentation

### **Resources I can provide:**
- ✅ Complete CDK infrastructure code
- ✅ Deployment scripts
- ✅ Environment variable templates
- ✅ Testing guides
- ✅ Architecture diagrams

### **What I need from company:**
- ✅ AWS account access
- ✅ Permissions to deploy
- ✅ Budget approval
- ✅ Security/compliance requirements
- ✅ Domain name (if custom domain needed)

---

## Summary

**Minimum Requirements:**
1. AWS Account access (or IAM user)
2. Region selection
3. Permissions to create: Cognito, DynamoDB, Lambda, API Gateway, S3
4. CDK bootstrap (if using CDK)

**Estimated Setup Time:** 1-2 days

**Estimated Monthly Cost:** $5-30 (dev), $50-500 (prod)

---

**Questions?** Let me know if you need clarification on any requirements!

