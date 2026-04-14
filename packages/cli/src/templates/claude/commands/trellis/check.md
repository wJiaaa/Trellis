Launch a dedicated check pass for the current task. Use this after implementation finishes for normal tasks.

Execute these steps:

1. **Ensure a current task exists**:
   ```bash
   python3 ./.trellis/scripts/get_context.py
   ```
   If no current task is active, stop and tell the user to run `/trellis:task-start` first.

2. **Launch the check subagent explicitly**:
   ```
   Task(
     subagent_type: "check",
     prompt: "Run the normal Trellis check workflow for the current task: inspect git diff, review the injected quality specs, fix issues directly, run lint and typecheck, and report the final verification results.",
     model: "opus",
     run_in_background: true
   )
   ```

3. **Do not run the check inline in the main session** unless delegation is impossible.

## Hook Behavior

Because this command uses `Task(subagent_type: "check", ...)`, Claude's hooks will:

- inject `check.jsonl` or fallback check context before the subagent runs
- enforce the `check` subagent stop gate through `SubagentStop`
- require the subagent to complete verification before it can finish

This command satisfies the required check gate before `/trellis:finish-work`.
