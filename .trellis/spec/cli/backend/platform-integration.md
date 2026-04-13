# Platform Integration Guide

How platform support works in this repo after the reduction to Claude Code, OpenCode, and Codex only.

---

## Active Platforms

| Platform ID | Config Dir | Pattern |
|------------|------------|---------|
| `claude-code` | `.claude/` | commands + agents + hooks |
| `opencode` | `.opencode/` | commands + agents + JS plugins |
| `codex` | `.codex/` + `.agents/skills/` | codex config + shared skills |

Anything outside this set is legacy and should not be reintroduced casually.

---

## Source of Truth

Platform support must stay aligned across these files:

1. `src/types/ai-tools.ts`
   Platform ids, config dirs, template dirs, and CLI flags.
2. `src/configurators/index.ts`
   Configure functions, managed paths, and template tracking.
3. `src/cli/index.ts`
   `trellis init` flags exposed to users.
4. `src/commands/init.ts`
   `InitOptions` and default platform selection behavior.
5. `src/templates/extract.ts`
   Template path helpers exposed to tests and configurators.
6. `.trellis/scripts/common/cli_adapter.py`
   Python runtime adapter used in generated projects.
7. `.trellis/scripts/multi_agent/{plan,start}.py`
   Runtime CLI entry points and supported `--platform` choices.

If one of these changes without the others, support drifts.

---

## Platform-Specific Rules

### Claude Code

- Template root: `src/templates/claude/`
- Generated root: `.claude/`
- Uses Markdown commands, Markdown agents, and Python hooks
- `collectPlatformTemplates()` must track `.claude/` files for update

### OpenCode

- Template root: `src/templates/opencode/`
- Generated root: `.opencode/`
- Uses Markdown commands, Markdown agents, and JS plugins
- Copied recursively by its configurator
- Not tracked by `collectPlatformTemplates()`

### Codex

- Template root: `src/templates/codex/`
- Generated roots:
  - `.agents/skills/` for shared skills
  - `.codex/` for project-scoped codex config
- Agents are `.toml`
- Codex detection must depend on `.codex/`, not shared skills alone

---

## Python Runtime Rules

The runtime adapter must only support:

- `claude`
- `opencode`
- `codex`

And must keep these behaviors:

- `config_dir_name`
  Returns only `.claude`, `.opencode`, or `.codex`
- `get_trellis_command_path()`
  Returns `.agents/skills/<name>/SKILL.md` for Codex and `commands/trellis/<name>.md` for Claude/OpenCode
- `build_run_command()`
  Must work for all three active CLIs
- `detect_platform()`
  Must only inspect active platform directories

Whenever `.trellis/scripts/common/cli_adapter.py` changes, sync it back to:

- `packages/cli/src/templates/trellis/scripts/common/cli_adapter.py`

---

## Testing Requirements

When platform support changes, run:

```bash
pnpm --filter @mindfoldhq/trellis typecheck
pnpm --filter @mindfoldhq/trellis lint
pnpm --filter @mindfoldhq/trellis test
```

The main test files are:

- `test/configurators/index.test.ts`
- `test/commands/init.integration.test.ts`
- `test/templates/claude.test.ts`
- `test/templates/opencode.test.ts`
- `test/templates/codex.test.ts`
- `test/templates/extract.test.ts`

---

## Common Failure Modes

### Registry Drift

Symptom: `trellis init` offers a different platform set than the configurators actually support.

Fix: update `ai-tools.ts`, `configurators/index.ts`, and `cli/index.ts` together.

### Template Drift

Symptom: live `.trellis/scripts` behaves differently from newly generated projects.

Fix: sync `.trellis/scripts/` back into `src/templates/trellis/scripts/`.

### Codex Detection Drift

Symptom: a repo with only shared `.agents/skills/` is treated as a Codex project.

Fix: Codex detection must require `.codex/`.

---

## Rule

Do not expand platform support unless:

- the new platform fits the current single-user workflow
- runtime and template behavior are both defined
- tests are added at the same time
