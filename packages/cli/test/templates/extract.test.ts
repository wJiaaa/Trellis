import { describe, expect, it } from "vitest";
import fs from "node:fs";
import {
  getTrellisTemplatePath,
  getClaudeTemplatePath,
  getOpenCodeTemplatePath,
  getCodexTemplatePath,
  readTrellisFile,
  readTemplate,
  readScript,
  readMarkdown,
  readClaudeFile,
  readOpenCodeFile,
} from "../../src/templates/extract.js";

describe("template path functions", () => {
  it("returns existing trellis, claude, opencode, and codex directories", () => {
    for (const dir of [
      getTrellisTemplatePath(),
      getClaudeTemplatePath(),
      getOpenCodeTemplatePath(),
      getCodexTemplatePath(),
    ]) {
      expect(fs.existsSync(dir)).toBe(true);
      expect(fs.statSync(dir).isDirectory()).toBe(true);
    }
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
