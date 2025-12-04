# Retire Strong MVP

> AI-powered longevity and fitness platform for adults 50+

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![AWS CDK](https://img.shields.io/badge/AWS%20CDK-2.140-orange)](https://aws.amazon.com/cdk/)
[![pnpm](https://img.shields.io/badge/pnpm-9-pink)](https://pnpm.io/)

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Documentation](#documentation)
- [Contributing](#contributing)

## Overview

Retire Strong is an AI-powered wellness platform designed specifically for adults 50 and older. The platform provides personalized AI coaching, customized fitness plans, and curated content to help users build strength, maintain mobility, and increase independence.

### Key Features

- 🤖 **Personalized AI Coach** - Conversational AI that adapts to your motivation profile
- 📅 **Customized Plans** - Daily and weekly plans tailored to your capabilities
- 📊 **Progress Tracking** - Track your vitality index, streaks, and improvements
- 📚 **Curated Content Library** - Expert-vetted exercises, articles, and videos
- 🎯 **Motivation Profiling** - AI identifies your personal motivators and adapts coaching style
- 🛡️ **Safety First** - Built-in guardrails and safety rules for 50+ users

### Business Model

- **B2C:** Monthly/annual subscriptions ($15-$50/month, avg ARPU ~$120)
- **B2B:** PMPM contracts with insurers, licensing with gyms, data insights

**Target:** 50,000+ paid subscribers within 18-24 months

## Project Structure

This is a monorepo using pnpm workspaces:

```
retire-strong/
├── apps/
│   ├── web/              # Next.js web application
│   ├── api-gateway/      # Lambda HTTP handlers
│   ├── coach-service/    # AI coach orchestration
│   ├── jobs/             # Event-driven jobs
│   └── admin/            # Admin dashboard
├── packages/
│   ├── domain-core/      # Domain models and services
│   ├── motivation-engine/# Motivation quiz and personas
│   ├── habit-engine/     # Plan building and adaptation
│   ├── content-model/    # Content schemas
│   ├── coach-prompts/    # Prompt templates
│   ├── shared-api/       # API contracts and client
│   ├── shared-config/    # Environment config
│   ├── shared-utils/     # Utilities
│   ├── shared-ui/        # Design system
│   └── infra-cdk/        # AWS CDK infrastructure
├── infra/
│   ├── docker/           # Dockerfiles and compose
│   ├── scripts/          # Helper scripts
│   └── cicd/             # CI/CD pipelines
└── docs/                 # Documentation
```

See [retire-strong-project-structure.txt](./retire-strong-project-structure.txt) for detailed structure.

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5.6** - Type safety
- **Tailwind CSS 4.0** - Styling
- **Zod 3.23** - Schema validation

### Backend
- **AWS Lambda** - Serverless functions
- **API Gateway** - REST API
- **DynamoDB** - NoSQL database
- **AWS Cognito** - Authentication
- **AWS Bedrock** - AI (Claude Sonnet 4.5)
- **S3 Vectors** - Vector search for RAG

### Infrastructure
- **AWS CDK 2.140** - Infrastructure as code
- **TypeScript** - CDK definitions
- **Docker** - Local development

### Development Tools
- **pnpm 9** - Package manager
- **Vitest 2.0** - Testing
- **ESLint 9** - Linting
- **Prettier 3.3** - Formatting
- **Husky 9** - Git hooks

See [docs/TECH_STACK.md](./docs/TECH_STACK.md) for complete technology list with versions.

## Getting Started

### Prerequisites

- **Node.js 20.18+** (LTS)
- **pnpm 9+**
- **AWS CLI** configured
- **Docker** (for local development)
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd retire-strong
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start local development:**
   ```bash
   pnpm dev
   ```

This starts:
- Next.js dev server (web app)
- Local API Gateway (SAM Local)
- DynamoDB Local
- LocalStack (S3, etc.)

### Environment Setup

See [docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md) for detailed environment configuration.

## Development

### Available Scripts

```bash
# Development
pnpm dev              # Start all services locally
pnpm dev:web          # Start only web app
pnpm dev:api          # Start only API locally

# Building
pnpm build            # Build all packages and apps
pnpm build:web        # Build web app only
pnpm build:packages   # Build all packages

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests only
pnpm test:integration # Run integration tests
pnpm test:e2e         # Run E2E tests

# Code Quality
pnpm lint             # Lint all packages
pnpm format           # Format all code
pnpm type-check       # Type check all packages

# Infrastructure
pnpm cdk:deploy       # Deploy infrastructure
pnpm cdk:diff         # Show infrastructure changes
pnpm cdk:destroy      # Destroy infrastructure
```

### Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes:**
   - Follow coding standards (DRY, KISS, SOLID)
   - Write tests for new features
   - Update documentation

3. **Run checks before committing:**
   ```bash
   pnpm lint
   pnpm type-check
   pnpm test
   ```

4. **Commit changes:**
   ```bash
   git commit -m "feat: add new feature"
   ```

5. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Coding Standards

- **TypeScript everywhere** - No untyped JavaScript
- **Business logic in packages** - Not in UI or handlers
- **Small, focused functions** - One responsibility per function
- **Composition over inheritance**
- **Test coverage** - >80% for domain packages

See cursor rules in `.cursorrules` for detailed guidelines.

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md)** - Business context, goals, features
- **[TECH_STACK.md](./docs/TECH_STACK.md)** - Complete technology stack with versions
- **[BUSINESS_REQUIREMENTS.md](./docs/BUSINESS_REQUIREMENTS.md)** - Functional and non-functional requirements
- **[API_SPECIFICATIONS.md](./docs/API_SPECIFICATIONS.md)** - API contracts and endpoints
- **[retire-strong-project-structure.txt](./retire-strong-project-structure.txt)** - Detailed project structure

## Architecture

### High-Level Flow

1. **User Onboarding:**
   - Sign up → Complete demographics → Take motivation quiz → Get starter plan

2. **Daily Session:**
   - Check-in → Get session plan → Complete exercises → Provide feedback → Track progress

3. **AI Coach:**
   - User message → RAG retrieval → Bedrock generation → Personalized response

See [docs/PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md) for detailed user journeys.

### Key Design Decisions

- **Monorepo:** Single repo for all apps and packages
- **Serverless:** AWS Lambda for scalability and cost efficiency
- **Type Safety:** TypeScript strict mode everywhere
- **Domain-Driven:** Business logic in domain packages
- **RAG for AI:** Retrieval Augmented Generation for accurate responses

## Contributing

1. Read the [coding standards](#coding-standards)
2. Follow the [development workflow](#development-workflow)
3. Write tests for new features
4. Update documentation
5. Submit PR with clear description

## License

Proprietary - Retire Strong LLC

## Contact

For questions or support, contact the development team.

---

**Built with ❤️ for adults 50+**


