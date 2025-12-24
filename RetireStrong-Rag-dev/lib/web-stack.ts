import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

export interface WebStackProps extends cdk.StackProps {
  stage: string;
  apiUrl: string;
}

export class WebStack extends cdk.Stack {
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props);

    // S3 Bucket for web app
    const webBucket = new s3.Bucket(this, "WebBucket", {
      bucketName: `retire-strong-web-${props.stage}-${this.account}`,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: props.stage === "prod" ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: props.stage !== "prod",
    });

    // CloudFront Distribution
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, "WebOAI");
    webBucket.grantRead(originAccessIdentity);

    this.distribution = new cloudfront.Distribution(this, "WebDistribution", {
      defaultBehavior: {
        origin: new origins.S3Origin(webBucket, {
          originAccessIdentity: originAccessIdentity,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        compress: true,
      },
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });

    // Deploy site contents to S3 bucket
    new s3deploy.BucketDeployment(this, "DeployWithInvalidation", {
      sources: [s3deploy.Source.asset("../../apps/web/out")],
      destinationBucket: webBucket,
      distribution: this.distribution,
      distributionPaths: ["/*"],
    });

    // Outputs
    new cdk.CfnOutput(this, "WebBucketName", {
      value: webBucket.bucketName,
      exportName: `RetireStrong-WebBucket-${props.stage}`,
    });

    new cdk.CfnOutput(this, "DistributionId", {
      value: this.distribution.distributionId,
      exportName: `RetireStrong-DistributionId-${props.stage}`,
    });

    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: this.distribution.distributionDomainName,
      exportName: `RetireStrong-DistributionDomain-${props.stage}`,
    });
  }
}

