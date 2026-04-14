# Task Start

Start a task by activating it and delegating implementation to a dedicated task agent.

---

## Purpose

This command marks the task as current and hands execution to an isolated implementation agent via `Task(...)`.

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
3. Launch the implementation subagent explicitly:
   ```
   Task(
     subagent_type: "implement",
     prompt: "Implement the current task using the task context, specs, and requirements injected by the hook. Make the code changes directly and report the modified files when done.",
     model: "opus",
     run_in_background: true
   )
   ```
4. Do not continue implementation in the main session after the `Task(...)` call unless delegation is impossible.

## Hook Behavior

Because this command uses `Task(subagent_type: "implement", ...)`, Claude's `PreToolUse` hook will inject:

- `implement.jsonl` or fallback context files
- `prd.md`
- `info.md`
- current task phase metadata

---

## After Implementation

When the task agent finishes implementation, return a concise summary and explicitly recommend exactly one next check command:

- `/trellis:check` for normal tasks
- `/trellis:check-cross-layer` for cross-layer or high-impact tasks

The user must run one of those checks before `/trellis:finish-work`.
