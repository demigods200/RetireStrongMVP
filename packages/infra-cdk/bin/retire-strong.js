#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = __importStar(require("aws-cdk-lib"));
const auth_stack_1 = require("../lib/auth-stack");
const data_stack_1 = require("../lib/data-stack");
const api_stack_1 = require("../lib/api-stack");
const web_stack_1 = require("../lib/web-stack");
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
const authStack = new auth_stack_1.AuthStack(app, `RetireStrong-Auth-${stage}`, {
    env,
    stage,
    description: `Retire Strong Auth Stack (${stage})`,
});
// Data Stack (DynamoDB, S3)
const dataStack = new data_stack_1.DataStack(app, `RetireStrong-Data-${stage}`, {
    env,
    stage,
    description: `Retire Strong Data Stack (${stage})`,
});
// API Stack (API Gateway, Lambda)
const apiStack = new api_stack_1.ApiStack(app, `RetireStrong-Api-${stage}`, {
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
const webStack = new web_stack_1.WebStack(app, `RetireStrong-Web-${stage}`, {
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
//# sourceMappingURL=retire-strong.js.map