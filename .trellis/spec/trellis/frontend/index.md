# Frontend Development Guidelines

> Best practices for frontend development in this project.

---

## Overview

**N/A - This project is a CLI tool without a frontend.**

This directory contains placeholder guidelines. Frontend patterns do not apply to this TypeScript CLI project.

---

## Guidelines Index

| Guide | Description | Status |
|-------|-------------|--------|
| [Directory Structure](./directory-structure.md) | N/A - CLI tool | N/A |
| [Component Guidelines](./component-guidelines.md) | N/A - CLI tool | N/A |
| [Hook Guidelines](./hook-guidelines.md) | N/A - CLI tool (note: Python hooks exist) | N/A |
| [State Management](./state-management.md) | N/A - CLI tool | N/A |
| [Quality Guidelines](./quality-guidelines.md) | Shared with backend | See Backend |
| [Type Safety](./type-safety.md) | TypeScript patterns | Filled |

---

## What This Project Uses Instead

This CLI project uses:

- **Commander.js** for CLI argument parsing
- **Inquirer.js** for interactive prompts
- **Chalk** for colored output
- **Vitest** for testing

See [Backend Guidelines](../backend/index.md) for applicable patterns.

---

## If Adding a Frontend

If a web UI is added in the future, guidelines should be filled for:
- React/Vue component patterns
- State management (Zustand, React Query)
- Accessibility requirements
- Browser testing

---

**Language**: All documentation should be written in **English**.