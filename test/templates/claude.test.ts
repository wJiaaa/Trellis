import { describe, expect, it } from "vitest";
import {
  settingsTemplate,
  getAllCommands,
  getAllAgents,
  getAllHooks,
  getSettingsTemplate,
} from "../../src/templates/claude/index.js";

// =============================================================================
// settingsTemplate — module-level constant
// =============================================================================

describe("settingsTemplate", () => {
  it("is valid JSON", () => {
    expect(() => JSON.parse(settingsTemplate)).not.toThrow();
  });

  it("is a non-empty string", () => {
    expect(settingsTemplate.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// settingsTemplate — Claude hook configuration
// =============================================================================

describe("settingsTemplate hook configuration", () => {
  const settings = JSON.parse(settingsTemplate);
  const preToolUseEntries = settings.hooks.PreToolUse as {
    matcher: string;
    hooks: { type: string; command: string; timeout: number }[];
  }[];
  const subagentStopEntries = settings.hooks.SubagentStop as {
    matcher: string;
    hooks: { type: string; command: string; timeout: number }[];
  }[];

  it("does not include SessionStart or statusLine hooks", () => {
    expect(settings).not.toHaveProperty("statusLine");
    expect(settings.hooks).not.toHaveProperty("SessionStart");
  });

  it("keeps PreToolUse hooks for Task and Agent", () => {
    const matchers = preToolUseEntries.map((e) => e.matcher);
    expect(matchers).toEqual(["Task", "Agent"]);

    for (const entry of preToolUseEntries) {
      expect(entry.hooks).toHaveLength(1);
      expect(entry.hooks[0].command).toContain("inject-subagent-context.py");
    }
  });

  it("uses placeholders for the remaining Claude hooks", () => {
    for (const entry of [...preToolUseEntries, ...subagentStopEntries]) {
      expect(entry.hooks[0].command).toContain("{{PYTHON_CMD}}");
    }
  });

  it("keeps SubagentStop hook for the check agent", () => {
    expect(subagentStopEntries).toHaveLength(1);
    expect(subagentStopEntries[0].matcher).toBe("check");
    expect(subagentStopEntries[0].hooks[0].command).toContain("ralph-loop.py");
  });
});

// =============================================================================
// getAllCommands — reads command templates from filesystem
// =============================================================================

const EXPECTED_COMMAND_NAMES = [
  "brainstorm",
  "break-loop",
  "check-cross-layer",
  "check",
  "create-command",
  "finish-work",
  "init",
  "record-session",
  "task-create",
  "task-start",
  "update-spec",
];

describe("getAllCommands", () => {
  it("returns the expected command set", () => {
    const commands = getAllCommands();
    const names = commands.map((cmd) => cmd.name);
    expect(names).toEqual(EXPECTED_COMMAND_NAMES);
  });

  it("each command has name and content", () => {
    const commands = getAllCommands();
    for (const cmd of commands) {
      expect(cmd.name.length).toBeGreaterThan(0);
      expect(cmd.content.length).toBeGreaterThan(0);
    }
  });

  it("command names do not include .md extension", () => {
    const commands = getAllCommands();
    for (const cmd of commands) {
      expect(cmd.name).not.toContain(".md");
    }
  });
});

// =============================================================================
// getAllAgents — reads agent templates
// =============================================================================

describe("getAllAgents", () => {
  it("each agent has name and content", () => {
    const agents = getAllAgents();
    for (const agent of agents) {
      expect(agent.name.length).toBeGreaterThan(0);
      expect(agent.content.length).toBeGreaterThan(0);
    }
  });
});

// =============================================================================
// getAllHooks — reads hook templates
// =============================================================================

describe("getAllHooks", () => {
  it("each hook has targetPath and content", () => {
    const hooks = getAllHooks();
    for (const hook of hooks) {
      expect(hook.targetPath.startsWith("hooks/")).toBe(true);
      expect(hook.content.length).toBeGreaterThan(0);
    }
  });
});

// =============================================================================
// getSettingsTemplate — returns settings as HookTemplate
// =============================================================================

describe("getSettingsTemplate", () => {
  it("returns correct shape with valid JSON", () => {
    const result = getSettingsTemplate();
    expect(result.targetPath).toBe("settings.json");
    expect(result.content.length).toBeGreaterThan(0);
    expect(() => JSON.parse(result.content)).not.toThrow();
  });
});
