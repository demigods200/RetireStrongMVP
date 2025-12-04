import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
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

    // Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, "CognitoAuthorizer", {
      cognitoUserPools: [props.userPool],
    });

    // Health Lambda
    const healthLambda = new lambda.Function(this, "HealthFunction", {
      functionName: `retire-strong-health-${props.stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "handlers/health.handler",
      code: lambda.Code.fromAsset("../../apps/api-gateway/dist", {
        exclude: ["*.ts", "*.ts.map"],
      }),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        STAGE: props.stage,
        NODE_ENV: props.stage === "prod" ? "production" : "development",
      },
    });

    // Health endpoint (no auth required)
    const healthResource = this.api.root.addResource("health");
    healthResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(healthLambda),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Content-Type": true,
            },
          },
        ],
      }
    );

    // Grant Lambda permissions to DynamoDB tables
    props.usersTable.grantReadWriteData(healthLambda);
    props.sessionsTable.grantReadWriteData(healthLambda);
    props.checkinsTable.grantReadWriteData(healthLambda);
    props.logsTable.grantReadWriteData(healthLambda);

    // Grant Lambda permissions to S3 bucket
    props.contentBucket.grantRead(healthLambda);

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

