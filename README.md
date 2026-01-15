# Unified Enterprise Web Kernel

🚀 **AI-governed, enterprise-grade monorepo foundation for web and PWA projects**

A production-ready Next.js-based framework compliant with [system.json](../sys-arch/system.json) specifications, featuring mandatory MFA, RBAC, AI governance, and architectural enforcement.

## ✨ Features

### 🔒 Security First
- **Mandatory MFA**: TOTP, WebAuthn (Passkeys), Email backup codes
- **RBAC**: Role-based access control with deny-by-default
- **Stateless JWT**: Token rotation every 15 minutes
- **Rate Limiting**: Adaptive throttling with overload protection
- **Immutable Audit Logs**: Complete activity tracking

### 🤖 AI-Governed
- **JSON Compliance**: All changes validated against `system.json`
- **Change Protocol**: Mandatory dependency analysis and multi-file updates
- **Forbidden Practices**: Automatic detection and prevention
- **Architecture Protection**: No unauthorized mutations

### ⚡ Performance Optimized
- **Bundle Budgets**: <250KB initial load enforced
- **Time to Interactive**: <2s target (p95: 200ms, p99: 500ms)
- **Code Splitting**: Automatic lazy loading
- **Structured Logging**: Performance metrics tracked

### 📱 PWA Ready
- **Installable**: Native app experience
- **Offline Support**: Selective caching
- **Service Worker**: Managed automatically

## 🏗️ Architecture

```
web-kernel/
├── apps/
│   └── web/              # Next.js 14 App Router
│       ├── src/app/      # Routes and pages
│       └── public/       # Static assets
├── packages/
│   ├── core/            # Infrastructure (logging, cache, queue, metrics)
│   ├── db/              # Prisma abstraction (PostgreSQL/MySQL/MongoDB/SQLite)
│   ├── auth/            # JWT, MFA, RBAC, password hashing
│   └── ai/              # Governance, compliance, change protocol
├── tests/
│   └── e2e/             # Playwright tests
└── .github/
    └── workflows/        # CI/CD pipeline
```

## 🚀 Quick Start

### Prerequisites
- **Node.js**: >=18.0.0
- **pnpm**: >=8.0.0

### Installation

```bash
# Clone the repository
cd web-kernel

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# - Set DATABASE_URL
# - Set JWT_SECRET (min 32 characters)
# - Configure WebAuthn for your domain

# Initialize database
cd packages/db
pnpm db:generate
pnpm db:migrate

# Start development server (single command!)
cd ../..
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📦 Available Commands

```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm build            # Build all apps for production
pnpm start            # Start production servers

# Testing
pnpm test             # Run unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Generate coverage report (target: 80%)
pnpm test:e2e         # Run E2E tests with Playwright

# Quality
pnpm lint             # Lint all code
pnpm lint:fix         # Auto-fix linting issues
pnpm format           # Format code with Prettier
pnpm type-check       # TypeScript validation

# Database
cd packages/db
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio

# Analysis
pnpm analyze          # Bundle size analysis
```

## 🔐 Authentication Flow

### User Registration
1. User provides email + password (strength validated)
2. **MFA Setup** (MANDATORY - no bypass)
   - Choose: TOTP, WebAuthn, or Email backup
   - TOTP: Scan QR code with authenticator app
   - WebAuthn: Register passkey (fingerprint/Face ID)
   - Email: Receive backup codes
3. Account created with JWT tokens

### Login
1. Email + Password validation
2. **MFA Challenge** (always required)
3. Issue access token (15min) + refresh token (7d)
4. Token rotation on refresh

## 🛡️ RBAC Authorization

```typescript
import { rbacService, createDefaultRoles } from '@web-kernel/auth';

const rolePermissions = createDefaultRoles();

// Check permission (deny by default)
const canEdit = rbacService.hasPermission(
  userRoles,          // ['user', 'editor']
  rolePermissions,
  'profile',          // resource
  'update'            // action
);

// Require permission (throws on deny)
rbacService.requirePermission(userRoles, rolePermissions, 'admin', 'delete');
```

### Default Roles
- **admin**: All permissions (`*:*`)
- **user**: Read/update own profile and settings
- **guest**: Read public content only

## 🤖 AI Governance

The AI agent runtime enforces `system.json` rules:

```typescript
import { agentRuntime, complianceValidator } from '@web-kernel/ai';

// Check operation permission
complianceValidator.canPerformOperation('modify'); // true/false

// Propose change (validates against protocol)
const result = await agentRuntime.proposeChange({
  changes: [
    { path: 'src/utils.ts', type: 'modify', content: '...' },
    { path: 'src/utils.test.ts', type: 'modify', content: '...' },
  ],
  description: 'Refactor utility functions',
  dependencyAnalysis: true,
  testsIncluded: true,
});

if (!result.approved) {
  console.error('Violations:', result.violations);
  // Auto-rollback triggered
}
```

### Forbidden Practices (Auto-Prevented)
- Hardcoded configuration
- Magic globals
- Unchecked user input
- Implicit side effects
- Partial feature implementation
- Single-file changes with dependencies

## 📊 Observability

### Structured Logging
```typescript
import { logger, createLogger } from '@web-kernel/core';

logger.info('User logged in', { userId: '123', method: 'webauthn' });
logger.error('Database connection failed', error, { retryCount: 3 });

// Child logger with context
const requestLogger = logger.child({ requestId: 'req-456' });
requestLogger.debug('Processing request');
```

### Metrics
```typescript
import { metrics } from '@web-kernel/core';

metrics.recordApiLatency('/api/users', 45); // ms
metrics.recordError('ValidationError', '/api/auth');
metrics.recordAiDecision('file:modify', 120, true);

// Validate performance budgets
const perf = metrics.validateApiPerformance('/api/users');
// { p95: 180, p99: 420, withinBudget: true }
```

### Distributed Tracing
```typescript
import { tracing } from '@web-kernel/core';

const span = tracing.startSpan('database:query');
// ... perform operation ...
tracing.endSpan(span.spanId, { rowsAffected: 10 });
```

## 🗄️ Database

### Supported Engines
- PostgreSQL (recommended)
- MySQL
- MongoDB
- SQLite (development fallback)

### Pagination (Mandatory)
```typescript
import { db, paginate } from '@web-kernel/db';

const result = await paginate(
  db.getClient().user.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
  }),
  db.getClient().user.count(),
  { page: 1, pageSize: 20 }
);

// result.data, result.pagination.total, result.pagination.totalPages
```

## 🧪 Testing

### Unit Tests (Vitest)
```bash
pnpm test
# Coverage target: 80% minimum
```

### E2E Tests (Playwright)
```bash
pnpm test:e2e
# Tests on: Chrome, Firefox, Safari, Mobile Chrome
```

## 🚢 Deployment

### Environment Variables
```bash
# Production
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=min-32-char-secret
WEBAUTHN_RP_ID=yourdomain.com
WEBAUTHN_ORIGIN=https://yourdomain.com
```

### Build
```bash
pnpm build
# Enforces bundle size budgets
# Fails if >250KB initial load
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install && pnpm build
CMD ["pnpm", "start"]
```

## 📚 Documentation

- [Developer Guide](./docs/developer-guide.md) - Architecture details
- [API Contracts](./docs/api-contracts.md) - Versioning and contracts
- [Contributing](./CONTRIBUTING.md) - Contribution guidelines

## 🔧 Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **State**: Zustand
- **Backend**: Node.js/Bun, Next.js API Routes
- **Database**: Prisma (multi-engine support)
- **Auth**: JWT, bcrypt, otplib, SimpleWebAuthn
- **Testing**: Vitest, Playwright
- **CI/CD**: GitHub Actions
- **Linting**: ESLint, Prettier

## 🎯 Performance Budgets (Enforced)

| Metric | Budget | Status |
|--------|--------|--------|
| Initial Load | <250KB | ✅ Enforced |
| Time to Interactive | <2s | ✅ Monitored |
| API P95 | <200ms | ✅ Validated |
| API P99 | <500ms | ✅ Validated |

## 📄 License

Open source only (per system.json)

## 🤝 Contributing

This project is governed by `system.json`. All contributions must:
1. Pass JSON compliance validation
2. Include dependency analysis
3. Update tests
4. Pass CI/CD pipeline

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

**Built with ❤️ following system.json governance**
