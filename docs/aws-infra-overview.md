AWS INFRA OVERVIEW
==================

Provisioned via CDK in packages/infra-cdk.

Core services
-------------
- Cognito
  - User Pool for auth (email + password, email verified).
  - App client for the web app.
- DynamoDB
  - retire-strong-users-<env>      (user profiles + motivation persona)
  - retire-strong-sessions-<env>   (plans and sessions)
  - retire-strong-logs-<env>       (audit and system logs, including Safety Brain interventions)
  - retire-strong-checkins-<env>   (post‑session checkins and weekly surveys)
- API Gateway + Lambda
  - Public API for web app and tool access
    (/auth, /onboarding, /motivation, /plans, /sessions, /coach, /health).
- S3 + CloudFront
  - Host the Next.js web app (static assets).
- RAG infra (later milestone)
  - S3 bucket for content storage.
  - Vector DB (for example OpenSearch serverless or similar).

Principles
----------
- All resources are defined in CDK stacks; no manual drift.
- Environments (dev, staging, prod) are created by parameterizing stack names.
- App code reads resource identifiers through environment variables injected at deploy time.