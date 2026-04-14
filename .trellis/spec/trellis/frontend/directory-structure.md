# Directory Structure

> How frontend code is organized in this project.

---

## Overview

**N/A - This project is a CLI tool without a frontend.**

This project does not have:
- UI components
- Pages or views
- Frontend state management
- Client-side routing

---

## CLI vs Frontend Architecture

This is a **Commander.js CLI application** with the following structure:

```
packages/cli/src/
├── cli/           # CLI entry point
├── commands/      # Command handlers
├── configurators/ # Template logic
├── utils/         # Utility functions
└── types/         # TypeScript types
```

See [Backend Directory Structure](../backend/directory-structure.md) for actual module organization.

---

## If This Were a Frontend Project

A typical frontend directory structure would be:

```
src/
├── components/    # UI components
├── pages/         # Page-level components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript types
└── styles/        # CSS/styling
```

---

## Anti-patterns

- **Don't** add frontend-specific directories to this CLI project
- **Don't** use React/Vue/Angular patterns in CLI code