# Type Safety

> Type safety patterns in this TypeScript CLI project.

---

## Overview

TypeScript strict mode is enabled and all code must pass type checking. Types are organized in `src/types/` and used consistently across the project.

---

## Type Organization

Types are defined in dedicated files in `src/types/`.

Example: `src/types/ai-tools.ts`

```typescript
export type AITool = "claude-code" | "opencode" | "codex";

export type TemplateDir = "common" | "claude" | "opencode" | "codex";

export type CliFlag = "claude" | "opencode" | "codex";

export interface AIToolConfig {
  name: string;
  templateDirs: TemplateDir[];
  configDir: string;
  cliFlag: CliFlag;
  defaultChecked: boolean;
  hasPythonHooks: boolean;
}
```

---

## Type Patterns

### Union Types for Enumerations

Use union types instead of enums for string constants.

```typescript
export type AITool = "claude-code" | "opencode" | "codex";
```

### Const Assertions for Immutable Objects

Use `as const` for runtime constants that need precise type inference.

Example: `src/constants/paths.ts`

```typescript
export const DIR_NAMES = {
  WORKFLOW: ".trellis",
  WORKSPACE: "workspace",
  TASKS: "tasks",
} as const;
```

### Interface for Object Shapes

Use interfaces for object shapes, not type aliases.

```typescript
export interface AIToolConfig {
  name: string;
  templateDirs: TemplateDir[];
  configDir: string;
}
```

### Compile-time Assertions

Use type assertions to enforce constraints at compile time.

Example: `src/commands/init.ts`

```typescript
// Compile-time check: every CliFlag must be a key of InitOptions
type _AssertCliFlagsInOptions = [CliFlag] extends [keyof InitOptions]
  ? true
  : "ERROR: CliFlag has values not present in InitOptions";
const _cliFlagCheck: _AssertCliFlagsInOptions = true;
```

---

## Forbidden Patterns

### Don't Use `any`

Avoid `any` type - use `unknown` or specific types.

```typescript
// ❌ Forbidden
function process(data: any) {}

// ✓ Required
function process(data: unknown) {
  if (typeof data === "string") {
    // ...
  }
}
```

### Don't Use Type Assertions Without Validation

Avoid asserting types without runtime checks.

```typescript
// ❌ Forbidden
const result = data as MyType;

// ✓ Required
if (isValidMyType(data)) {
  const result = data;
}
```

### Don't Use Enums for Strings

Use union types instead of enums.

```typescript
// ❌ Forbidden
enum AITool {
  ClaudeCode = "claude-code",
  OpenCode = "opencode",
}

// ✓ Required
type AITool = "claude-code" | "opencode" | "codex";
```

---

## Validation

This project does not use runtime validation libraries (Zod, Yup). Types are trusted to match data structures at compile time.

---

## Anti-patterns

- **Don't** use `any` type
- **Don't** use enums for string constants
- **Don't** put types in utility files - use `types/` directory
- **Don't** use type assertions without runtime validation