"""
CLI Adapter for supported AI coding CLIs.

This adapter only supports the active Trellis platforms:
- claude: Claude Code
- opencode: OpenCode
- codex: Codex CLI
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import ClassVar, Literal

Platform = Literal["claude", "opencode", "codex"]


@dataclass
class CLIAdapter:
    """Adapter for supported AI coding CLI tools."""

    platform: Platform

    _AGENT_NAME_MAP: ClassVar[dict[Platform, dict[str, str]]] = {
        "claude": {},
        "opencode": {
            "plan": "trellis-plan",
        },
        "codex": {},
    }

    def get_agent_name(self, agent: str) -> str:
        mapping = self._AGENT_NAME_MAP.get(self.platform, {})
        return mapping.get(agent, agent)

    @property
    def config_dir_name(self) -> str:
        if self.platform == "opencode":
            return ".opencode"
        if self.platform == "codex":
            return ".codex"
        return ".claude"

    def get_config_dir(self, project_root: Path) -> Path:
        return project_root / self.config_dir_name

    def get_agent_path(self, agent: str, project_root: Path) -> Path:
        mapped_name = self.get_agent_name(agent)
        if self.platform == "codex":
            return self.get_config_dir(project_root) / "agents" / f"{mapped_name}.toml"
        return self.get_config_dir(project_root) / "agents" / f"{mapped_name}.md"

    def get_commands_path(self, project_root: Path, *parts: str) -> Path:
        if not parts:
            return self.get_config_dir(project_root) / "commands"
        return self.get_config_dir(project_root) / "commands" / Path(*parts)

    def get_trellis_command_path(self, name: str) -> str:
        if self.platform == "codex":
            return f".agents/skills/{name}/SKILL.md"
        return f"{self.config_dir_name}/commands/trellis/{name}.md"

    def get_non_interactive_env(self) -> dict[str, str]:
        if self.platform == "opencode":
            return {"OPENCODE_NON_INTERACTIVE": "1"}
        if self.platform == "codex":
            return {"CODEX_NON_INTERACTIVE": "1"}
        return {"CLAUDE_NON_INTERACTIVE": "1"}

    def build_run_command(
        self,
        agent: str,
        prompt: str,
        session_id: str | None = None,
        skip_permissions: bool = True,
        verbose: bool = True,
        json_output: bool = True,
    ) -> list[str]:
        mapped_agent = self.get_agent_name(agent)

        if self.platform == "opencode":
            cmd = ["opencode", "run", "--agent", mapped_agent]
            if json_output:
                cmd.extend(["--format", "json"])
            if verbose:
                cmd.extend(["--log-level", "DEBUG", "--print-logs"])
            cmd.append(prompt)
            return cmd

        if self.platform == "codex":
            return ["codex", "exec", prompt]

        cmd = ["claude", "-p", "--agent", mapped_agent]
        if session_id:
            cmd.extend(["--session-id", session_id])
        if skip_permissions:
            cmd.append("--dangerously-skip-permissions")
        if json_output:
            cmd.extend(["--output-format", "stream-json"])
        if verbose:
            cmd.append("--verbose")
        cmd.append(prompt)
        return cmd

    def build_resume_command(self, session_id: str) -> list[str]:
        if self.platform == "opencode":
            return ["opencode", "run", "--session", session_id]
        if self.platform == "codex":
            return ["codex", "resume", session_id]
        return ["claude", "--resume", session_id]

    def get_resume_command_str(self, session_id: str, cwd: str | None = None) -> str:
        cmd_str = " ".join(self.build_resume_command(session_id))
        if cwd:
            return f"cd {cwd} && {cmd_str}"
        return cmd_str

    @property
    def is_opencode(self) -> bool:
        return self.platform == "opencode"

    @property
    def is_claude(self) -> bool:
        return self.platform == "claude"

    @property
    def cli_name(self) -> str:
        if self.platform == "opencode":
            return "opencode"
        if self.platform == "codex":
            return "codex"
        return "claude"

    @property
    def supports_cli_agents(self) -> bool:
        return True

    @property
    def requires_agent_definition_file(self) -> bool:
        return self.platform in ("claude", "opencode")

    @property
    def supports_session_id_on_create(self) -> bool:
        return self.platform == "claude"

    def extract_session_id_from_log(self, log_content: str) -> str | None:
        import re

        match = re.search(r"ses_[a-zA-Z0-9]+", log_content)
        if match:
            return match.group(0)
        return None


def get_cli_adapter(platform: str = "claude") -> CLIAdapter:
    if platform not in ("claude", "opencode", "codex"):
        raise ValueError(
            "Unsupported platform: "
            f"{platform} (must be 'claude', 'opencode', or 'codex')"
        )
    return CLIAdapter(platform=platform)  # type: ignore[arg-type]


_ALL_PLATFORM_CONFIG_DIRS = (".claude", ".opencode", ".agents", ".codex")


def _has_other_platform_dir(project_root: Path, exclude: set[str]) -> bool:
    return any(
        (project_root / d).is_dir()
        for d in _ALL_PLATFORM_CONFIG_DIRS
        if d not in exclude
    )


def detect_platform(project_root: Path) -> Platform:
    import os

    env_platform = os.environ.get("TRELLIS_PLATFORM", "").lower()
    if env_platform in ("claude", "opencode", "codex"):
        return env_platform  # type: ignore[return-value]

    if (project_root / ".opencode").is_dir():
        return "opencode"

    if (project_root / ".codex").is_dir() and not _has_other_platform_dir(
        project_root, {".codex", ".agents"}
    ):
        return "codex"

    return "claude"


def get_cli_adapter_auto(project_root: Path) -> CLIAdapter:
    return CLIAdapter(platform=detect_platform(project_root))
