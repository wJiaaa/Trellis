# Script Conventions

> Standards for the Python workflow scripts under `.trellis/scripts/`.

---

## Overview

Trellis keeps workflow automation in Python 3.10+ and stays close to the standard library. These scripts are part of the product surface, so they should be predictable, cross-platform aware, and safe to import.

---

## Current Structure

```
.trellis/scripts/
├── common/              # Shared helpers
├── hooks/               # Optional project-local hook implementations
├── task.py              # Task management CLI
├── get_context.py       # Session context entrypoint
├── add_session.py       # Session journal writer
└── create_bootstrap.py  # Bootstrap task creation
```

---

## Required Patterns

- Entry scripts expose `main() -> int` and terminate with `sys.exit(main())`.
- Shared logic lives in `common/`, not by importing one entry script into another.
- Paths use `pathlib.Path` helpers from shared modules instead of inline string concatenation.
- File reads and writes specify `encoding="utf-8"`.
- Repeated JSON/text operations go through shared helpers where they already exist.

---

## Cross-Platform Rules

- User-facing examples should show `python3 ./.trellis/scripts/...`.
- Avoid shell-only behavior when the Python standard library can do the same job.
- Treat redirected stdin/stdout as encoding-sensitive and keep the UTF-8 handling explicit.

---

## Review Checklist

- [ ] Shared logic was added to `common/` when reused
- [ ] Paths use existing path helpers
- [ ] File I/O is explicit about encoding
- [ ] New entrypoints document their usage
- [ ] The script remains safe to import in tests or helper modules
