# Contributing to SpectXEngine

Thank you for your interest in contributing! SpectXEngine is governed by `system.json` rules to maintain quality and consistency.

## Development Workflow

1. **Fork and clone** the repository
2. **Install dependencies**: `pnpm install`
3. **Create a branch**: `git checkout -b feature/your-feature`
4. **Make changes** following the architecture
5. **Write tests** for new functionality
6. **Run checks**: `pnpm lint && pnpm type-check && pnpm test`
7. **Commit**: Use conventional commits (e.g., `feat:`, `fix:`, `docs:`)
8. **Push** and create a pull request

## system.json Compliance

All changes MUST comply with `system.json` rules:

### ✅ Allowed
- Creating/modifying files with proper dependency analysis
- Adding features with comprehensive tests
- Improving performance within budget constraints

### ❌ Forbidden
- Architecture mutations without JSON approval
- Library additions without system.json update
- Single-file changes affecting dependencies
- Hardcoded configuration
- Bypassing MFA
- Silent failures

## Code Standards

- **TypeScript**: Strict mode, explicit types
- **Testing**: 80% minimum coverage
- **Performance**: Stay within budgets (250KB, 2s TTI)
- **Security**: No secrets in code, input validation mandatory

## Pull Request Checklist

- [ ] Tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] E2E tests pass (`pnpm test:e2e`)
- [ ] Bundle size within budget
- [ ] Documentation updated
- [ ] Dependency analysis performed
- [ ] No forbidden practices introduced

## Questions?

Open an issue for discussion before starting work on major features.
