# Account Page Analysis - Current Situation

## Summary of Your Analysis

Your analysis correctly identifies several potential issues. After reviewing the codebase, here's what I found:

## ✅ What's Working Correctly

### 1. userId Consistency (CORRECT)
- **Signup**: Uses `cognitoResult.userId` which comes from `response.UserSub` (Cognito sub)
- **Profile Handler**: Extracts `userId` from JWT token `decodedToken.sub` (also Cognito sub)
- **Both are consistent** - they both use the Cognito sub as the userId

```60:60:apps/api-gateway/src/handlers/users/profile.ts
    const userId = decodedToken.sub;
```

```46:47:apps/api-gateway/src/handlers/auth/signup.ts
    const user = await userService.createUser({
      userId: cognitoResult.userId,
```

### 2. Table Name Configuration (CORRECT)
- **CDK Stack**: Creates table as `retire-strong-users-${stage}` → `retire-strong-users-dev`
- **Handlers**: Check for `USERS_TABLE_NAME` or `DYNAMO_TABLE_USERS` (with fallback)
- **CDK Environment**: Sets `DYNAMO_TABLE_USERS` in Lambda environment
- **Table Structure**: PK is `userId` (correct)

```22:26:packages/infra-cdk/lib/data-stack.ts
    this.usersTable = new dynamodb.Table(this, "UsersTable", {
      tableName: `retire-strong-users-${props.stage}`,
      partitionKey: {
        name: "userId",
        type: dynamodb.AttributeType.STRING,
```

```68:75:packages/infra-cdk/lib/api-stack.ts
    const commonEnvironment = {
      STAGE: props.stage,
      NODE_ENV: props.stage === "prod" ? "production" : "development",
      // Note: AWS_REGION is automatically provided by Lambda runtime, don't set it manually
      COGNITO_USER_POOL_ID: props.userPool.userPoolId,
      COGNITO_CLIENT_ID: props.userPoolClient.userPoolClientId,
      DYNAMO_TABLE_USERS: props.usersTable.tableName,
    };
```

## ❌ Critical Issue Found

### Profile Lambda NOT Registered in CDK Stack

**The Problem:**
- The profile handler (`apps/api-gateway/src/handlers/users/profile.ts`) exists
- It's registered in `template.yaml` (SAM template)
- **BUT it's NOT registered in the CDK stack** (`packages/infra-cdk/lib/api-stack.ts`)

**Impact:**
- If you're using CDK for deployment, the `/users/me` endpoint doesn't exist in API Gateway
- The Lambda function is never created
- The endpoint returns 404 or doesn't exist

**Evidence:**
- `api-stack.ts` has lambdas for: health, signup, login, verify, resend-code, onboarding, quiz, submit-quiz
- **Missing**: profile/user-me Lambda
- No route registration for `/users/me` in the CDK stack

```176:223:packages/infra-cdk/lib/api-stack.ts
    // Grant Lambda permissions to DynamoDB tables
    const lambdas = [healthLambda, signupLambda, loginLambda, verifyLambda, resendCodeLambda, onboardingLambda, quizLambda, submitQuizLambda];
    lambdas.forEach((lambdaFn) => {
      props.usersTable.grantReadWriteData(lambdaFn);
      props.sessionsTable.grantReadWriteData(lambdaFn);
      props.checkinsTable.grantReadWriteData(lambdaFn);
      props.logsTable.grantReadWriteData(lambdaFn);
      props.contentBucket.grantRead(lambdaFn);
    });

    // Grant Cognito permissions to auth lambdas
    props.userPool.grant(signupLambda, "cognito-idp:AdminCreateUser", "cognito-idp:AdminSetUserPassword");
    props.userPool.grant(loginLambda, "cognito-idp:AdminInitiateAuth");
    // Verify and resend code use public Cognito APIs (no admin permissions needed)

    // API Routes

    // Health endpoint (no auth required)
    const healthResource = this.api.root.addResource("health");
    healthResource.addMethod("GET", new apigateway.LambdaIntegration(healthLambda));

    // Auth routes
    const authResource = this.api.root.addResource("auth");
    const signupResource = authResource.addResource("signup");
    signupResource.addMethod("POST", new apigateway.LambdaIntegration(signupLambda));

    const loginResource = authResource.addResource("login");
    loginResource.addMethod("POST", new apigateway.LambdaIntegration(loginLambda));

    const verifyResource = authResource.addResource("verify");
    verifyResource.addMethod("POST", new apigateway.LambdaIntegration(verifyLambda));

    const resendCodeResource = authResource.addResource("resend-code");
    resendCodeResource.addMethod("POST", new apigateway.LambdaIntegration(resendCodeLambda));

    // Users routes
    const usersResource = this.api.root.addResource("users");
    const onboardingResource = usersResource.addResource("onboarding");
    onboardingResource.addMethod("POST", new apigateway.LambdaIntegration(onboardingLambda));

    // Motivation routes
    const motivationResource = this.api.root.addResource("motivation");
    const quizResource = motivationResource.addResource("quiz");
    quizResource.addMethod("GET", new apigateway.LambdaIntegration(quizLambda));

    const submitResource = quizResource.addResource("submit");
    submitResource.addMethod("POST", new apigateway.LambdaIntegration(submitQuizLambda));
```

## 🔍 Other Potential Issues to Verify

### 1. Local vs Deployed API
The Next.js API route proxies to either:
- `process.env.NEXT_PUBLIC_API_URL` (if set)
- `http://localhost:3001` (fallback)

```24:34:apps/web/src/app/api/users/me/route.ts
    // Forward to API Gateway
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    
    let response: Response;
    try {
      response = await fetch(`${apiUrl}/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      });
```

**Check:**
- If `NEXT_PUBLIC_API_URL` points to deployed API Gateway, but you're testing locally
- If local server (`http://localhost:3001`) is running and has the profile route registered

### 2. Local Server Route Registration
The local Express server (`apps/api-gateway/src/server.ts`) does register the profile handler:

```15:15:apps/api-gateway/src/server.ts
import { handler as profileHandler } from "./handlers/users/profile.js";
```

But need to verify it's actually mounted as a route. Let me check...

### 3. Region Mismatch
- **AuthService constructor**: Defaults to `us-east-1` if not provided
- **UserRepo constructor**: Defaults to `us-east-1` if not provided  
- **Profile handler**: Uses `process.env.AWS_REGION || "us-east-2"`
- **CDK**: Doesn't set `AWS_REGION` explicitly (relies on Lambda runtime)

**Potential Issue:**
- If running locally, `AWS_REGION` might not be set, defaulting to `us-east-2`
- But AuthService/UserRepo might default to `us-east-1`
- This could cause region mismatches

```15:15:apps/api-gateway/src/lib/auth.ts
  constructor(_userPoolId: string, clientId: string, region: string = "us-east-1") {
```

```9:9:packages/domain-core/src/repos/UserRepo.ts
  constructor(tableName: string, region: string = "us-east-1") {
```

```78:78:apps/api-gateway/src/handlers/users/profile.ts
    const region = process.env.AWS_REGION || "us-east-2";
```

## 📋 Recommended Actions

### Priority 1: Fix CDK Stack (CRITICAL)
Add the profile Lambda to `packages/infra-cdk/lib/api-stack.ts`:

1. Create the profile Lambda function
2. Add it to the lambdas array for permissions
3. Register the `/users/me` route

### Priority 2: Verify Region Consistency
Ensure all services use the same region:
- Set `AWS_REGION` explicitly in CDK environment variables
- Or standardize default regions across all constructors

### Priority 3: Test End-to-End
1. Verify the endpoint exists in deployed API Gateway
2. Test with a real JWT token from Cognito
3. Check CloudWatch logs for any errors
4. Verify the userId in the token matches what's in DynamoDB

## 🧪 Testing Steps

1. **Check if endpoint exists:**
   ```bash
   # If using CDK deployment
   aws apigateway get-rest-apis --query "items[?name=='retire-strong-api-dev']"
   aws apigateway get-resources --rest-api-id <API_ID> --query "items[?path=='/users/me']"
   ```

2. **Test with direct DynamoDB query:**
   ```bash
   # Get userId from JWT token (decode it)
   aws dynamodb get-item \
     --table-name retire-strong-users-dev \
     --key '{"userId": {"S": "<COGNITO_SUB_FROM_TOKEN>"}}' \
     --region us-east-2
   ```

3. **Check Lambda logs:**
   ```bash
   aws logs tail /aws/lambda/retire-strong-profile-dev --follow
   ```

## Conclusion

Your analysis is **mostly correct**. The main issue is that the profile Lambda is **not registered in the CDK stack**, which means if you're using CDK for deployment, the endpoint doesn't exist. The userId consistency and table configuration look correct, but the missing Lambda registration would cause exactly the symptoms you're seeing.

---

## ✅ Fixes Applied

### 1. Added Profile Lambda to CDK Stack
- Created `profileLambda` function in `api-stack.ts`
- Added it to the lambdas array for DynamoDB permissions
- Registered `/users/me` GET route in API Gateway

### 2. Fixed Region Consistency
- Changed `AuthService` default region from `us-east-1` to `us-east-2`
- Changed `UserRepo` default region from `us-east-1` to `us-east-2`
- Now all services default to `us-east-2` to match the profile handler

### Next Steps
1. **Redeploy CDK stack** to create the profile Lambda:
   ```bash
   cd packages/infra-cdk
   npm run build
   cdk deploy --all
   ```

2. **Verify the endpoint exists**:
   - Check API Gateway console for `/users/me` route
   - Or test with: `curl -H "Authorization: Bearer <token>" <API_URL>/users/me`

3. **Test end-to-end**:
   - Sign up a new user
   - Login to get JWT token
   - Call `/users/me` with the token
   - Verify user data is returned

