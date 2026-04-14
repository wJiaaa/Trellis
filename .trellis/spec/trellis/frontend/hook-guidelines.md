# Hook Guidelines

> How hooks are used in this project.

---

## Overview

**N/A - This project is a CLI tool without React hooks.**

This project does not use React hooks because:
- No React runtime
- No component lifecycle
- No useState/useEffect patterns

---

## CLI Hooks (Python)

This project uses **Python hooks** for AI platform integration, not React hooks.

Example hook files are stored in templates:

```
src/templates/claude/hooks/
src/templates/codex/hooks/
```

These Python hooks run during AI platform events (session start, statusline updates).

---

## Utility Functions Instead of Hooks

In CLI code, utility functions serve the same purpose as custom hooks in React.

Example: `src/utils/file-writer.ts`

```typescript
export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export async function writeFile(
  filePath: string,
  content: string,
): Promise<boolean> {
  // ...
}
```

---

## If This Were a Frontend Project

Hook guidelines would cover:
- Custom hook naming (useXxx)
- Data fetching patterns
- State management hooks
- Hook composition

---

## Anti-patterns

- **Don't** create React-style hooks in CLI code
- **Don't** use useState/useEffect patterns
- **Don't** confuse Python hooks with React hooks