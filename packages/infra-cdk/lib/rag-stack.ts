import * as cdk from 'aws-cdk-lib';
import * as oss from 'aws-cdk-lib/aws-opensearchserverless';
import { Construct } from 'constructs';

export interface RagStackProps extends cdk.StackProps {
    environment: string;
}

export class RagStack extends cdk.Stack {
    public readonly collectionEndpoint: string;
    public readonly collectionName: string;

    constructor(scope: Construct, id: string, props: RagStackProps) {
        super(scope, id, props);

        this.collectionName = `retire-strong-rag-${props.environment}`;

        // 1. Encryption Policy
        const encryptionPolicy = new oss.CfnSecurityPolicy(this, 'RagEncryptionPolicy', {
            name: `${this.collectionName}-encryption`,
            type: 'encryption',
            policy: JSON.stringify({
                Rules: [
                    {
                        ResourceType: 'collection',
                        Resource: [`collection/${this.collectionName}`],
                    },
                ],
                AWSOwnedKey: true,
            }),
        });

        // 2. Network Policy (Public access for simplicity, restricted by IAM)
        const networkPolicy = new oss.CfnSecurityPolicy(this, 'RagNetworkPolicy', {
            name: `${this.collectionName}-network`,
            type: 'network',
            policy: JSON.stringify([
                {
                    Rules: [
                        {
                            ResourceType: 'collection',
                            Resource: [`collection/${this.collectionName}`],
                        },
                        {
                            ResourceType: 'dashboard',
                            Resource: [`collection/${this.collectionName}`],
                        },
                    ],
                    AllowFromPublic: true,
                },
            ]),
        });

        // 3. Collection (Vector Search)
        const collection = new oss.CfnCollection(this, 'RagCollection', {
            name: this.collectionName,
            type: 'VECTORSEARCH',
            description: 'Retire Strong RAG Vector Store',
        });

        collection.addDependency(encryptionPolicy);
        collection.addDependency(networkPolicy);

        // 4. Data Access Policy (Grant access to current account)
        // In a real app, you would grant specifically to Lambda roles. 
        // For now, we allow the deployment user and will attach Lambda roles later.
        new oss.CfnAccessPolicy(this, 'RagAccessPolicy', {
            name: `${this.collectionName}-access`,
            type: 'data',
            policy: JSON.stringify([
                {
                    Rules: [
                        {
                            ResourceType: 'collection',
                            Resource: [`collection/${this.collectionName}`],
                            Permission: [
                                'aoss:CreateCollectionItems',
                                'aoss:DeleteCollectionItems',
                                'aoss:UpdateCollectionItems',
                                'aoss:DescribeCollectionItems',
                            ],
                        },
                        {
                            ResourceType: 'index',
                            Resource: [`index/${this.collectionName}/*`],
                            Permission: [
                                'aoss:CreateIndex',
                                'aoss:DeleteIndex',
                                'aoss:UpdateIndex',
                                'aoss:DescribeIndex',
                                'aoss:ReadDocument',
                                'aoss:WriteDocument',
                            ],
                        },
                    ],
                    Principal: [
                        `arn:aws:iam::${this.account}:root`,
                        // Add specific role ARNs here if known
                    ],
                },
            ]),
        });

        this.collectionEndpoint = collection.attrCollectionEndpoint;

        new cdk.CfnOutput(this, 'RagCollectionEndpoint', {
            value: this.collectionEndpoint,
            description: 'OpenSearch Serverless Collection Endpoint',
        });

        new cdk.CfnOutput(this, 'RagCollectionName', {
            value: this.collectionName,
            description: 'OpenSearch Serverless Collection Name',
        });
    }
}
