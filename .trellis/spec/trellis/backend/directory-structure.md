# Directory Structure

> How code is organized in this TypeScript CLI project.

---

## Overview

This project follows a modular architecture with clear separation between CLI entry point, command handlers, configuration logic, and utilities.

---

## Directory Layout

```
packages/cli/src/
├── cli/           # CLI entry point (commander setup)
├── commands/      # CLI command handlers (init.ts)
├── configurators/ # Template application logic
├── constants/     # Version, paths constants
├── templates/     # Templates copied to user projects
├── types/         # TypeScript type definitions
└── utils/         # Utility functions (file-writer, project-detector)
└── index.ts       # Package entry point
```

---

## Module Organization

### Commands (`src/commands/`)

CLI command handlers go here. Each file exports an async function that implements the command logic.

Example: `src/commands/init.ts`

```typescript
export async function init(options: InitOptions): Promise<void> {
  const cwd = process.cwd();
  // ... command implementation
}
```

### Utilities (`src/utils/`)

Utility functions go here. These are reusable, pure functions that can be imported by commands or configurators.

Example: `src/utils/file-writer.ts`

```typescript
export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}
```

### Configurators (`src/configurators/`)

Template application logic. Each configurator handles copying platform-specific templates to the target project.

Example: `src/configurators/index.ts`

```typescript
export function configurePlatform(platformId: AITool, cwd: string): Promise<void> {
  return PLATFORM_FUNCTIONS[platformId].configure(cwd);
}
```

### Types (`src/types/`)

TypeScript type definitions and interfaces. Define types here for use across the project.

Example: `src/types/ai-tools.ts`

```typescript
export type AITool = "claude-code" | "opencode" | "codex";

export interface AIToolConfig {
  name: string;
  templateDirs: TemplateDir[];
  configDir: string;
  cliFlag: CliFlag;
  defaultChecked: boolean;
  hasPythonHooks: boolean;
}
```

### Constants (`src/constants/`)

Application constants and configuration values. Use `as const` for immutable objects.

Example: `src/constants/paths.ts`

```typescript
export const DIR_NAMES = {
  WORKFLOW: ".trellis",
  WORKSPACE: "workspace",
  TASKS: "tasks",
} as const;
```

---

## Naming Conventions

- **Files**: Use lowercase with hyphens for file names (e.g., `file-writer.ts`, `project-detector.ts`)
- **Directories**: Use lowercase without hyphens for directories (e.g., `utils/`, `commands/`)
- **Exports**: Use named exports (not default exports) for better IDE support

---

## Anti-patterns

- **Don't** put utilities in `commands/` - use `utils/` instead
- **Don't** put types in `utils/` - use `types/` for type definitions
- **Don't** use default exports - named exports provide better IDE navigation
- **Don't** hardcode paths - use constants from `constants/paths.ts`