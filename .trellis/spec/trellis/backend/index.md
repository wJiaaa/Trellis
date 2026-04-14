# Backend Development Guidelines

> Best practices for TypeScript CLI development in this project.

---

## Overview

This directory contains guidelines for backend/CLI development in the Trellis project. Each file documents actual conventions discovered from the codebase.

---

## Guidelines Index

| Guide | Description | Status |
|-------|-------------|--------|
| [Directory Structure](./directory-structure.md) | Module organization and file layout | Filled |
| [Database Guidelines](./database-guidelines.md) | N/A - No database in CLI | N/A |
| [Error Handling](./error-handling.md) | Try/catch with chalk.red, process.exit(1) | Filled |
| [Quality Guidelines](./quality-guidelines.md) | ESLint, TypeScript strict, Vitest | Filled |
| [Logging Guidelines](./logging-guidelines.md) | Chalk for colored console output | Filled |

---

## Key Conventions

### Commands

CLI commands go in `src/commands/`. Each command exports an async function.

### Utilities

Utility functions go in `src/utils/`. Use named exports.

### Types

Type definitions go in `src/types/`. Use union types instead of enums.

### Constants

Application constants go in `src/constants/`. Use `as const` for immutability.

---

## Quick Reference

```bash
pnpm lint        # ESLint for TypeScript
pnpm lint:py     # Type checking for Python
pnpm typecheck   # TypeScript type checking
pnpm test        # Run Vitest tests
```

---

**Language**: All documentation should be written in **English**.