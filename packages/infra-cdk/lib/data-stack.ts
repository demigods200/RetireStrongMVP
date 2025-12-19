import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface DataStackProps extends cdk.StackProps {
  stage: string;
}

export class DataStack extends cdk.Stack {
  public readonly usersTable: dynamodb.Table;
  public readonly sessionsTable: dynamodb.Table;
  public readonly checkinsTable: dynamodb.Table;
  public readonly logsTable: dynamodb.Table;
  public readonly contentBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);

    // Users Table
    this.usersTable = new dynamodb.Table(this, "UsersTable", {
      tableName: `retire-strong-users-${props.stage}`,
      partitionKey: {
        name: "userId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: props.stage === "prod",
      removalPolicy: props.stage === "prod" ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // Sessions Table
    this.sessionsTable = new dynamodb.Table(this, "SessionsTable", {
      tableName: `retire-strong-sessions-${props.stage}`,
      partitionKey: {
        name: "sessionId",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "userId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: props.stage === "prod",
      removalPolicy: props.stage === "prod" ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // Checkins Table
    this.checkinsTable = new dynamodb.Table(this, "CheckinsTable", {
      tableName: `retire-strong-checkins-${props.stage}`,
      partitionKey: {
        name: "userId",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "date",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: props.stage === "prod",
      removalPolicy: props.stage === "prod" ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // Logs Table
    // Used by audit-log package for safety-critical logging
    // Stores: recommendation logs, engine call logs, LLM interaction logs, safety intervention logs
    this.logsTable = new dynamodb.Table(this, "AuditLogsTable", {
      tableName: `retire-strong-audit-logs-${props.stage}`,
      partitionKey: {
        name: "pk", // Format: LOG#{type}#{id}
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "sk", // Timestamp for sorting
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: props.stage === "prod",
      removalPolicy: props.stage === "prod" ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // Content S3 Bucket
    this.contentBucket = new s3.Bucket(this, "ContentBucket", {
      bucketName: `retire-strong-content-${props.stage}-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: props.stage === "prod",
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: props.stage === "prod" ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: props.stage !== "prod",
    });

    // Outputs
    new cdk.CfnOutput(this, "UsersTableName", {
      value: this.usersTable.tableName,
      exportName: `RetireStrong-UsersTable-${props.stage}`,
    });

    new cdk.CfnOutput(this, "SessionsTableName", {
      value: this.sessionsTable.tableName,
      exportName: `RetireStrong-SessionsTable-${props.stage}`,
    });

    new cdk.CfnOutput(this, "CheckinsTableName", {
      value: this.checkinsTable.tableName,
      exportName: `RetireStrong-CheckinsTable-${props.stage}`,
    });

    new cdk.CfnOutput(this, "LogsTableName", {
      value: this.logsTable.tableName,
      exportName: `RetireStrong-LogsTable-${props.stage}`,
    });

    new cdk.CfnOutput(this, "ContentBucketName", {
      value: this.contentBucket.bucketName,
      exportName: `RetireStrong-ContentBucket-${props.stage}`,
    });
  }
}

