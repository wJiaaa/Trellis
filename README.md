<p align="center">
<picture>
<source srcset="assets/trellis.png" media="(prefers-color-scheme: dark)">
<source srcset="assets/trellis.png" media="(prefers-color-scheme: light)">
<img src="assets/trellis.png" alt="Trellis Logo" width="500" style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;">
</picture>
</p>

<p align="center">
<strong>A personal AI coding workflow framework</strong><br/>
<sub>Supports Claude Code, OpenCode, and Codex.</sub>
</p>

<p align="center">
<a href="./README_CN.md">简体中文</a> •
<a href="https://docs.trytrellis.app/">Docs</a> •
<a href="https://docs.trytrellis.app/guide/ch02-quick-start">Quick Start</a> •
<a href="https://docs.trytrellis.app/guide/ch13-multi-platform">Supported Platforms</a> •
<a href="https://docs.trytrellis.app/guide/ch08-real-world">Use Cases</a>
</p>

<p align="center">
<a href="https://www.npmjs.com/package/@mindfoldhq/trellis"><img src="https://img.shields.io/npm/v/@mindfoldhq/trellis.svg?style=flat-square&color=2563eb" alt="npm version" /></a>
<a href="https://www.npmjs.com/package/@mindfoldhq/trellis"><img src="https://img.shields.io/npm/dw/@mindfoldhq/trellis?style=flat-square&color=cb3837&label=downloads" alt="npm downloads" /></a>
<a href="https://github.com/mindfold-ai/Trellis/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-16a34a.svg?style=flat-square" alt="license" /></a>
<a href="https://github.com/mindfold-ai/Trellis/stargazers"><img src="https://img.shields.io/github/stars/mindfold-ai/Trellis?style=flat-square&color=eab308" alt="stars" /></a>
<a href="https://docs.trytrellis.app/"><img src="https://img.shields.io/badge/docs-trytrellis.app-0f766e?style=flat-square" alt="docs" /></a>
<a href="https://discord.com/invite/tWcCZ3aRHc"><img src="https://img.shields.io/badge/Discord-Join-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord" /></a>
<a href="https://github.com/mindfold-ai/Trellis/issues"><img src="https://img.shields.io/github/issues/mindfold-ai/Trellis?style=flat-square&color=e67e22" alt="open issues" /></a>
<a href="https://github.com/mindfold-ai/Trellis/pulls"><img src="https://img.shields.io/github/issues-pr/mindfold-ai/Trellis?style=flat-square&color=9b59b6" alt="open PRs" /></a>
<a href="https://deepwiki.com/mindfold-ai/Trellis"><img src="https://img.shields.io/badge/Ask-DeepWiki-blue?style=flat-square" alt="Ask DeepWiki" /></a>
<a href="https://chatgpt.com/?q=Explain+the+project+mindfold-ai/Trellis+on+GitHub"><img src="https://img.shields.io/badge/Ask-ChatGPT-74aa9c?style=flat-square&logo=openai&logoColor=white" alt="Ask ChatGPT" /></a>
</p>

<p align="center">
<img src="assets/trellis-demo.gif" alt="Trellis workflow demo" width="100%">
</p>

## Why Trellis?

| Capability | What it changes |
| --- | --- |
| **Auto-injected specs** | Write conventions once in `.trellis/spec/`, then let Trellis inject the relevant context into each session instead of repeating yourself. |
| **Task-centered workflow** | Keep PRDs, implementation context, review context, and task status in `.trellis/tasks/` so AI work stays structured. |
| **Parallel agent execution** | Run multiple AI tasks side by side with git worktrees instead of turning one branch into a traffic jam. |
| **Project memory** | Journals in `.trellis/workspace/` preserve what happened last time, so each new session starts with real context. |
| **Versioned standards** | Specs live in the repo, so your hard-won workflow and rules keep benefiting future sessions. |
| **Focused platform setup** | Bring the same Trellis structure to Claude Code, OpenCode, and Codex instead of rebuilding your workflow per tool. |

## Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.10 (required for hooks and automation scripts)

## Quick Start

```bash
# 1. Install Trellis
npm install -g @mindfoldhq/trellis@latest

# 2. Initialize in your repo
trellis init

# 3. Or initialize with the platforms you actually use
trellis init --opencode --codex
```

- Trellis now uses a single workspace at `.trellis/workspace/` for journals and session continuity.
- Platform flags can be mixed and matched. Current options are `--claude`, `--opencode`, and `--codex`.
- For platform-specific setup, entry commands, and upgrade paths, use the docs:
  [Quick Start](https://docs.trytrellis.app/guide/ch02-quick-start) •
  [Supported Platforms](https://docs.trytrellis.app/guide/ch13-multi-platform) •
  [Real-World Scenarios](https://docs.trytrellis.app/guide/ch08-real-world)

## Use Cases

### Teach AI your project once

Put coding standards, file structure rules, review habits, and workflow preferences into Markdown specs. Trellis loads the relevant pieces automatically so you do not have to re-explain the repo every time.

### Run multiple AI tasks in parallel

Use git worktrees and Trellis task structure to split work cleanly across agents. Different tasks can move forward at the same time without stepping on each other’s branches or local state.

### Turn project history into usable memory

Task PRDs, checklists, and workspace journals make previous decisions available to the next session. Instead of starting from blank context, the next agent can pick up where the last one left off.

### Keep one workflow across tools

If you use more than one AI coding tool, Trellis gives you one shared structure for specs, tasks, and process. The platform-specific wiring changes, but the workflow stays recognizable.

## How It Works

Trellis keeps the core workflow in `.trellis/` and generates the platform-specific entry points you need around it.

```text
.trellis/
├── spec/                    # Project standards, patterns, and guides
├── tasks/                   # Task PRDs, context files, and status
├── workspace/               # Journals and single-user continuity
├── workflow.md              # Shared workflow rules
└── scripts/                 # Utilities that power the workflow
```

Depending on the platforms you enable, Trellis also creates tool-specific integration files such as `.claude/`, `.opencode/`, `AGENTS.md`, `.agents/`, and `.codex/`. For Codex, Trellis installs both project skills under `.agents/skills/` and project-scoped config/custom agents under `.codex/`.

At a high level, the workflow is simple:

1. Define standards in specs.
2. Start or refine work from a task PRD.
3. Let Trellis inject the right context for the current task.
4. Use checks, journals, and worktrees to keep quality and continuity intact.

## What's New

- **v0.3.6**: task lifecycle hooks, parent-child subtasks, fix PreToolUse hook for CC v2.1.63+.
- **v0.3.5**: hotfix for delete migration manifest field name.
- **v0.3.4**: record-session task awareness.
- **v0.3.1**: improved `.gitignore` handling, documentation refresh.
- **v0.3.0**: Windows compatibility and `/trellis:brainstorm`.

## FAQ

<details>
<summary><strong>How is this different from <code>CLAUDE.md</code> or <code>AGENTS.md</code>?</strong></summary>

Those files are useful, but they tend to become monolithic. Trellis adds structure around them: layered specs, task context, workspace memory, and workflow wiring for the tools you actually use.

</details>

<details>
<summary><strong>Does Trellis only work with Claude Code?</strong></summary>

No. This repo currently supports Claude Code, OpenCode, and Codex. The detailed setup and entry command for each tool lives in the supported platforms guide.

</details>

<details>
<summary><strong>Do I have to write every spec file manually?</strong></summary>

No. Many teams start by letting AI draft specs from existing code and then tighten the important parts by hand. Trellis works best when you keep the high-signal rules explicit and versioned.

</details>

<details>
<summary><strong>Will this work for a solo repo?</strong></summary>

Yes. Personal workspace journals, task context, and repo-level specs are all designed to work well for a single long-lived workflow.

</details>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=mindfold-ai/Trellis&type=Date)](https://star-history.com/#mindfold-ai/Trellis&Date)

## Community & Resources

- [Official Docs](https://docs.trytrellis.app/) - Product docs, setup guides, and architecture
- [Quick Start](https://docs.trytrellis.app/guide/ch02-quick-start) - Get Trellis running in a repo fast
- [Supported Platforms](https://docs.trytrellis.app/guide/ch13-multi-platform) - Platform-specific setup and command details
- [Real-World Scenarios](https://docs.trytrellis.app/guide/ch08-real-world) - See how the workflow plays out in practice
- [Changelog](https://docs.trytrellis.app/changelog/v0.3.6) - Track current releases and updates
- [Tech Blog](https://docs.trytrellis.app/blog) - Product thinking and technical writeups
- [GitHub Issues](https://github.com/mindfold-ai/Trellis/issues) - Report bugs or request features
- [Discord](https://discord.com/invite/tWcCZ3aRHc) - Join the community

<p align="center">
<a href="https://github.com/mindfold-ai/Trellis">Official Repository</a> •
<a href="https://github.com/mindfold-ai/Trellis/blob/main/LICENSE">AGPL-3.0 License</a> •
Built by <a href="https://github.com/mindfold-ai">Mindfold</a>
</p>
