# Cross-Platform Thinking Guide

> **Purpose**: Catch platform-specific assumptions before they become bugs.

---

## Why This Matters

Trellis ships CLI code, generated templates, and Python workflow scripts. That combination makes path handling, shell behavior, and encoding bugs especially easy to miss if you only test on one machine.

---

## What To Check

### Script Invocation

- User-facing docs should prefer explicit interpreter commands over relying on shebang execution.
- Node-to-Python and Python-to-Python calls should avoid assumptions about platform-specific command names.

### Paths

- Use `pathlib.Path` in Python and `path.join`/`path.resolve` in Node.
- Avoid hardcoded separators and assumptions about the current working directory.

### Shell Dependencies

- Prefer library code over `grep`, `cat`, `tail`, or other shell-specific utilities when feasible.
- If a shell command is required, make the failure mode obvious and actionable.

### Encoding

- File I/O should specify UTF-8 explicitly.
- Subprocess text output should be decoded explicitly.
- Stdin/stdout handling should assume non-ASCII content is possible.

---

## Trellis-Specific Hotspots

- Template placeholder replacement for Python commands on Windows vs macOS/Linux
- Python workflow scripts that read redirected input or print user content
- Build and copy steps that must behave the same in `src/` and `dist/`

---

## Before Commit

- [ ] Checked shell-specific assumptions
- [ ] Checked path and working-directory assumptions
- [ ] Checked encoding assumptions
- [ ] Checked generated instructions shown to users
