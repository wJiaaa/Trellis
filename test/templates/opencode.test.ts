import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { contextCollector } from "../../src/templates/opencode/lib/trellis-context.js";

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
