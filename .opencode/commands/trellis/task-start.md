# Task Start

Start a task by activating it and delegating implementation to a dedicated task agent.

---

## Purpose

This command marks the task as current, loads task-specific implementation context, and hands execution to an isolated implementation agent.

Do **not** implement the task directly in the current conversation unless delegation is impossible.

---

## Steps

1. Resolve which task to start:
   - Prefer an explicit task name/path from the user
   - Otherwise use the current task if one is already active
2. Mark it as current:
   ```bash
   python3 ./.trellis/scripts/task.py start <task-name-or-path>
   ```
3. Read task-specific context:
   - `task.json`
   - `prd.md`
   - any configured task context files
4. Read the relevant specs for the task:
   - package/layer indexes
   - checklist-linked spec documents
   - shared guides if needed
5. Launch a dedicated implementation agent/subagent for this task instead of continuing implementation in the main session.

---

## After Implementation

When the task agent finishes implementation, return a concise summary and explicitly recommend exactly one next check command:

- `/trellis:check` for normal tasks
- `/trellis:check-cross-layer` for cross-layer or high-impact tasks

The user must run one of those checks before `/trellis:finish-work`.
