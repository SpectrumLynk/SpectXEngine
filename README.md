# SpectXEngine

**The All-in-One Enterprise Web Kernel for Vibe Coding & Production Applications**

[![License](https://img.shields.io/badge/license-Open%20Source-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> Build production-grade web applications at the speed of thought. SpectXEngine combines enterprise reliability with vibe-coding velocity.

## What is SpectXEngine?

SpectXEngine is a **production-ready, AI-governed web framework** that eliminates the boilerplate and lets you focus on building. Whether you're prototyping rapidly (vibe coding) or deploying mission-critical systems, SpectXEngine provides:

- **Zero-config production setup** - Start building immediately
- **Enterprise security built-in** - MFA, RBAC, audit logging, rate limiting
- **AI-powered guardrails** - Automatic code governance and compliance
- **Performance by default** - <250KB bundles, <2s TTI enforced
- **Full observability** - Structured logging, metrics, distributed tracing

## Features

### Core Infrastructure
- **Monorepo Architecture** - Single command starts everything (`pnpm dev`)
- **Runtime Bootstrap** - Automatic DB migrations, health checks, graceful shutdown
- **Error Code System** - 40+ categorized error codes for debugging
- **Request Tracing** - Every request gets correlation ID and request ID

### Security & Authentication
- **Mandatory MFA** - TOTP, WebAuthn (Passkeys), Email backup
- **RBAC** - Role-based access control with deny-by-default
- **Stateless JWT** - Token rotation every 15 minutes
- **Rate Limiting** - Adaptive throttling with overload protection
- **Audit Logs** - Immutable activity tracking

### Database & Persistence
- **Multi-Engine Support** - PostgreSQL, MySQL, MongoDB, SQLite
- **Prisma ORM** - Type-safe database operations
- **Auto-Migration** - Runs on production startup
- **Mandatory Pagination** - Prevents N+1 queries

### Observability
- **Structured Logging** - JSON-only, professional (no emojis), error codes mandatory
- **Performance Metrics** - API latency tracking (p95/p99)
- **Distributed Tracing** - Request flows across services
- **Health Checks** - `/api/health` endpoint

### AI Governance
- **JSON Compliance** - All changes validated against system.json rules
- **Change Protocol** - Enforces multi-file updates and test requirements
- **Forbidden Practices** - Auto-prevents hardcoded configs, magic globals, etc.
- **Architecture Protection** - No unauthorized mutations

### PWA Ready
- **Installable** - Native app experience
- **Offline Support** - Selective caching
- **Service Worker** - Auto-managed

### Testing & Quality
- **Vitest** - Unit and integration tests
- **Playwright** - Cross-browser E2E tests
- **Coverage** - 80% minimum target
- **CI/CD** - GitHub Actions pipeline

## Quick Start

```bash
# Prerequisites: Node.js 18+, pnpm 8+

# Clone the repository
git clone https://github.com/SpectrumLynk/SpectXEngine.git
cd SpectXEngine

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Initialize database
cd packages/db
pnpm db:generate
pnpm db:migrate
cd ../..

# Start development
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
SpectXEngine/
├── apps/
│   └── web/              # Next.js 14 App Router
│       ├── src/app/      # Routes and pages
│       ├── src/middleware.ts  # Request tracing
│       └── src/instrumentation.ts  # Bootstrap hook
│
├── packages/
│   ├── core/            # Infrastructure (logging, cache, queue, metrics)
│   ├── db/              # Prisma abstraction (multi-engine)
│   ├── auth/            # JWT, MFA, RBAC, password hashing
│   └── ai/              # Governance, compliance, change protocol
│
├── tests/
│   └── e2e/             # Playwright tests
│
└── docs/                # Documentation
```

## Architecture Philosophy

SpectXEngine follows strict architectural principles defined in `system.json`:

1. **JSON is the Law** - All governance rules codified
2. **Security by Default** - No bypasses, deny-by-default
3. **Performance as a Feature** - Budgets enforced in CI
4. **AI-First** - Governance automation built-in
5. **No Manual Rearchitecture** - Framework evolves, you don't rewrite

## Key Commands

```bash
# Development
pnpm dev              # Start all apps
pnpm build            # Production build
pnpm start            # Start production

# Testing
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm test:coverage    # Generate coverage

# Quality
pnpm lint             # Lint code
pnpm lint:fix         # Auto-fix issues
pnpm type-check       # TypeScript validation

# Database
cd packages/db
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio

# Analysis
pnpm analyze          # Bundle size analysis
```

## Professional Logging

All logs are structured JSON with mandatory error codes:

```typescript
import { logger, ErrorCode } from '@web-kernel/core';

// Info logs
logger.info('User logged in', { userId, requestId, correlationId });

// Error logs (error code required)
logger.error(
  'Database query failed',
  ErrorCode.DB_QUERY_FAILED,
  error,
  { userId, query }
);
```

## Request Tracing

Every request automatically gets:
- `x-request-id` - Unique request identifier
- `x-correlation-id` - Cross-service correlation
- User context (if authenticated)
- Full distributed trace

## Error Codes

SpectXEngine uses a comprehensive error code system:

- **SYS (1000-1999)** - System errors
- **AUTH (2000-2999)** - Authentication errors
- **DB (3000-3999)** - Database errors
- **VAL (4000-4999)** - Validation errors
- **API (5000-5999)** - API errors
- **AI (6000-6999)** - AI/Governance violations
- **BIZ (7000-7999)** - Business logic errors
- **EXT (8000-8999)** - External service errors

## Performance Budgets

| Metric | Budget | Enforcement |
|--------|--------|-------------|
| Initial Load | <250KB | Webpack (fails build) |
| Time to Interactive | <2s | Monitored |
| API P95 | <200ms | Metrics validation |
| API P99 | <500ms | Metrics validation |

## Deployment

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=your-32-char-minimum-secret
NODE_ENV=production

# Optional
WEBAUTHN_RP_ID=yourdomain.com
WEBAUTHN_ORIGIN=https://yourdomain.com
```

### Production Build

```bash
pnpm build
# Vercel, Netlify, or your platform
```

## Use Cases

### Vibe Coding (Rapid Prototyping)
- **Zero config** - Start coding immediately
- **Hot reload** - See changes instantly
- **AI guardrails** - Stay compliant while moving fast
- **Built-in auth** - No setup needed

### Production Applications
- **Enterprise security** - MFA, RBAC, audit logs
- **Performance tracking** - Real-time metrics
- **Automatic migrations** - DB updates on deploy
- **Health monitoring** - Built-in endpoints

## Documentation

- **[Architecture Guide](docs/bootstrap-completion.md)** - System design and patterns
- **[API Reference](docs/api-contracts.md)** - Endpoint documentation
- **[Contributing](CONTRIBUTING.md)** - How to contribute
- **[System.json](../sys-arch/system.json)** - Complete governance rules

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

All contributions must:
- Pass JSON compliance validation
- Include tests
- Follow error code standards
- Pass CI/CD pipeline

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **State** | Zustand |
| **Backend** | Node.js/Bun, Next.js API Routes |
| **Database** | Prisma (PostgreSQL, MySQL, MongoDB, SQLite) |
| **Auth** | JWT, bcrypt, otplib, SimpleWebAuthn |
| **Testing** | Vitest, Playwright |
| **CI/CD** | GitHub Actions |
| **Linting** | ESLint, Prettier |

## License

Open Source (see LICENSE)

## Community

- **GitHub**: [SpectrumLynk/SpectXEngine](https://github.com/SpectrumLynk/SpectXEngine)
- **Issues**: [Report bugs](https://github.com/SpectrumLynk/SpectXEngine/issues)
- **Discussions**: [Start a discussion](https://github.com/SpectrumLynk/SpectXEngine/discussions)

---

**Built with ❤️ by SpectrumLynk**

*SpectXEngine - Where Enterprise meets Velocity*
