# Directory Structure

> How backend/CLI code is organized in this project.

---

## Overview

This project is a **TypeScript CLI tool** using ES modules. The source code follows a **dogfooding architecture** - Trellis uses its own configuration files (`.claude/`, `.opencode/`, `.codex/`, `.trellis/`) as templates for new projects.

---

## Directory Layout

```
src/
├── cli/                 # CLI entry point and argument parsing
│   └── index.ts         # Main CLI entry (Commander.js setup)
├── commands/            # Command implementations
│   └── init.ts          # Each command in its own file
├── configurators/       # Configuration generators
│   ├── index.ts         # Platform registry (PLATFORM_FUNCTIONS, derived helpers)
│   ├── shared.ts        # Shared utilities (resolvePlaceholders)
│   ├── claude.ts        # Claude Code configurator
│   ├── opencode.ts      # OpenCode configurator
│   ├── codex.ts         # Codex configurator
│   └── workflow.ts      # Creates .trellis/ structure
├── constants/           # Shared constants and paths
│   └── paths.ts         # Path constants (centralized)
├── templates/           # Template utilities and generic templates
│   ├── markdown/        # Generic markdown templates
│   │   ├── spec/        # Spec templates (*.md.txt)
│   │   ├── init-agent.md    # Project root file template
│   │   ├── agents.md        # Project root file template
│   │   ├── worktree.yaml.txt # Generic worktree config
│   │   └── index.ts     # Template exports
│   └── extract.ts       # Template extraction utilities
├── types/               # TypeScript type definitions
│   └── ai-tools.ts      # AI tool types and registry
├── utils/               # Shared utility functions
│   ├── compare-versions.ts # Semver comparison with prerelease support
│   ├── file-writer.ts   # File writing with conflict handling
│   ├── project-detector.ts # Project type detection
└── index.ts             # Package entry point (exports public API)
```

### Dogfooding Directories (Project Root)

These directories are copied to `dist/` during build and used as templates:

```
.claude/                 # Claude Code configuration (dogfooded)
├── commands/            # Slash commands
├── agents/              # Multi-agent pipeline agents
├── hooks/               # Context injection hooks
└── settings.json        # Hook configuration

.opencode/               # OpenCode configuration (dogfooded)
├── commands/            # Slash commands
├── agents/              # Agent definitions
├── plugins/             # Context injection plugins
└── package.json         # Plugin dependencies

.codex/                  # Codex configuration (dogfooded)
├── agents/              # Custom agents
├── hooks/               # Session hooks
├── skills/              # Codex-only skills
└── config.toml          # Project config

.trellis/                # Trellis workflow (partially dogfooded)
├── scripts/             # Python scripts (dogfooded)
│   ├── common/          # Shared utilities (paths.py, developer.py, etc.)
│   ├── multi_agent/     # Pipeline scripts (start.py, status.py, etc.)
│   ├── hooks/           # Lifecycle hook scripts (project-specific, NOT dogfooded)
│   └── *.py             # Main scripts (task.py, get_context.py, etc.)
├── workspace/           # Single-user journal tracking
│   └── index.md         # Index template (dogfooded)
├── spec/                # Project guidelines (NOT dogfooded)
│   ├── backend/         # Backend development docs
│   ├── frontend/        # Frontend development docs
│   └── guides/          # Thinking guides
├── workflow.md          # Workflow documentation (dogfooded)
├── worktree.yaml        # Worktree config (Trellis-specific)
└── .gitignore           # Git ignore rules (dogfooded)
```

---

## Dogfooding Architecture

### What is Dogfooded

Files that are copied directly from Trellis project to user projects:

| Source | Destination | Description |
|--------|-------------|-------------|
| `.claude/` | `.claude/` | Entire directory copied |
| `.opencode/` | `.opencode/` | Entire directory copied |
| `.codex/` | `.codex/` | Entire directory copied |
| `.trellis/scripts/` | `.trellis/scripts/` | All scripts copied |
| `.trellis/workflow.md` | `.trellis/workflow.md` | Direct copy |
| `.trellis/.gitignore` | `.trellis/.gitignore` | Direct copy |
| `.trellis/workspace/index.md` | `.trellis/workspace/index.md` | Direct copy |

### What is NOT Dogfooded

Files that use generic templates (in `src/templates/`):

| Template Source | Destination | Reason |
|----------------|-------------|--------|
| `src/templates/markdown/spec/**/*.md.txt` | `.trellis/spec/**/*.md` | User fills with project-specific content |
| `src/templates/markdown/worktree.yaml.txt` | `.trellis/worktree.yaml` | Language-agnostic template |
| `src/templates/markdown/init-agent.md` | `init-agent.md` | Project root file |
| `src/templates/markdown/agents.md` | `AGENTS.md` | Project root file |

### Build Process

```bash
# scripts/copy-templates.js copies dogfooding sources to dist/
pnpm build

# Result:
dist/
├── .claude/           # From project root .claude/
├── .opencode/         # From project root .opencode/
├── .codex/            # From project root .codex/
├── .trellis/          # From project root .trellis/ (filtered)
│   ├── scripts/       # All scripts
│   ├── workspace/
│   │   └── index.md   # Only index.md, no developer subdirs
│   ├── workflow.md
│   ├── worktree.yaml
│   └── .gitignore
└── templates/         # From src/templates/ (no .ts files)
    └── markdown/
        └── spec/      # Generic templates
```

---

## Module Organization

### Layer Responsibilities

| Layer | Directory | Responsibility |
|-------|-----------|----------------|
| CLI | `cli/` | Parse arguments, display help, call commands |
| Commands | `commands/` | Implement CLI commands, orchestrate actions |
| Configurators | `configurators/` | Copy/generate configuration for tools |
| Templates | `templates/` | Extract template content, provide utilities |
| Types | `types/` | TypeScript type definitions |
| Utils | `utils/` | Reusable utility functions |
| Constants | `constants/` | Shared constants (paths, names) |

### Configurator Pattern

Configurators copy filtered template directories into the target project:

```typescript
// configurators/claude.ts
export async function configureClaude(cwd: string): Promise<void> {
  const sourcePath = getClaudeTemplatePath();
  const destPath = path.join(cwd, ".claude");
  await copyDirFiltered(sourcePath, destPath);
}
```

### Template Extraction

`extract.ts` provides utilities for reading dogfooded files:

```typescript
// Get path to .trellis/ templates (works in dev and production)
getTrellisTemplatePath(): string

// Read file from .trellis/
readTrellisFile(relativePath: string): string

// Copy directory from .trellis/ with executable scripts
copyTrellisDir(srcRelativePath: string, destPath: string, options?: { executable?: boolean }): void
```

---

## Naming Conventions

### Files and Directories

| Convention | Example | Usage |
|------------|---------|-------|
| `kebab-case` | `file-writer.ts` | All TypeScript files |
| `snake_case` | `multi_agent/` | Python package directories |
| `*.ts` | `init.ts` | TypeScript source files |
| `*.md.txt` | `index.md.txt` | Template files for markdown |
| `*.yaml.txt` | `worktree.yaml.txt` | Template files for yaml |

### Why `.txt` Extension for Templates

Templates use `.txt` extension to:
- Prevent IDE markdown preview from rendering templates
- Make clear these are template sources, not actual docs
- Avoid confusion with actual markdown files

---

## DO / DON'T

### DO

- Dogfood from project's own config files when possible
- Use `cpSync` for copying entire directories
- Keep generic templates in `src/templates/markdown/`
- Use `.md.txt` or `.yaml.txt` for template files
- Update dogfooding sources (`.claude/`, `.opencode/`, `.codex/`, `.trellis/scripts/`) when making changes
- Always use `python3` explicitly when documenting script invocation (Windows compatibility)

### DON'T

- Don't hardcode file lists - copy entire directories instead
- Don't duplicate content between templates and dogfooding sources
- Don't put project-specific content in generic templates
- Don't use dogfooding for spec/ (users fill these in)

---

## Design Decisions

### Local Spec Template Generation

**Context**: `trellis init` now always generates local blank spec templates from repository-managed markdown templates.

**Decision**:
- no remote downloads during init
- no registry selection during init
- no overwrite/append strategy dedicated to downloaded templates

**Why**:
- deterministic init behavior
- no network dependency
- lower maintenance surface
