#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AuthStack } from "../lib/auth-stack";
import { DataStack } from "../lib/data-stack";
import { ApiStack } from "../lib/api-stack";
import { WebStack } from "../lib/web-stack";

const app = new cdk.App();

// Get stage from context or environment variable
const stage = app.node.tryGetContext("stage") || process.env.RETIRE_STRONG_STAGE || "dev";
const region = process.env.AWS_REGION || "us-east-1";
const account = process.env.CDK_DEFAULT_ACCOUNT;

if (!account) {
  throw new Error("CDK_DEFAULT_ACCOUNT environment variable must be set");
}

// Base props for all stacks
const env = {
  account,
  region,
};

// Auth Stack (Cognito)
const authStack = new AuthStack(app, `RetireStrong-Auth-${stage}`, {
  env,
  stage,
  description: `Retire Strong Auth Stack (${stage})`,
});

// Data Stack (DynamoDB, S3)
const dataStack = new DataStack(app, `RetireStrong-Data-${stage}`, {
  env,
  stage,
  description: `Retire Strong Data Stack (${stage})`,
});

// API Stack (API Gateway, Lambda)
const apiStack = new ApiStack(app, `RetireStrong-Api-${stage}`, {
  env,
  stage,
  userPool: authStack.userPool,
  userPoolClient: authStack.userPoolClient,
  usersTable: dataStack.usersTable,
  sessionsTable: dataStack.sessionsTable,
  checkinsTable: dataStack.checkinsTable,
  logsTable: dataStack.logsTable,
  contentBucket: dataStack.contentBucket,
  description: `Retire Strong API Stack (${stage})`,
});

// Web Stack (S3, CloudFront)
const webStack = new WebStack(app, `RetireStrong-Web-${stage}`, {
  env,
  stage,
  apiUrl: apiStack.apiUrl,
  description: `Retire Strong Web Stack (${stage})`,
});

// Add stack dependencies
apiStack.addDependency(authStack);
apiStack.addDependency(dataStack);
webStack.addDependency(apiStack);

// Add tags to all stacks
cdk.Tags.of(app).add("Project", "RetireStrong");
cdk.Tags.of(app).add("Stage", stage);
cdk.Tags.of(app).add("ManagedBy", "CDK");

