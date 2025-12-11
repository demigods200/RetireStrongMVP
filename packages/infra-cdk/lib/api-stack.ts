import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface ApiStackProps extends cdk.StackProps {
  stage: string;
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  usersTable: dynamodb.Table;
  sessionsTable: dynamodb.Table;
  checkinsTable: dynamodb.Table;
  logsTable: dynamodb.Table;
  contentBucket: s3.Bucket;
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // API Gateway
    this.api = new apigateway.RestApi(this, "Api", {
      restApiName: `retire-strong-api-${props.stage}`,
      description: `Retire Strong API (${props.stage})`,
      defaultCorsPreflightOptions: {
        allowOrigins: [
          `https://${props.stage === "prod" ? "app" : `${props.stage}.app`}.retirestrong.com`,
          "http://localhost:3000",
        ],
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type", "Authorization"],
      },
      deployOptions: {
        stageName: props.stage,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
    });

    // Cognito Authorizer (will be created and attached when needed for protected endpoints)
    // Example usage when needed:
    // const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, "CognitoAuthorizer", {
    //   cognitoUserPools: [props.userPool],
    //   identitySource: apigateway.IdentitySource.header("Authorization"),
    // });
    // Then use in addMethod: resource.addMethod("GET", integration, { authorizer: cognitoAuthorizer });

    // Common Lambda configuration
    const commonBundling = {
      minify: false,
      sourceMap: true,
      target: "es2022",
      format: lambdaNodejs.OutputFormat.CJS,
      externalModules: ["aws-sdk"],
      // Ensure workspace dependencies are bundled
      bundle: true,
      // Use the root directory for resolving workspace packages
      projectRoot: "../../",
    };

    const commonEnvironment = {
      STAGE: props.stage,
      NODE_ENV: props.stage === "prod" ? "production" : "development",
      // Note: AWS_REGION is automatically provided by Lambda runtime, don't set it manually
      COGNITO_USER_POOL_ID: props.userPool.userPoolId,
      COGNITO_CLIENT_ID: props.userPoolClient.userPoolClientId,
      DYNAMO_TABLE_USERS: props.usersTable.tableName,
      DYNAMO_TABLE_SESSIONS: props.sessionsTable.tableName,
    };

    // Health Lambda
    const healthLambda = new lambdaNodejs.NodejsFunction(this, "HealthFunction", {
      functionName: `retire-strong-health-${props.stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: "../../apps/api-gateway/src/handlers/health.ts",
      handler: "handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      bundling: commonBundling,
      environment: {
        STAGE: props.stage,
        NODE_ENV: props.stage === "prod" ? "production" : "development",
      },
    });

    // Signup Lambda
    const signupLambda = new lambdaNodejs.NodejsFunction(this, "SignupFunction", {
      functionName: `retire-strong-signup-${props.stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: "../../apps/api-gateway/src/handlers/auth/signup.ts",
      handler: "handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      bundling: commonBundling,
      environment: commonEnvironment,
    });

    // Login Lambda
    const loginLambda = new lambdaNodejs.NodejsFunction(this, "LoginFunction", {
      functionName: `retire-strong-login-${props.stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: "../../apps/api-gateway/src/handlers/auth/login.ts",
      handler: "handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      bundling: commonBundling,
      environment: commonEnvironment,
    });

    // Verify Email Lambda
    const verifyLambda = new lambdaNodejs.NodejsFunction(this, "VerifyFunction", {
      functionName: `retire-strong-verify-${props.stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: "../../apps/api-gateway/src/handlers/auth/verify.ts",
      handler: "handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      bundling: commonBundling,
      environment: commonEnvironment,
    });

    // Resend Verification Code Lambda
    const resendCodeLambda = new lambdaNodejs.NodejsFunction(this, "ResendCodeFunction", {
      functionName: `retire-strong-resend-code-${props.stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: "../../apps/api-gateway/src/handlers/auth/resend-code.ts",
      handler: "handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      bundling: commonBundling,
      environment: commonEnvironment,
    });

    // Onboarding Lambda
    const onboardingLambda = new lambdaNodejs.NodejsFunction(this, "OnboardingFunction", {
      functionName: `retire-strong-onboarding-${props.stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: "../../apps/api-gateway/src/handlers/users/onboarding.ts",
      handler: "handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      bundling: commonBundling,
      environment: commonEnvironment,
    });

    // Quiz Lambda (GET questions)
    const quizLambda = new lambdaNodejs.NodejsFunction(this, "QuizFunction", {
      functionName: `retire-strong-quiz-${props.stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: "../../apps/api-gateway/src/handlers/motivation/quiz.ts",
      handler: "handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      bundling: commonBundling,
      environment: commonEnvironment,
    });

    // Submit Quiz Lambda
    const submitQuizLambda = new lambdaNodejs.NodejsFunction(this, "SubmitQuizFunction", {
      functionName: `retire-strong-submit-quiz-${props.stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: "../../apps/api-gateway/src/handlers/motivation/submit.ts",
      handler: "handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      bundling: commonBundling,
      environment: commonEnvironment,
    });

    // Profile Lambda (GET /users/me)
    const profileLambda = new lambdaNodejs.NodejsFunction(this, "ProfileFunction", {
      functionName: `retire-strong-profile-${props.stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: "../../apps/api-gateway/src/handlers/users/profile.ts",
      handler: "handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      bundling: commonBundling,
      environment: commonEnvironment,
    });

    const starterPlanLambda = new lambdaNodejs.NodejsFunction(this, "StarterPlanFunction", {
      functionName: `retire-strong-plan-starter-${props.stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: "../../apps/api-gateway/src/handlers/plans/starter.ts",
      handler: "handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      bundling: commonBundling,
      environment: commonEnvironment,
    });

    const currentPlanLambda = new lambdaNodejs.NodejsFunction(this, "CurrentPlanFunction", {
      functionName: `retire-strong-plan-current-${props.stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: "../../apps/api-gateway/src/handlers/plans/current.ts",
      handler: "handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      bundling: commonBundling,
      environment: commonEnvironment,
    });

    const getSessionLambda = new lambdaNodejs.NodejsFunction(this, "GetSessionFunction", {
      functionName: `retire-strong-session-get-${props.stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: "../../apps/api-gateway/src/handlers/sessions/get.ts",
      handler: "handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      bundling: commonBundling,
      environment: commonEnvironment,
    });

    const completeSessionLambda = new lambdaNodejs.NodejsFunction(this, "CompleteSessionFunction", {
      functionName: `retire-strong-session-complete-${props.stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: "../../apps/api-gateway/src/handlers/sessions/complete.ts",
      handler: "handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      bundling: commonBundling,
      environment: commonEnvironment,
    });

    // Grant Lambda permissions to DynamoDB tables
    const lambdas = [
      healthLambda,
      signupLambda,
      loginLambda,
      verifyLambda,
      resendCodeLambda,
      onboardingLambda,
      quizLambda,
      submitQuizLambda,
      profileLambda,
      starterPlanLambda,
      currentPlanLambda,
      getSessionLambda,
      completeSessionLambda,
    ];
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
    
    const meResource = usersResource.addResource("me");
    meResource.addMethod("GET", new apigateway.LambdaIntegration(profileLambda));

    // Motivation routes
    const motivationResource = this.api.root.addResource("motivation");
    const quizResource = motivationResource.addResource("quiz");
    quizResource.addMethod("GET", new apigateway.LambdaIntegration(quizLambda));

    const submitResource = quizResource.addResource("submit");
    submitResource.addMethod("POST", new apigateway.LambdaIntegration(submitQuizLambda));

    // Plans routes
    const plansResource = this.api.root.addResource("plans");
    const starterPlanResource = plansResource.addResource("starter");
    starterPlanResource.addMethod("POST", new apigateway.LambdaIntegration(starterPlanLambda));

    const currentPlanResource = plansResource.addResource("current");
    currentPlanResource.addMethod("GET", new apigateway.LambdaIntegration(currentPlanLambda));

    // Sessions routes
    const sessionsResource = this.api.root.addResource("sessions");
    const sessionIdResource = sessionsResource.addResource("{id}");
    sessionIdResource.addMethod("GET", new apigateway.LambdaIntegration(getSessionLambda));
    const completeSessionResource = sessionIdResource.addResource("complete");
    completeSessionResource.addMethod("POST", new apigateway.LambdaIntegration(completeSessionLambda));

    // Outputs
    this.apiUrl = this.api.url;

    new cdk.CfnOutput(this, "ApiUrl", {
      value: this.api.url,
      exportName: `RetireStrong-ApiUrl-${props.stage}`,
    });

    new cdk.CfnOutput(this, "ApiId", {
      value: this.api.restApiId,
      exportName: `RetireStrong-ApiId-${props.stage}`,
    });
  }
}

