# Database Guidelines

> Database patterns and conventions for this project.

---

## Overview

**N/A - This project does not use a database.**

This is a CLI tool that:
- Reads/writes files to the filesystem using Node.js `fs` module
- Does not persist data in a database
- Does not use an ORM or query library

---

## File Storage Patterns

Instead of a database, this project uses:

### JSON Files for Configuration

Example: `src/commands/init.ts`

```typescript
const taskJson = getBootstrapTaskJson(projectType, packages);
fs.writeFileSync(
  path.join(taskDir, FILE_NAMES.TASK_JSON),
  JSON.stringify(taskJson, null, 2),
  "utf-8",
);
```

### Directory-based Storage

Example: `src/constants/paths.ts`

```typescript
export const PATHS = {
  WORKFLOW: ".trellis",
  WORKSPACE: ".trellis/workspace",
  TASKS: ".trellis/tasks",
  SPEC: ".trellis/spec",
} as const;
```

---

## Anti-patterns

- **Don't** introduce database dependencies
- **Don't** use localStorage (this is a CLI, not a browser app)
- **Don't** use complex file formats - prefer JSON or YAML