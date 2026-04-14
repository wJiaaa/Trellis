import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { contextCollector } from "../../src/templates/opencode/lib/trellis-context.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestContextCollector {
  processed: Set<string>;
  markProcessed(directory: string, sessionID: string): void;
  isProcessed(directory: string, sessionID: string): boolean;
  clear(directory: string, sessionID: string): void;
}

describe("opencode session context dedupe", () => {
  let collector: TestContextCollector;

  beforeEach((): void => {
    collector = contextCollector as TestContextCollector;
  });

  afterEach((): void => {
    collector.clear("session-a");
    collector.clear("session-b");
    collector.processed.clear();
  });

  it("tracks processed sessions in memory for the active process", () => {
    expect(collector.isProcessed("session-a")).toBe(false);

    collector.markProcessed("session-a");
    expect(collector.isProcessed("session-a")).toBe(true);

    collector.clear("session-a");

    expect(collector.isProcessed("session-a")).toBe(false);
  });

  it("does not treat a different session id as already processed", () => {
    collector.markProcessed("session-a");

    expect(collector.isProcessed("session-b")).toBe(false);
  });
});

describe("opencode task workflow prompts", () => {
  it("keeps brainstorm as pre-task planning and task-create/task-start as the execution path", () => {
    const brainstorm = fs.readFileSync(
      path.join(
        __dirname,
        "../../src/templates/opencode/commands/trellis/brainstorm.md",
      ),
      "utf-8",
    );
    const taskCreate = fs.readFileSync(
      path.join(
        __dirname,
        "../../src/templates/opencode/commands/trellis/task-create.md",
      ),
      "utf-8",
    );
    const taskStart = fs.readFileSync(
      path.join(
        __dirname,
        "../../src/templates/opencode/commands/trellis/task-start.md",
      ),
      "utf-8",
    );

    expect(brainstorm).toContain("the next step is `/trellis:task-create`");
    expect(brainstorm).toContain(
      "Do **not** create a task directory and do **not** write `prd.md` in this command.",
    );
    expect(brainstorm).not.toContain(
      "If yes, I'll proceed with implementation.",
    );
    expect(taskCreate).toContain("The next command is `/trellis:task-start`");
    expect(taskStart).toContain(
      "Do **not** skip this command by implementing directly after `/trellis:brainstorm` or `/trellis:task-create`.",
    );
  });
});
