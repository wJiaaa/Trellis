---
name: task-create
description: "Create a new task shell for a clear bug or requirement. Captures scope, acceptance criteria, and PRD content without starting implementation."
---

# Task Create

Create a new task shell with the minimum information needed to begin work later.

---

## Purpose

Use this skill when the work is clear enough to become a task.

This skill should:

- Create the task directory
- Capture goal, scope, and acceptance criteria
- Seed `prd.md`
- Leave implementation for `$task-start`

If the requirement is still ambiguous, stop and direct the user to `$brainstorm` first.

---

## Steps

1. Confirm the task is clear enough to create.
2. Create the task directory:
   ```bash
   TASK_DIR=$(python3 ./.trellis/scripts/task.py create "<title>" --slug <task-name>)
   ```
3. Write or update `prd.md` inside the task directory with:
   - Goal
   - Requirements
   - Acceptance Criteria
   - Open questions or constraints
4. If relevant, initialize task context files:
   ```bash
   python3 ./.trellis/scripts/task.py init-context "$TASK_DIR" <backend|frontend|fullstack>
   ```
5. Report the created task path back to the user.

---

## Output

Always end by telling the user:

- The task was created
- Which task path/name to use next
- The next command is `$task-start`
