import chalk from "chalk";
import { Command } from "commander";
import { init } from "../commands/init.js";
import { VERSION, PACKAGE_NAME } from "../constants/version.js";

// Re-export for backwards compatibility (consumers should prefer constants/version.js)
export { VERSION, PACKAGE_NAME };

const program = new Command();

program
  .name("trellis")
  .description(
    "AI-assisted development workflow framework for Claude Code, OpenCode, and Codex",
  )
  .version(VERSION, "-v, --version", "output the version number");

program
  .command("init")
  .description("Initialize trellis in the current project")
  .option("--claude", "Include Claude Code commands")
  .option("--opencode", "Include OpenCode commands")
  .option("--codex", "Include Codex skills")
  .option("-y, --yes", "Skip prompts and use defaults")
  .option(
    "-u, --user <name>",
    "Initialize developer identity with specified name",
  )
  .option("-f, --force", "Overwrite existing files without asking")
  .option("-s, --skip-existing", "Skip existing files without asking")
  .option("--monorepo", "Force monorepo mode")
  .option("--no-monorepo", "Skip monorepo detection")
  .action(async (options: Record<string, unknown>) => {
    try {
      await init(options);
    } catch (error) {
      console.error(
        chalk.red("Error:"),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  });

program.parse();
