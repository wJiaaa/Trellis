import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

vi.mock("figlet", () => ({
  default: { textSync: vi.fn(() => "TRELLIS") },
}));

vi.mock("inquirer", () => ({
  default: { prompt: vi.fn().mockResolvedValue({}) },
}));
import { init } from "../../src/commands/init.js";
import { DIR_NAMES, PATHS } from "../../src/constants/paths.js";

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

describe("init() integration", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "trellis-init-int-"));
    vi.spyOn(process, "cwd").mockReturnValue(tmpDir);
    vi.spyOn(console, "log").mockImplementation(noop);
    vi.spyOn(console, "error").mockImplementation(noop);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("creates the core workflow structure with default Claude setup", async () => {
    await init({ yes: true });

    expect(fs.existsSync(path.join(tmpDir, DIR_NAMES.WORKFLOW))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, PATHS.SCRIPTS))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, PATHS.WORKSPACE))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, PATHS.WORKSPACE, "index.md"))).toBe(
      true,
    );
    expect(
      fs.existsSync(path.join(tmpDir, PATHS.WORKSPACE, "journal-1.md")),
    ).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, PATHS.TASKS))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, PATHS.SPEC))).toBe(true);

    expect(fs.existsSync(path.join(tmpDir, ".claude"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".opencode"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, ".codex"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, ".agents", "skills"))).toBe(false);

    const bootstrapTask = JSON.parse(
      fs.readFileSync(
        path.join(tmpDir, PATHS.TASKS, "00-bootstrap-guidelines", "task.json"),
        "utf-8",
      ),
    );
    expect(bootstrapTask).not.toHaveProperty("creator");
    expect(bootstrapTask).not.toHaveProperty("assignee");
  });

  it("configures all explicitly selected supported platforms", async () => {
    await init({ yes: true, claude: true, opencode: true, codex: true });

    expect(fs.existsSync(path.join(tmpDir, ".claude"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".opencode"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".codex"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".agents", "skills"))).toBe(true);
    expect(
      fs.existsSync(path.join(tmpDir, ".agents", "skills", "init", "SKILL.md")),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(tmpDir, ".codex", "agents", "check.toml")),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(tmpDir, ".codex", "hooks", "session-start.py")),
    ).toBe(true);

  });

  it("does not generate onboarding artifacts for Codex skills", async () => {
    await init({ yes: true, codex: true });

    expect(
      fs.existsSync(path.join(tmpDir, ".agents", "skills", "onboard", "SKILL.md")),
    ).toBe(false);
    expect(
      fs.existsSync(path.join(tmpDir, ".codex", "skills", "parallel", "SKILL.md")),
    ).toBe(true);
  });

  it("creates backend, frontend, and guides spec templates for unknown projects", async () => {
    await init({ yes: true, claude: true });

    expect(
      fs.existsSync(path.join(tmpDir, ".trellis", "spec", "backend", "index.md")),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(tmpDir, ".trellis", "spec", "frontend", "index.md")),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(tmpDir, ".trellis", "spec", "guides", "index.md")),
    ).toBe(true);
  });
});
