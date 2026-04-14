# Quality Guidelines

> Code quality standards for frontend development.

---

## Overview

**N/A - This project is a CLI tool without frontend-specific quality concerns.**

Frontend quality guidelines (accessibility, browser testing, visual regression) do not apply to CLI tools.

---

## Shared Quality Standards

Quality standards that apply to both frontend and backend:

### TypeScript Strict Mode

All code must pass strict type checking.

```bash
pnpm typecheck
```

### ESLint + Prettier

Linting and formatting are enforced.

```bash
pnpm lint
```

Pre-commit hooks auto-fix formatting.

### Testing with Vitest

Tests are required for all modules.

```bash
pnpm test
```

See [Backend Quality Guidelines](../backend/quality-guidelines.md) for detailed patterns.

---

## If This Were a Frontend Project

Frontend quality guidelines would cover:
- Accessibility (a11y) testing
- Browser compatibility testing
- Visual regression testing
- Performance benchmarks

---

## Anti-patterns

- **Don't** add frontend-specific lint rules
- **Don't** use browser testing frameworks
- **Don't** add accessibility testing for CLI output