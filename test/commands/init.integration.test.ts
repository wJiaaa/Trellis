import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

vi.mock("figlet", () => ({
  default: { textSync: vi.fn(() => "TRELLIS") },
}));

vi.mock("inquirer", () => ({
  default: { prompt: vi.fn().mockResolvedValue({}) },
}));
import inquirer from "inquirer";
import { init } from "../../src/commands/init.js";
import { update } from "../../src/commands/update.js";
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
    expect(
      fs.existsSync(path.join(tmpDir, ".claude", "hooks", "session-start.py")),
    ).toBe(false);
    expect(
      fs.existsSync(path.join(tmpDir, ".claude", "hooks", "statusline.py")),
    ).toBe(false);
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

  it("configures all interactively selected supported platforms", async () => {
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({
      tools: ["claude", "opencode", "codex"],
    });

    await init({});

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
    ).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, ".codex", "hooks.json"))).toBe(true);
    expect(
      fs.existsSync(
        path.join(tmpDir, ".opencode", "commands", "trellis", "parallel.md"),
      ),
    ).toBe(false);
    expect(
      fs.existsSync(
        path.join(
          tmpDir,
          ".opencode",
          "commands",
          "trellis",
          "migrate-specs.md",
        ),
      ),
    ).toBe(false);

  });

  it("does not generate onboarding artifacts for Codex skills", async () => {
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({
      tools: ["codex"],
    });

    await init({});

    expect(
      fs.existsSync(path.join(tmpDir, ".agents", "skills", "onboard", "SKILL.md")),
    ).toBe(false);
    expect(
      fs.existsSync(path.join(tmpDir, ".codex", "skills", "parallel", "SKILL.md")),
    ).toBe(false);
  });

  it("keeps existing initialization unchanged on repeated init", async () => {
    await init({ yes: true });
    await init({ yes: true });

    expect(fs.existsSync(path.join(tmpDir, ".claude"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".codex"))).toBe(false);
  });

  it("creates backend, frontend, and guides spec templates for unknown projects", async () => {
    await init({ yes: true });

    expect(
      fs.existsSync(path.join(tmpDir, ".trellis", "spec", "backend", "index.md")),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(
          tmpDir,
          ".trellis",
          "spec",
          "backend",
          "script-conventions.md",
        ),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(tmpDir, ".trellis", "spec", "frontend", "index.md")),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(tmpDir, ".trellis", "spec", "guides", "index.md")),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(
          tmpDir,
          ".trellis",
          "spec",
          "guides",
          "cross-platform-thinking-guide.md",
        ),
      ),
    ).toBe(true);
  });

  it("tells the user to use update when Trellis is already initialized", async () => {
    await init({ yes: true });
    const logSpy = vi.spyOn(console, "log");

    await init({ yes: true });

    expect(
      logSpy.mock.calls.some((call) =>
        call.some(
          (value) =>
            typeof value === "string" &&
            value.includes("Use `trellis update`"),
        ),
      ),
    ).toBe(true);
  });

  it("update preserves spec/tasks/workspace and refreshes templates", async () => {
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({
      tools: ["claude", "opencode", "codex"],
    });
    await init({});

    const specFile = path.join(tmpDir, ".trellis", "spec", "custom.md");
    const workspaceFile = path.join(tmpDir, ".trellis", "workspace", "custom.md");
    const taskDir = path.join(tmpDir, ".trellis", "tasks", "custom-task");
    const configPath = path.join(tmpDir, ".trellis", "config.yaml");
    const staleScript = path.join(tmpDir, ".trellis", "scripts", "obsolete.py");
    const staleClaude = path.join(
      tmpDir,
      ".claude",
      "commands",
      "trellis",
      "stale.md",
    );

    fs.writeFileSync(specFile, "custom spec", "utf-8");
    fs.writeFileSync(workspaceFile, "workspace note", "utf-8");
    fs.mkdirSync(taskDir, { recursive: true });
    fs.writeFileSync(path.join(taskDir, "task.json"), "{}", "utf-8");
    fs.appendFileSync(configPath, "\n# keep-me\n", "utf-8");
    fs.writeFileSync(staleScript, "print('stale')", "utf-8");
    fs.mkdirSync(path.dirname(staleClaude), { recursive: true });
    fs.writeFileSync(staleClaude, "stale", "utf-8");

    vi.mocked(inquirer.prompt).mockResolvedValueOnce({
      tools: ["claude", "codex"],
    });

    await update({});

    expect(fs.existsSync(specFile)).toBe(true);
    expect(fs.existsSync(workspaceFile)).toBe(true);
    expect(fs.existsSync(path.join(taskDir, "task.json"))).toBe(true);
    expect(fs.readFileSync(configPath, "utf-8")).toContain("# keep-me");

    expect(fs.existsSync(staleScript)).toBe(false);
    expect(fs.existsSync(staleClaude)).toBe(false);

    expect(fs.existsSync(path.join(tmpDir, ".claude"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".codex"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".opencode"))).toBe(false);
    expect(
      fs.existsSync(path.join(tmpDir, ".trellis", "scripts", "task.py")),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(tmpDir, ".trellis", "workflow.md")),
    ).toBe(true);
  });

  it("task.py start auto-initializes only implement context from task.json dev_type", async () => {
    await init({ yes: true });

    const taskRel = execFileSync(
      "python3",
      ["./.trellis/scripts/task.py", "create", "Auto init context", "--slug", "auto-init-context"],
      { cwd: tmpDir, encoding: "utf-8" },
    ).trim();
    const taskDir = path.join(tmpDir, taskRel);
    const taskJsonPath = path.join(taskDir, "task.json");
    const taskJson = JSON.parse(fs.readFileSync(taskJsonPath, "utf-8"));
    taskJson.dev_type = "backend";
    fs.writeFileSync(taskJsonPath, JSON.stringify(taskJson, null, 2), "utf-8");

    execFileSync(
      "python3",
      ["./.trellis/scripts/task.py", "start", taskRel],
      { cwd: tmpDir, encoding: "utf-8" },
    );

    expect(fs.existsSync(path.join(taskDir, "implement.jsonl"))).toBe(true);
    expect(fs.existsSync(path.join(taskDir, "check.jsonl"))).toBe(false);
    expect(fs.existsSync(path.join(taskDir, "debug.jsonl"))).toBe(false);
    expect(
      fs.readFileSync(path.join(taskDir, "implement.jsonl"), "utf-8"),
    ).toContain(".trellis/spec/backend/index.md");
    expect(
      fs.readFileSync(path.join(tmpDir, ".trellis", ".current-task"), "utf-8").trim(),
    ).toBe(taskRel);
  });
});
