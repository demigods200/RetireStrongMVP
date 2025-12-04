FROM public.ecr.aws/lambda/nodejs:20

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR ${LAMBDA_TASK_ROOT}

# Copy workspace files
COPY pnpm-workspace.yaml package.json ./
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy application code
COPY apps/api-gateway/dist ./dist

CMD ["dist/handlers/health.handler"]

