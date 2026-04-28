import { describe, expect, it } from "vitest";
import {
  getAllAgents,
  getAllSkills,
  getConfigTemplate,
} from "../../src/templates/codex/index.js";

const EXPECTED_SKILL_NAMES = [
  "brainstorm",
  "break-loop",
  "check",
  "check-cross-layer",
  "create-command",
  "finish-work",
  "improve-ut",
  "init",
  "record-session",
  "task-create",
  "task-start",
  "update-spec",
];

const EXPECTED_AGENT_NAMES = [
  "check",
  "implement",
  "research",
];

describe("codex getAllSkills", () => {
  it("returns the expected skill set", () => {
    const skills = getAllSkills();
    const names = skills.map((skill) => skill.name);
    expect(names).toEqual(EXPECTED_SKILL_NAMES);
  });

  it("each skill has matching frontmatter name", () => {
    const skills = getAllSkills();
    for (const skill of skills) {
      expect(skill.content.length).toBeGreaterThan(0);
      expect(skill.content).toContain("description:");
      const nameMatch = skill.content.match(/^name:\s*(.+)$/m);
      expect(nameMatch?.[1]?.trim()).toBe(skill.name);
    }
  });

  it("does not include unsupported platform-specific syntax", () => {
    const skills = getAllSkills();
    for (const skill of skills) {
      expect(skill.content).not.toContain("/trellis:");
      expect(skill.content).not.toContain(".claude/");
      expect(skill.content).not.toContain("Task(");
      expect(skill.content).not.toContain("subagent_type");
      expect(skill.content).not.toContain('model: "opus"');
    }
  });

  it("keeps brainstorm as pre-task planning and task-create/task-start as the execution path", () => {
    const skills = Object.fromEntries(
      getAllSkills().map((skill) => [skill.name, skill.content]),
    );

    expect(skills.brainstorm).toContain(
      "Do **not** create a task directory and do **not** write `prd.md` in this skill.",
    );
    expect(skills.brainstorm).toContain(
      "If you still have additions or changes, tell me and we'll continue brainstorming.",
    );
    expect(skills.brainstorm).toContain(
      "If the scope is settled and you want help creating the task, tell me and I'll continue with `$task-create`.",
    );
    expect(skills.brainstorm).not.toContain(
      "If yes, I'll proceed with implementation.",
    );
    expect(skills.brainstorm).toContain(
      "ask one explicit next-step question",
    );
    expect(skills["task-create"]).toContain(
      "The next command is `$task-start`",
    );
    expect(skills["task-create"]).toContain(
      "Set `dev_type` to one of `backend | frontend | fullstack | test | docs`",
    );
    expect(skills["task-start"]).toContain(
      "Do **not** skip this skill by implementing directly after `$brainstorm` or `$task-create`.",
    );
    expect(skills["task-start"]).toContain(
      "will automatically initialize the missing implementation context file from `task.json.dev_type`",
    );
  });
});

describe("codex getAllAgents", () => {
  it("returns the expected custom agent set", () => {
    const agents = getAllAgents();
    const names = agents.map((agent) => agent.name);
    expect(names).toEqual(EXPECTED_AGENT_NAMES);
  });

  it("each agent has required fields (name, description, developer_instructions)", () => {
    for (const agent of getAllAgents()) {
      expect(agent.content.length).toBeGreaterThan(0);
      expect(agent.content).toContain("name = ");
      expect(agent.content).toContain("description = ");
      expect(agent.content).toContain("developer_instructions = ");
    }
  });
});

describe("codex getConfigTemplate", () => {
  it("returns project config.toml content", () => {
    const config = getConfigTemplate();
    expect(config.targetPath).toBe("config.toml");
    expect(config.content).toContain("project_doc_fallback_filenames");
    expect(config.content).toContain("AGENTS.md");
  });
});
