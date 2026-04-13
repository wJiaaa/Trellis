import { describe, expect, it } from "vitest";
import {
  ALL_MANAGED_DIRS,
  CONFIG_DIRS,
  PLATFORM_IDS,
  collectPlatformTemplates,
  getInitToolChoices,
  getPlatformsWithPythonHooks,
  isManagedPath,
  isManagedRootDir,
  resolveCliFlag,
} from "../../src/configurators/index.js";
import { AI_TOOLS } from "../../src/types/ai-tools.js";

describe("platform registry", () => {
  it("only exposes the supported platform ids", () => {
    expect(PLATFORM_IDS).toEqual(["claude-code", "opencode", "codex"]);
  });

  it("maps config dirs from AI_TOOLS in order", () => {
    expect(CONFIG_DIRS).toEqual([
      AI_TOOLS["claude-code"].configDir,
      AI_TOOLS.opencode.configDir,
      AI_TOOLS.codex.configDir,
    ]);
  });

  it("keeps .trellis and supported managed dirs only", () => {
    expect(ALL_MANAGED_DIRS).toEqual([
      ".trellis",
      ".claude",
      ".opencode",
      ".codex",
      ".agents/skills",
    ]);
  });
});

describe("managed path helpers", () => {
  it("matches supported platform paths", () => {
    expect(isManagedPath(".claude/commands/trellis/start.md")).toBe(true);
    expect(isManagedPath(".opencode/plugins/session-start.js")).toBe(true);
    expect(isManagedPath(".codex/hooks/session-start.py")).toBe(true);
    expect(isManagedPath(".agents/skills/start/SKILL.md")).toBe(true);
  });

  it("matches supported platform paths with Windows separators", () => {
    expect(isManagedPath(".claude\\commands\\trellis\\start.md")).toBe(true);
    expect(isManagedPath(".codex\\hooks\\session-start.py")).toBe(true);
    expect(isManagedPath(".agents\\skills\\start\\SKILL.md")).toBe(true);
  });

  it("rejects removed platforms", () => {
    expect(isManagedPath(".legacy-platform/commands/start.md")).toBe(false);
    expect(isManagedRootDir(".removed-platform")).toBe(false);
  });
});

describe("flag and choice helpers", () => {
  it("resolves only supported flags", () => {
    expect(resolveCliFlag("claude")).toBe("claude-code");
    expect(resolveCliFlag("opencode")).toBe("opencode");
    expect(resolveCliFlag("codex")).toBe("codex");
    expect(resolveCliFlag("legacy")).toBeUndefined();
  });

  it("returns init choices for the supported platforms", () => {
    expect(getInitToolChoices()).toEqual([
      {
        key: "claude",
        name: "Claude Code",
        defaultChecked: true,
        platformId: "claude-code",
      },
      {
        key: "opencode",
        name: "OpenCode",
        defaultChecked: false,
        platformId: "opencode",
      },
      {
        key: "codex",
        name: "Codex",
        defaultChecked: false,
        platformId: "codex",
      },
    ]);
  });

  it("reports only supported python-hook platforms", () => {
    expect(getPlatformsWithPythonHooks()).toEqual(["claude-code", "codex"]);
  });
});

describe("template collection", () => {
  it("returns undefined for opencode template tracking", () => {
    expect(collectPlatformTemplates("opencode")).toBeUndefined();
  });

  it("collects Claude templates under .claude", () => {
    const templates = collectPlatformTemplates("claude-code");
    const keys = [...(templates?.keys() ?? [])];

    expect(templates).toBeInstanceOf(Map);
    expect(templates?.size).toBeGreaterThan(0);
    expect(keys.every((key) => key.startsWith(".claude/"))).toBe(true);
  });

  it("collects Codex shared and project-scoped templates", () => {
    const templates = collectPlatformTemplates("codex");
    const keys = [...(templates?.keys() ?? [])];

    expect(templates).toBeInstanceOf(Map);
    expect(keys).toContain(".codex/hooks.json");
    expect(keys.some((key) => key.startsWith(".codex/"))).toBe(true);
    expect(keys.some((key) => key.startsWith(".agents/skills/"))).toBe(true);
  });
});
