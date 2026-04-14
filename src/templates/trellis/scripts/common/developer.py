#!/usr/bin/env python3
"""
Workspace bootstrap utilities for single-user Trellis projects.

Provides:
    ensure_workspace     - Ensure the shared workspace exists
    show_workspace_info  - Show workspace information
"""

from __future__ import annotations

import sys
from pathlib import Path

from .paths import (
    DIR_TASKS,
    DIR_WORKFLOW,
    FILE_JOURNAL_PREFIX,
    get_developer,
    get_repo_root,
    get_workspace_dir,
)


WORKSPACE_INDEX_TEMPLATE = """# Workspace Index

> Journal tracking for a single-user Trellis workspace.

---

## Current Status

<!-- @@@auto:current-status -->
- **Active File**: `journal-1.md`
- **Total Sessions**: 0
- **Last Active**: -
<!-- @@@/auto:current-status -->

---

## Active Documents

<!-- @@@auto:active-documents -->
| File | Lines | Status |
|------|-------|--------|
| `journal-1.md` | ~0 | Active |
<!-- @@@/auto:active-documents -->

---

## Session History

<!-- @@@auto:session-history -->
| # | Date | Title | Commits | Branch |
|---|------|-------|---------|--------|
<!-- @@@/auto:session-history -->

---

## Notes

- Sessions are appended to `journal-N.md` files in this directory.
- Create `journal-{N+1}.md` when the active file approaches 2000 lines.
- Use `python3 ./.trellis/scripts/add_session.py ...` to record completed work.
"""

INITIAL_JOURNAL_TEMPLATE = """# Journal (Part 1)

> AI development session journal

---
"""


def ensure_workspace(repo_root: Path | None = None) -> Path:
    """Ensure the single-user workspace exists and has base files."""
    if repo_root is None:
        repo_root = get_repo_root()

    workspace_dir = get_workspace_dir(repo_root)
    workspace_dir.mkdir(parents=True, exist_ok=True)

    index_file = workspace_dir / "index.md"
    if not index_file.exists():
        index_file.write_text(WORKSPACE_INDEX_TEMPLATE, encoding="utf-8")

    journal_file = workspace_dir / f"{FILE_JOURNAL_PREFIX}1.md"
    if not journal_file.exists():
        journal_file.write_text(INITIAL_JOURNAL_TEMPLATE, encoding="utf-8")

    return workspace_dir


def show_workspace_info(repo_root: Path | None = None) -> None:
    """Show single-user workspace information."""
    if repo_root is None:
        repo_root = get_repo_root()

    workspace_dir = ensure_workspace(repo_root)
    owner = get_developer(repo_root) or "owner"

    print(f"Task owner: {owner}")
    print(f"Workspace: {workspace_dir.relative_to(repo_root).as_posix()}/")
    print(f"Tasks: {DIR_WORKFLOW}/{DIR_TASKS}/")


if __name__ == "__main__":
    try:
        show_workspace_info()
    except OSError as error:
        print(f"Error: {error}", file=sys.stderr)
        sys.exit(1)
