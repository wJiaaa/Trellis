# Component Guidelines

> How components are built in this project.

---

## Overview

**N/A - This project is a CLI tool without a frontend.**

This project does not have:
- React/Vue/Angular components
- JSX/TSX files
- CSS styling
- UI rendering

---

## CLI "Components"

Instead of UI components, this CLI uses:

### Command Handlers

CLI "components" are command handlers that process user input.

Example: `src/commands/init.ts`

```typescript
export async function init(options: InitOptions): Promise<void> {
  const cwd = process.cwd();
  // ... command logic
}
```

### Configurators

Template application logic is modular like components.

Example: `src/configurators/index.ts`

```typescript
const PLATFORM_FUNCTIONS: Record<AITool, PlatformFunctions> = {
  "claude-code": { configure: configureClaude, ... },
  "opencode": { configure: configureOpenCode, ... },
  "codex": { configure: configureCodex, ... },
};
```

---

## If This Were a Frontend Project

Component guidelines would cover:
- Component file structure
- Props conventions
- Styling patterns
- Accessibility requirements

---

## Anti-patterns

- **Don't** create JSX/TSX files in this CLI project
- **Don't** use component lifecycle patterns (useEffect, useState)