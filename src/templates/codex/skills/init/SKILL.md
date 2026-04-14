---
name: init
description: "Initialize the current AI session with repository-level context. Reads workflow, git state, current task, and active tasks, then recommends the next command without starting implementation."
---

# Session Init

Initialize the current AI session with repository-level context before any task work begins.

---

## Purpose

Use this skill to:

- Understand the current repository state
- See whether a task is already active
- Decide the correct next step without loading implementation-specific code context

This skill does **not** start a task. Task implementation belongs to `$task-start`.

---

## Steps

1. Read the workflow guide:
   ```bash
   cat .trellis/workflow.md
   ```
2. Load current session context:
   ```bash
   python3 ./.trellis/scripts/get_context.py
   ```
3. Discover available package/spec layers:
   ```bash
   python3 ./.trellis/scripts/get_context.py --mode packages
   ```
4. Read shared guides index:
   ```bash
   cat .trellis/spec/guides/index.md
   ```

---

## Decision Rules

After reading the context, decide which of these applies:

- If there is an active current task and the user wants to continue it:
  Tell the user to run `$task-start`.
- If the user has a clear new bug or requirement:
  Tell the user to run `$task-create`.
- If the user has a vague bug, unclear requirement, or multiple possible approaches:
  Tell the user to run `$brainstorm`.
- If the user is only asking a question:
  Answer directly without forcing task creation.

---

## Output

Summarize:

1. Current task status
2. Active tasks summary
3. Recommended next command:
   - `$task-start`
   - `$task-create`
   - `$brainstorm`
   - or direct answer
