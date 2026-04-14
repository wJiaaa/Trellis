# Logging Guidelines

> How logging is done in this CLI project.

---

## Overview

This project uses `chalk` for colored console output and `console.log/console.error` for CLI messages. There is no structured logging library - output goes directly to the terminal.

---

## Output Functions

Use `console.log` for normal output and `console.error` for errors.

```typescript
console.log(chalk.cyan(`\n${banner.trimEnd()}`));
console.error(chalk.red("Error:"), error instanceof Error ? error.message : error);
```

---

## Color Usage with Chalk

### chalk.cyan - Banner/Headers

Use for banners and major section headers.

Example: `src/commands/init.ts`

```typescript
console.log(chalk.cyan(`\n${banner.trimEnd()}`));
```

### chalk.blue - Progress/Actions

Use for progress messages and action descriptions.

Example: `src/commands/init.ts`

```typescript
console.log(chalk.blue("📁 Creating workflow structure..."));
console.log(chalk.blue(`📝 Configuring ${AI_TOOLS[platformId].name}...`));
```

### chalk.gray - Neutral/Skip Messages

Use for neutral information and skipped items.

Example: `src/utils/file-writer.ts`

```typescript
console.log(chalk.gray(`  ○ Skipped: ${displayPath} (already exists)`));
```

### chalk.yellow - Warnings/Overwrites

Use for warnings and overwritten files.

Example: `src/commands/init.ts`

```typescript
console.log(chalk.yellow("No tools selected. At least one tool is required."));
```

Example: `src/utils/file-writer.ts`

```typescript
console.log(chalk.yellow(`  ↻ Overwritten: ${displayPath}`));
```

### chalk.red - Errors

Use for error messages.

Example: `src/cli/index.ts`

```typescript
console.error(chalk.red("Error:"), error instanceof Error ? error.message : error);
```

### chalk.green - Success

Use for success messages.

Example: `src/commands/init.ts`

```typescript
console.log(chalk.green("✓ All available platforms are already configured."));
```

### chalk.white - Emphasis

Use for emphasized text in longer messages.

Example: `src/commands/init.ts`

```typescript
console.log(chalk.green("  ✓ ") + chalk.white("Thinking Guides + Ralph Loop: Think first, verify after"));
```

---

## Message Patterns

### Action Prefixes

Use emoji prefixes to indicate action type:

- `📁` - Directory creation
- `📝` - Configuration/writing
- `🔍` - Detection/search
- `📌` - Notice/important info
- `✓` - Success/completion
- `○` - Skip
- `↻` - Overwrite
- `+` - Append

Example: `src/commands/init.ts`

```typescript
console.log(chalk.blue("📁 Creating workflow structure..."));
console.log(chalk.blue("📝 Configuring Claude Code..."));
console.log(chalk.blue("🔍 Detected monorepo packages:"));
```

### Indentation

Use 2-3 space indentation for nested messages.

Example: `src/commands/init.ts`

```typescript
console.log(chalk.blue("\n🔍 Detected monorepo packages:"));
for (const pkg of detected) {
  console.log(chalk.gray(`   - ${pkg.name}`) + chalk.gray(` (${pkg.path})`));
}
```

---

## What to Log

- User-facing progress messages during init
- Configuration status (created/skipped/overwritten)
- Detected project information
- Error messages with actionable information

---

## What NOT to Log

- Internal debug information (use comments instead)
- Stack traces (only in development)
- Sensitive information (none in this CLI)