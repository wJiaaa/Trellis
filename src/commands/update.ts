import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import { refreshWorkflowTemplates } from "../configurators/workflow.js";
import {
  PLATFORM_MANAGED_DIRS,
  configurePlatform,
  getConfiguredPlatforms,
  getInitToolChoices,
  getPlatformsWithPythonHooks,
  resolveCliFlag,
} from "../configurators/index.js";
import { AI_TOOLS } from "../types/ai-tools.js";
import { DIR_NAMES } from "../constants/paths.js";
import { agentsMdContent } from "../templates/markdown/index.js";
import { setWriteMode, writeFile } from "../utils/file-writer.js";

interface UpdateOptions {
  yes?: boolean;
}

const ROOT_PLATFORM_FILES = ["AGENTS.md"];
const WORKFLOW_TEMPLATE_PATHS = [
  `${DIR_NAMES.WORKFLOW}/scripts`,
  `${DIR_NAMES.WORKFLOW}/workflow.md`,
  `${DIR_NAMES.WORKFLOW}/.gitignore`,
  `${DIR_NAMES.WORKFLOW}/worktree.yaml`,
];

function resetUpdateTargets(cwd: string): void {
  const targetPaths = [
    ...PLATFORM_MANAGED_DIRS,
    ...ROOT_PLATFORM_FILES,
    ...WORKFLOW_TEMPLATE_PATHS,
  ]
    .map((relativePath) => path.join(cwd, relativePath))
    .sort((left, right) => right.length - left.length);

  for (const targetPath of targetPaths) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }

  const agentsRoot = path.join(cwd, ".agents");
  if (fs.existsSync(agentsRoot) && fs.readdirSync(agentsRoot).length === 0) {
    fs.rmSync(agentsRoot, { recursive: true, force: true });
  }
}

async function createRootFiles(cwd: string): Promise<void> {
  const agentsPath = path.join(cwd, "AGENTS.md");
  const agentsWritten = await writeFile(agentsPath, agentsMdContent);
  if (agentsWritten) {
    console.log(chalk.blue("📄 Created AGENTS.md"));
  }
}

export async function update(options: UpdateOptions): Promise<void> {
  const cwd = process.cwd();

  if (!fs.existsSync(path.join(cwd, DIR_NAMES.WORKFLOW))) {
    console.log(chalk.red("Error: Trellis is not initialized in this project."));
    console.log(chalk.gray("Run `trellis init` first."));
    return;
  }

  const banner = figlet.textSync("Trellis", { font: "Rebel" });
  console.log(chalk.cyan(`\n${banner.trimEnd()}`));
  console.log(
    chalk.gray(
      "\n   Refreshing platform integration and workflow templates\n",
    ),
  );

  setWriteMode("force");

  const TOOLS = getInitToolChoices();
  const configuredPlatforms = getConfiguredPlatforms(cwd);

  let tools: string[];

  if (options.yes) {
    tools =
      configuredPlatforms.size > 0
        ? [...configuredPlatforms].map((id) => AI_TOOLS[id].cliFlag)
        : TOOLS.filter((t) => t.defaultChecked).map((t) => t.key);
  } else {
    const answers = await inquirer.prompt<{ tools: string[] }>([
      {
        type: "checkbox",
        name: "tools",
        message: "Select AI tools to keep configured after update:",
        choices: TOOLS.map((t) => ({
          name: t.name,
          value: t.key,
          checked: configuredPlatforms.size
            ? configuredPlatforms.has(t.platformId)
            : t.defaultChecked,
        })),
      },
    ]);
    tools = answers.tools;
  }

  if (tools.length === 0) {
    console.log(
      chalk.yellow("No tools selected. At least one tool is required."),
    );
    return;
  }

  resetUpdateTargets(cwd);

  console.log(chalk.blue("📁 Refreshing workflow templates..."));
  await refreshWorkflowTemplates(cwd);

  for (const tool of tools) {
    const platformId = resolveCliFlag(tool);
    if (platformId) {
      console.log(chalk.blue(`📝 Configuring ${AI_TOOLS[platformId].name}...`));
      await configurePlatform(platformId, cwd);
    }
  }

  if (process.platform === "win32") {
    const pythonPlatforms = getPlatformsWithPythonHooks();
    const hasSelectedPythonPlatform = pythonPlatforms.some((id) =>
      tools.includes(AI_TOOLS[id].cliFlag),
    );
    if (hasSelectedPythonPlatform) {
      console.log(
        chalk.yellow('📌 Windows detected: Using "python" for hooks'),
      );
    }
  }

  await createRootFiles(cwd);
}
