# Error Handling

> How errors are handled in this CLI project.

---

## Overview

This project uses a consistent error handling pattern with `try/catch` blocks, colored output via `chalk`, and `process.exit(1)` for fatal errors.

---

## Error Types

This project does not define custom error classes. Errors are handled using standard `Error` objects and `instanceof Error` checks.

---

## Error Handling Patterns

### CLI Entry Point Error Handling

Wrap async command calls in `try/catch` and exit with error code 1.

Example: `src/cli/index.ts`

```typescript
.action(async (options: Record<string, unknown>) => {
  try {
    await init(options);
  } catch (error) {
    console.error(
      chalk.red("Error:"),
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
});
```

### Command-level Error Handling

Commands can throw errors that will be caught at the CLI entry point.

Example: `src/commands/init.ts`

```typescript
if (options.monorepo === true && !detected) {
  console.log(
    chalk.red(
      "Error: --monorepo specified but no monorepo configuration found.",
    ),
  );
  return;
}
```

---

## Error Display Format

Use `chalk.red("Error:")` prefix followed by the error message.

Example: `src/cli/index.ts`

```typescript
console.error(chalk.red("Error:"), error instanceof Error ? error.message : error);
```

---

## Common Patterns

### instanceof Error Check

Always check `error instanceof Error` before accessing `.message`.

```typescript
error instanceof Error ? error.message : error
```

### Silent Failure with Return

For non-fatal errors, use early return without throwing.

```typescript
if (tools.length === 0) {
  console.log(chalk.yellow("No tools selected. At least one tool is required."));
  return;
}
```

---

## Anti-patterns

- **Don't** throw without catching at the CLI entry point
- **Don't** use `console.log` for errors - use `console.error` with `chalk.red`
- **Don't** access `.message` without `instanceof Error` check
- **Don't** catch and continue after fatal errors - use `process.exit(1)`