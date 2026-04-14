# Quality Guidelines

> Code quality standards for this TypeScript CLI project.

---

## Overview

This project enforces quality through ESLint, Prettier, TypeScript strict mode, and Vitest testing.

---

## Code Quality Commands

```bash
pnpm lint        # ESLint for TypeScript
pnpm lint:py     # Type checking for Python (basedpyright)
pnpm lint:all    # Run both
pnpm typecheck   # TypeScript type checking
```

---

## Required Patterns

### TypeScript Strict Mode

All TypeScript code must pass strict type checking.

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

### Named Exports

Use named exports instead of default exports.

Example: `src/utils/file-writer.ts`

```typescript
export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export async function writeFile(
  filePath: string,
  content: string,
  options?: { executable?: boolean },
): Promise<boolean> {
  // ...
}
```

### Type Assertions for Compile-time Checks

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

## Testing Requirements

### Vitest Framework

Use Vitest for testing with `beforeEach/afterEach` for setup/teardown.

Example: `test/utils/file-writer.test.ts`

```typescript
describe("writeFile", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "trellis-write-"));
    setWriteMode("force");
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    setWriteMode("ask");
  });

  it("writes new file when it does not exist", async () => {
    const filePath = path.join(tmpDir, "new.txt");
    const result = await writeFile(filePath, "content");
    expect(result).toBe(true);
  });
});
```

### Mock External Modules

Use `vi.mock()` for mocking external modules.

Example: `test/commands/init.integration.test.ts`

```typescript
vi.mock("figlet", () => ({
  default: { textSync: vi.fn(() => "TRELLIS") },
}));

vi.mock("inquirer", () => ({
  default: { prompt: vi.fn().mockResolvedValue({}) },
}));
```

---

## Forbidden Patterns

### Don't Use Default Exports

Default exports reduce IDE navigation and refactoring capability.

```typescript
// ❌ Forbidden
export default function init() {}

// ✓ Required
export async function init(options: InitOptions): Promise<void> {}
```

### Don't Hardcode Paths

Use constants from `constants/paths.ts`.

```typescript
// ❌ Forbidden
const taskDir = ".trellis/tasks";

// ✓ Required
import { PATHS } from "../constants/paths.js";
const taskDir = PATHS.TASKS;
```

### Don't Use `any` Type

Avoid `any` - use specific types or generics.

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

---

## Code Review Checklist

- [ ] Lint passes (`pnpm lint`)
- [ ] Type check passes (`pnpm typecheck`)
- [ ] Tests pass (`pnpm test`)
- [ ] Named exports used (not default)
- [ ] No hardcoded paths
- [ ] Error handling follows patterns
- [ ] Commit message follows convention (`type(scope): description`)