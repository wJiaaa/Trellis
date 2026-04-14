# State Management

> How state is managed in this project.

---

## Overview

**N/A - This project is a CLI tool without frontend state.**

This project does not have:
- Global state store (Redux, Zustand, etc.)
- Local component state
- Server state caching (React Query, SWR)
- URL state

---

## CLI State Patterns

CLI state is simpler and uses:

### Global Module State

Use module-level variables for global configuration.

Example: `src/utils/file-writer.ts`

```typescript
let globalWriteMode: WriteMode = "ask";

export function setWriteMode(mode: WriteMode): void {
  globalWriteMode = mode;
}

export function getWriteMode(): WriteMode {
  return globalWriteMode;
}
```

### Process-based State

State is ephemeral per process invocation - no persistence needed.

Example: `src/commands/init.ts`

```typescript
const cwd = process.cwd(); // Current working directory
const isFirstInit = !fs.existsSync(path.join(cwd, DIR_NAMES.WORKFLOW));
```

### File-based State

Persistent state is stored in files, not in memory.

Example: `src/constants/paths.ts`

```typescript
export const PATHS = {
  CURRENT_TASK_FILE: ".trellis/.current-task",
  WORKSPACE: ".trellis/workspace",
} as const;
```

---

## If This Were a Frontend Project

State management guidelines would cover:
- Local vs global state decisions
- Server state caching
- State persistence
- State synchronization

---

## Anti-patterns

- **Don't** use Redux/Zustand patterns in CLI code
- **Don't** create in-memory state stores
- **Don't** use React Query/SWR patterns