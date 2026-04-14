---
name: task-create
description: "Create or update a task shell for a clear bug or requirement. Captures scope, acceptance criteria, and PRD content without starting implementation."
---

# Task Create

Create or update a task shell with the minimum information needed to begin work later.

---

## Purpose

Use this skill when the work is clear enough to become a task.
This skill is responsible for creating or updating task files after requirements are settled.

This skill should:

- Create or update the task directory
- Capture goal, scope, and acceptance criteria
- Write or update `prd.md`
- Leave implementation for `$task-start`

If the requirement is still ambiguous, stop and direct the user to `$brainstorm` first.

---

## Steps

1. Confirm the task is clear enough to create or update.
2. Resolve whether to create a new task or update an existing one:
   - Prefer an explicit task path/name from the user if they already have one
   - Otherwise create a new task directory from the confirmed brainstorm summary
3. Create the task directory when needed:
   ```bash
   TASK_DIR=$(python3 ./.trellis/scripts/task.py create "<title>" --slug <task-name>)
   ```
4. Write or update `prd.md` inside the task directory with:
   - Goal
   - Requirements
   - Acceptance Criteria
   - Open questions or constraints
5. If relevant, initialize task context files:
   ```bash
   python3 ./.trellis/scripts/task.py init-context "$TASK_DIR" <backend|frontend|fullstack>
   ```
6. Report the task path back to the user.

---

## Output

Always end by telling the user:

- The task was created or updated
- Which task path/name to use next
- The next command is `$task-start`
