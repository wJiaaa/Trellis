import { describe, expect, it } from "vitest";
import fs from "node:fs";
import {
  getTrellisTemplatePath,
  getClaudeTemplatePath,
  getOpenCodeTemplatePath,
  getCodexTemplatePath,
  getTrellisSourcePath,
  getClaudeSourcePath,
  getOpenCodeSourcePath,
  getCodexSourcePath,
  readTrellisFile,
  readTemplate,
  readScript,
  readMarkdown,
  readClaudeFile,
  readOpenCodeFile,
} from "../../src/templates/extract.js";

describe("template path functions", () => {
  it("returns existing trellis, claude, opencode, and codex directories", () => {
    for (const p of [
      getTrellisTemplatePath(),
      getClaudeTemplatePath(),
      getOpenCodeTemplatePath(),
      getCodexTemplatePath(),
    ]) {
      expect(fs.existsSync(p)).toBe(true);
      expect(fs.statSync(p).isDirectory()).toBe(true);
    }
  });
});

describe("deprecated source path aliases", () => {
  it("match their template path equivalents", () => {
    expect(getTrellisSourcePath()).toBe(getTrellisTemplatePath());
    expect(getClaudeSourcePath()).toBe(getClaudeTemplatePath());
    expect(getOpenCodeSourcePath()).toBe(getOpenCodeTemplatePath());
    expect(getCodexSourcePath()).toBe(getCodexTemplatePath());
  });
});

describe("trellis readers", () => {
  it("reads workflow and script templates", () => {
    expect(readMarkdown("workflow.md")).toContain("#");
    expect(readScript("task.py").length).toBeGreaterThan(0);
    expect(readTrellisFile("scripts/task.py").length).toBeGreaterThan(0);
  });

  it("throws for nonexistent files", () => {
    expect(() => readTrellisFile("nonexistent.txt")).toThrow();
    expect(() => readTemplate("scripts", "nonexistent.txt")).toThrow();
  });
});

describe("platform readers", () => {
  it("reads claude settings", () => {
    const content = readClaudeFile("settings.json");
    expect(() => JSON.parse(content)).not.toThrow();
  });

  it("reads an opencode file", () => {
    const content = readOpenCodeFile("package.json");
    expect(content.length).toBeGreaterThan(0);
  });
});
