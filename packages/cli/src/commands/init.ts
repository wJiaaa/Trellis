import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import { createWorkflowStructure } from "../configurators/workflow.js";
import {
  getInitToolChoices,
  resolveCliFlag,
  configurePlatform,
  getConfiguredPlatforms,
  getPlatformsWithPythonHooks,
} from "../configurators/index.js";
import { AI_TOOLS, type CliFlag } from "../types/ai-tools.js";
import { DIR_NAMES, FILE_NAMES, PATHS } from "../constants/paths.js";
import { agentsMdContent } from "../templates/markdown/index.js";
import {
  setWriteMode,
  writeFile,
  type WriteMode,
} from "../utils/file-writer.js";
import {
  detectProjectType,
  detectMonorepo,
  sanitizePkgName,
  type ProjectType,
  type DetectedPackage,
} from "../utils/project-detector.js";

/**
 * Detect available Python command (python3 or python) and verify version >= 3.10
 */
function getPythonCommand(): string {
  const MIN_MAJOR = 3;
  const MIN_MINOR = 10;

  function checkVersion(cmd: string): boolean {
    try {
      const output = execSync(`${cmd} --version`, { stdio: "pipe" })
        .toString()
        .trim();
      const match = output.match(/Python (\d+)\.(\d+)/);
      if (!match) return false;
      const [, major, minor] = match.map(Number);
      return major > MIN_MAJOR || (major === MIN_MAJOR && minor >= MIN_MINOR);
    } catch {
      return false;
    }
  }

  if (checkVersion("python3")) return "python3";
  if (checkVersion("python")) return "python";

  // Check if Python exists but is too old
  try {
    const output = execSync("python3 --version", { stdio: "pipe" })
      .toString()
      .trim();
    console.warn(
      chalk.yellow(
        `⚠️  ${output} detected, but Trellis requires Python ≥ 3.10`,
      ),
    );
  } catch {
    try {
      const output = execSync("python --version", { stdio: "pipe" })
        .toString()
        .trim();
      console.warn(
        chalk.yellow(
          `⚠️  ${output} detected, but Trellis requires Python ≥ 3.10`,
        ),
      );
    } catch {
      // No Python at all
    }
  }
  return "python3";
}

// =============================================================================
// Bootstrap Task Creation
// =============================================================================

const BOOTSTRAP_TASK_NAME = "00-bootstrap-guidelines";

function getBootstrapPrdContent(
  projectType: ProjectType,
  packages?: DetectedPackage[],
): string {
  const header = `# Bootstrap: Fill Project Development Guidelines

## Purpose

Welcome to Trellis! This is your first task.

AI agents use \`.trellis/spec/\` to understand YOUR project's coding conventions.
**Starting from scratch = AI writes generic code that doesn't match your project style.**

Filling these guidelines is a one-time setup that pays off for every future AI session.

---

## Your Task

Fill in the guideline files based on your **existing codebase**.
`;

  const backendSection = `

### Backend Guidelines

| File | What to Document |
|------|------------------|
| \`.trellis/spec/backend/directory-structure.md\` | Where different file types go (routes, services, utils) |
| \`.trellis/spec/backend/database-guidelines.md\` | ORM, migrations, query patterns, naming conventions |
| \`.trellis/spec/backend/error-handling.md\` | How errors are caught, logged, and returned |
| \`.trellis/spec/backend/logging-guidelines.md\` | Log levels, format, what to log |
| \`.trellis/spec/backend/quality-guidelines.md\` | Code review standards, testing requirements |
`;

  const frontendSection = `

### Frontend Guidelines

| File | What to Document |
|------|------------------|
| \`.trellis/spec/frontend/directory-structure.md\` | Component/page/hook organization |
| \`.trellis/spec/frontend/component-guidelines.md\` | Component patterns, props conventions |
| \`.trellis/spec/frontend/hook-guidelines.md\` | Custom hook naming, patterns |
| \`.trellis/spec/frontend/state-management.md\` | State library, patterns, what goes where |
| \`.trellis/spec/frontend/type-safety.md\` | TypeScript conventions, type organization |
| \`.trellis/spec/frontend/quality-guidelines.md\` | Linting, testing, accessibility |
`;

  const footer = `

### Thinking Guides (Optional)

The \`.trellis/spec/guides/\` directory contains thinking guides that are already
filled with general best practices. You can customize them for your project if needed.

---

## How to Fill Guidelines

### Step 0: Import from Existing Specs (Recommended)

Many projects already have coding conventions documented. **Check these first** before writing from scratch:

| File / Directory | Tool |
|------|------|
| \`CLAUDE.md\` / \`CLAUDE.local.md\` | Claude Code |
| \`AGENTS.md\` | Codex / Claude Code / agent-compatible tools |
| \`.clinerules\` | Cline |
| \`.roomodes\` | Roo Code |
| \`CONVENTIONS.md\` / \`.aider.conf.yml\` | aider |
| \`CONTRIBUTING.md\` | General project conventions |
| \`.editorconfig\` | Editor formatting rules |

If any of these exist, read them first and extract the relevant coding conventions into the corresponding \`.trellis/spec/\` files. This saves significant effort compared to writing everything from scratch.

### Step 1: Analyze the Codebase

Ask AI to help discover patterns from actual code:

- "Read all existing config files (CLAUDE.md, AGENTS.md, etc.) and extract coding conventions into .trellis/spec/"
- "Analyze my codebase and document the patterns you see"
- "Find error handling / component / API patterns and document them"

### Step 2: Document Reality, Not Ideals

Write what your codebase **actually does**, not what you wish it did.
AI needs to match existing patterns, not introduce new ones.

- **Look at existing code** - Find 2-3 examples of each pattern
- **Include file paths** - Reference real files as examples
- **List anti-patterns** - What does your team avoid?

---

## Completion Checklist

- [ ] Guidelines filled for your project type
- [ ] At least 2-3 real code examples in each guideline
- [ ] Anti-patterns documented

When done:

\`\`\`bash
python3 ./.trellis/scripts/task.py finish
python3 ./.trellis/scripts/task.py archive 00-bootstrap-guidelines
\`\`\`

---

## Why This Matters

After completing this task:

1. AI will write code that matches your project style
2. Relevant \`/trellis:before-*-dev\` commands will inject real context
3. \`/trellis:check-*\` commands will validate against your actual standards
4. Future sessions will onboard faster with real project context
`;

  let content = header;

  if (packages && packages.length > 0) {
    // Monorepo: generate per-package sections
    for (const pkg of packages) {
      const pkgType = pkg.type === "unknown" ? "fullstack" : pkg.type;
      const specName = sanitizePkgName(pkg.name);
      content += `\n### Package: ${pkg.name} (\`spec/${specName}/\`)\n`;
      if (pkgType !== "frontend") {
        content += `\n- Backend guidelines: \`.trellis/spec/${specName}/backend/\`\n`;
      }
      if (pkgType !== "backend") {
        content += `\n- Frontend guidelines: \`.trellis/spec/${specName}/frontend/\`\n`;
      }
    }
  } else if (projectType === "frontend") {
    content += frontendSection;
  } else if (projectType === "backend") {
    content += backendSection;
  } else {
    // fullstack
    content += backendSection;
    content += frontendSection;
  }
  content += footer;

  return content;
}

interface TaskJson {
  id: string;
  name: string;
  description: string;
  status: string;
  dev_type: string;
  priority: string;
  creator: string;
  assignee: string;
  createdAt: string;
  completedAt: null;
  commit: null;
  subtasks: { name: string; status: string }[];
  children: string[];
  parent: string | null;
  relatedFiles: string[];
  notes: string;
  meta: Record<string, unknown>;
}

function getBootstrapTaskJson(
  developer: string,
  projectType: ProjectType,
  packages?: DetectedPackage[],
): TaskJson {
  const today = new Date().toISOString().split("T")[0];

  let subtasks: { name: string; status: string }[];
  let relatedFiles: string[];

  if (packages && packages.length > 0) {
    // Monorepo: subtask per package
    subtasks = packages.map((pkg) => ({
      name: `Fill guidelines for ${pkg.name}`,
      status: "pending",
    }));
    subtasks.push({ name: "Add code examples", status: "pending" });
    relatedFiles = packages.map(
      (pkg) => `.trellis/spec/${sanitizePkgName(pkg.name)}/`,
    );
  } else if (projectType === "frontend") {
    subtasks = [
      { name: "Fill frontend guidelines", status: "pending" },
      { name: "Add code examples", status: "pending" },
    ];
    relatedFiles = [".trellis/spec/frontend/"];
  } else if (projectType === "backend") {
    subtasks = [
      { name: "Fill backend guidelines", status: "pending" },
      { name: "Add code examples", status: "pending" },
    ];
    relatedFiles = [".trellis/spec/backend/"];
  } else {
    // fullstack
    subtasks = [
      { name: "Fill backend guidelines", status: "pending" },
      { name: "Fill frontend guidelines", status: "pending" },
      { name: "Add code examples", status: "pending" },
    ];
    relatedFiles = [".trellis/spec/backend/", ".trellis/spec/frontend/"];
  }

  return {
    id: BOOTSTRAP_TASK_NAME,
    name: "Bootstrap Guidelines",
    description: "Fill in project development guidelines for AI agents",
    status: "in_progress",
    dev_type: "docs",
    priority: "P1",
    creator: developer,
    assignee: developer,
    createdAt: today,
    completedAt: null,
    commit: null,
    subtasks,
    children: [],
    parent: null,
    relatedFiles,
    notes: `First-time setup task created by trellis init (${projectType} project)`,
    meta: {},
  };
}

/**
 * Create bootstrap task for first-time setup
 */
function createBootstrapTask(
  cwd: string,
  developer: string,
  projectType: ProjectType,
  packages?: DetectedPackage[],
): boolean {
  const taskDir = path.join(cwd, PATHS.TASKS, BOOTSTRAP_TASK_NAME);
  const taskRelativePath = `${PATHS.TASKS}/${BOOTSTRAP_TASK_NAME}`;

  // Check if already exists
  if (fs.existsSync(taskDir)) {
    return true; // Already exists, not an error
  }

  try {
    // Create task directory
    fs.mkdirSync(taskDir, { recursive: true });

    // Write task.json
    const taskJson = getBootstrapTaskJson(developer, projectType, packages);
    fs.writeFileSync(
      path.join(taskDir, FILE_NAMES.TASK_JSON),
      JSON.stringify(taskJson, null, 2),
      "utf-8",
    );

    // Write prd.md
    const prdContent = getBootstrapPrdContent(projectType, packages);
    fs.writeFileSync(path.join(taskDir, FILE_NAMES.PRD), prdContent, "utf-8");

    // Set as current task
    const currentTaskFile = path.join(cwd, PATHS.CURRENT_TASK_FILE);
    fs.writeFileSync(currentTaskFile, taskRelativePath, "utf-8");

    return true;
  } catch {
    return false;
  }
}

/**
 * Handle re-init when .trellis/ already exists.
 * Returns true if handled (caller should return), false if user chose full re-init.
 */
async function handleReinit(
  cwd: string,
  options: InitOptions,
  developerName: string | undefined,
): Promise<boolean> {
  const TOOLS = getInitToolChoices();
  const configuredPlatforms = getConfiguredPlatforms(cwd);
  const configuredNames = [...configuredPlatforms]
    .map((id) => AI_TOOLS[id].name)
    .join(", ");

  // Determine explicit platform flags
  const explicitTools = TOOLS.filter(
    (t) => options[t.key as keyof InitOptions],
  ).map((t) => t.key);

  let doAddPlatforms = explicitTools.length > 0;
  let doAddDeveloper = !!options.user;
  let platformsToAdd: string[] = explicitTools;

  // No explicit flags → show menu
  if (!doAddPlatforms && !doAddDeveloper) {
    if (options.yes) {
      console.log(chalk.gray(`Already initialized with: ${configuredNames}`));
      console.log(
        chalk.gray(
          "Use platform flags (e.g., --codex) or -u <name> to add platforms/developer.",
        ),
      );
      return true;
    }

    console.log(
      chalk.gray(`\n   Already initialized with: ${configuredNames}\n`),
    );

    const { action } = await inquirer.prompt<{ action: string }>([
      {
        type: "list",
        name: "action",
        message: "Trellis is already initialized. What would you like to do?",
        choices: [
          { name: "Add AI platform(s)", value: "add-platform" },
          {
            name: "Set up developer identity on this device",
            value: "add-developer",
          },
          { name: "Full re-initialize", value: "full" },
        ],
      },
    ]);

    if (action === "full") {
      return false; // Fall through to full init
    }
    if (action === "add-platform") doAddPlatforms = true;
    if (action === "add-developer") doAddDeveloper = true;
  }

  // --- Add platforms ---
  if (doAddPlatforms) {
    if (platformsToAdd.length === 0) {
      // Interactive: show only unconfigured platforms
      const unconfigured = TOOLS.filter((t) => {
        const pid = resolveCliFlag(t.key);
        return pid && !configuredPlatforms.has(pid);
      });

      if (unconfigured.length === 0) {
        console.log(
          chalk.green("✓ All available platforms are already configured."),
        );
      } else {
        const answers = await inquirer.prompt<{ tools: string[] }>([
          {
            type: "checkbox",
            name: "tools",
            message: "Select platforms to add:",
            choices: unconfigured.map((t) => ({
              name: t.name,
              value: t.key,
            })),
          },
        ]);
        platformsToAdd = answers.tools;
      }
    }

    for (const tool of platformsToAdd) {
      const platformId = resolveCliFlag(tool as CliFlag);
      if (platformId) {
        if (configuredPlatforms.has(platformId)) {
          console.log(
            chalk.gray(
              `  ○ ${AI_TOOLS[platformId].name} already configured, skipping`,
            ),
          );
        } else {
          console.log(
            chalk.blue(`📝 Configuring ${AI_TOOLS[platformId].name}...`),
          );
          await configurePlatform(platformId, cwd);
        }
      }
    }
  }

  // --- Add developer ---
  if (doAddDeveloper) {
    let devName = developerName;
    if (!devName) {
      devName = await askInput("Your name: ");
      while (!devName) {
        console.log(chalk.yellow("Name is required"));
        devName = await askInput("Your name: ");
      }
    }

    try {
      const pythonCmd = getPythonCommand();
      const scriptPath = path.join(cwd, PATHS.SCRIPTS, "init_developer.py");
      execSync(`${pythonCmd} "${scriptPath}" "${devName}"`, {
        cwd,
        stdio: "pipe",
      });
      console.log(chalk.green(`✓ Developer "${devName}" initialized`));
    } catch {
      console.log(
        chalk.yellow("⚠ Could not initialize developer. Run manually:"),
      );
      console.log(
        chalk.gray(`  python3 .trellis/scripts/init_developer.py ${devName}`),
      );
    }
  }

  return true;
}

interface InitOptions {
  claude?: boolean;
  opencode?: boolean;
  codex?: boolean;
  yes?: boolean;
  user?: string;
  force?: boolean;
  skipExisting?: boolean;
  monorepo?: boolean;
}

// Compile-time check: every CliFlag must be a key of InitOptions.
// If a new platform is added to CliFlag but not to InitOptions, this line errors.
// Uses [X] extends [Y] to prevent distributive conditional behavior.
type _AssertCliFlagsInOptions = [CliFlag] extends [keyof InitOptions]
  ? true
  : "ERROR: CliFlag has values not present in InitOptions";
const _cliFlagCheck: _AssertCliFlagsInOptions = true;

/**
 * Write monorepo package configuration to config.yaml (non-destructive patch).
 * Appends packages: and default_package: without disturbing existing config.
 */
function writeMonorepoConfig(cwd: string, packages: DetectedPackage[]): void {
  const configPath = path.join(cwd, DIR_NAMES.WORKFLOW, "config.yaml");
  let content = "";

  try {
    content = fs.readFileSync(configPath, "utf-8");
  } catch {
    // Config not created yet; will be created by createWorkflowStructure
    return;
  }

  // Don't overwrite if packages: already exists (re-init case)
  if (/^packages\s*:/m.test(content)) {
    return;
  }

  const lines = ["\n# Auto-detected monorepo packages", "packages:"];
  for (const pkg of packages) {
    lines.push(`  ${sanitizePkgName(pkg.name)}:`);
    lines.push(`    path: ${pkg.path}`);
    if (pkg.isSubmodule) {
      lines.push("    type: submodule");
    }
  }

  // Use first non-submodule package as default, fallback to first package
  const defaultPkg =
    packages.find((p) => !p.isSubmodule)?.name ?? packages[0]?.name;
  if (defaultPkg) {
    lines.push(`default_package: ${defaultPkg}`);
  }

  fs.writeFileSync(
    configPath,
    content.trimEnd() + "\n" + lines.join("\n") + "\n",
    "utf-8",
  );
}

interface InitAnswers {
  tools: string[];
}

export async function init(options: InitOptions): Promise<void> {
  const cwd = process.cwd();
  const isFirstInit = !fs.existsSync(path.join(cwd, DIR_NAMES.WORKFLOW));

  // Generate ASCII art banner dynamically using FIGlet "Rebel" font
  const banner = figlet.textSync("Trellis", { font: "Rebel" });
  console.log(chalk.cyan(`\n${banner.trimEnd()}`));
  console.log(
    chalk.gray(
      "\n   Personal AI workflow toolkit for Claude Code, OpenCode, and Codex\n",
    ),
  );

  // Set write mode based on options
  let writeMode: WriteMode = "ask";
  if (options.force) {
    writeMode = "force";
    console.log(chalk.gray("Mode: Force overwrite existing files\n"));
  } else if (options.skipExisting) {
    writeMode = "skip";
    console.log(chalk.gray("Mode: Skip existing files\n"));
  }
  setWriteMode(writeMode);

  // Detect developer name from git config or options
  let developerName = options.user;
  if (!developerName) {
    // Only detect from git if current directory is a git repo
    const isGitRepo = fs.existsSync(path.join(cwd, ".git"));
    if (isGitRepo) {
      try {
        developerName = execSync("git config user.name", {
          cwd,
          encoding: "utf-8",
        }).trim();
      } catch {
        // Git not available or no user.name configured
      }
    }
  }

  if (developerName) {
    console.log(chalk.blue("👤 Developer:"), chalk.gray(developerName));
  }

  // ==========================================================================
  // Re-init fast path: skip full flow when .trellis/ already exists
  // ==========================================================================

  if (!isFirstInit && !options.force && !options.skipExisting) {
    const reinitDone = await handleReinit(cwd, options, developerName);
    if (reinitDone) return;
    // reinitDone === false means user chose "full re-initialize" → fall through
  }

  if (!developerName && !options.yes) {
    // Ask for developer name if not detected and not in yes mode
    console.log(
      chalk.gray(
        "\nTrellis keeps a personal workspace directory for session continuity:\n" +
          `  ${PATHS.WORKSPACE}/{name}/\n` +
          "Tip: Usually this is your git username (git config user.name).\n",
      ),
    );
    developerName = await askInput("Your name: ");
    while (!developerName) {
      console.log(chalk.yellow("Name is required"));
      developerName = await askInput("Your name: ");
    }
    console.log(chalk.blue("👤 Developer:"), chalk.gray(developerName));
  }

  // Detect project type (silent - no output)
  const detectedType = detectProjectType(cwd);

  // ==========================================================================
  // Monorepo Detection
  // ==========================================================================

  let monorepoPackages: DetectedPackage[] | undefined;

  if (options.monorepo !== false) {
    // options.monorepo: true = --monorepo, false = --no-monorepo, undefined = auto
    const detected = detectMonorepo(cwd);

    if (options.monorepo === true && !detected) {
      console.log(
        chalk.red(
          "Error: --monorepo specified but no monorepo configuration found.",
        ),
      );
      return;
    }

    if (detected && detected.length > 0) {
      let enableMonorepo = false;

      if (options.monorepo === true || options.yes) {
        enableMonorepo = true;
      } else {
        // Show detected packages and ask
        console.log(chalk.blue("\n🔍 Detected monorepo packages:"));
        for (const pkg of detected) {
          const sub = pkg.isSubmodule ? chalk.gray(" (submodule)") : "";
          console.log(
            chalk.gray(`   - ${pkg.name}`) +
              chalk.gray(` (${pkg.path})`) +
              chalk.gray(` [${pkg.type}]`) +
              sub,
          );
        }
        console.log("");

        const { useMonorepo } = await inquirer.prompt<{
          useMonorepo: boolean;
        }>([
          {
            type: "confirm",
            name: "useMonorepo",
            message: "Enable monorepo mode?",
            default: true,
          },
        ]);
        enableMonorepo = useMonorepo;
      }

      if (enableMonorepo) {
        monorepoPackages = detected;
      }
    }
  }

  // Tool definitions derived from platform registry
  const TOOLS = getInitToolChoices();

  // Build tools from explicit flags
  const explicitTools = TOOLS.filter(
    (t) => options[t.key as keyof InitOptions],
  ).map((t) => t.key);

  let tools: string[];

  if (explicitTools.length > 0) {
    // Explicit flags take precedence (works with or without -y)
    tools = explicitTools;
  } else if (options.yes) {
    // No explicit tools + -y: default to Claude only
    tools = TOOLS.filter((t) => t.defaultChecked).map((t) => t.key);
  } else {
    // Interactive mode
    const answers = await inquirer.prompt<InitAnswers>([
      {
        type: "checkbox",
        name: "tools",
        message: "Select AI tools to configure:",
        choices: TOOLS.map((t) => ({
          name: t.name,
          value: t.key,
          checked: t.defaultChecked,
        })),
      },
    ]);
    tools = answers.tools;
  }

  // Treat unknown project type as fullstack
  const projectType: ProjectType =
    detectedType === "unknown" ? "fullstack" : detectedType;

  if (tools.length === 0) {
    console.log(
      chalk.yellow("No tools selected. At least one tool is required."),
    );
    return;
  }

  // ==========================================================================
  // Create Workflow Structure
  // ==========================================================================

  // Create workflow structure with project type
  // Multi-agent is enabled by default
  console.log(chalk.blue("📁 Creating workflow structure..."));
  await createWorkflowStructure(cwd, {
    projectType,
    multiAgent: true,
    packages: monorepoPackages,
  });

  // Write monorepo packages to config.yaml (non-destructive patch)
  if (monorepoPackages) {
    writeMonorepoConfig(cwd, monorepoPackages);
    console.log(chalk.blue("📦 Monorepo packages written to config.yaml"));
  }

  // Configure selected tools by copying entire directories (dogfooding)
  for (const tool of tools) {
    const platformId = resolveCliFlag(tool);
    if (platformId) {
      console.log(chalk.blue(`📝 Configuring ${AI_TOOLS[platformId].name}...`));
      await configurePlatform(platformId, cwd);
    }
  }

  // Show Windows platform detection notice
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

  // Create root files (skip if exists)
  await createRootFiles(cwd);

  // Initialize developer identity (silent - no output)
  if (developerName) {
    try {
      const pythonCmd = getPythonCommand();
      const scriptPath = path.join(cwd, PATHS.SCRIPTS, "init_developer.py");
      execSync(`${pythonCmd} "${scriptPath}" "${developerName}"`, {
        cwd,
        stdio: "pipe", // Silent
      });

      // Create bootstrap task only on first init (not re-init for new platforms/devices)
      if (isFirstInit) {
        createBootstrapTask(cwd, developerName, projectType, monorepoPackages);
      }
    } catch {
      // Silent failure - user can run init_developer.py manually
    }
  }

  // Print "What We Solve" section
  printWhatWeSolve();
}

/**
 * Simple readline-based input (no flickering like inquirer)
 */
function askInput(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function createRootFiles(cwd: string): Promise<void> {
  const agentsPath = path.join(cwd, "AGENTS.md");

  // Write AGENTS.md from template
  const agentsWritten = await writeFile(agentsPath, agentsMdContent);
  if (agentsWritten) {
    console.log(chalk.blue("📄 Created AGENTS.md"));
  }
}

/**
 * Print "What We Solve" section showing Trellis value proposition
 * Styled like a meme/rant to resonate with developer pain points
 */
function printWhatWeSolve(): void {
  console.log(
    chalk.gray("\nSound familiar? ") +
      chalk.bold("You'll never say these again!!\n"),
  );

  // Pain point 1: Bug loop → Thinking Guides + Ralph Loop
  console.log(chalk.gray("✗ ") + '"Fix A → break B → fix B → break A..."');
  console.log(
    chalk.green("  ✓ ") +
      chalk.white("Thinking Guides + Ralph Loop: Think first, verify after"),
  );
  // Pain point 2: Instructions ignored/forgotten → Sub-agents + per-agent spec injection
  console.log(
    chalk.gray("✗ ") +
      '"Wrote CLAUDE.md, AI ignored it. Reminded AI, it forgot 5 turns later."',
  );
  console.log(
    chalk.green("  ✓ ") +
      chalk.white("Spec Injection: Rules enforced per task, not per chat"),
  );
  // Pain point 3: Missing connections → Cross-Layer Guide
  console.log(chalk.gray("✗ ") + '"Code works but nothing connects..."');
  console.log(
    chalk.green("  ✓ ") +
      chalk.white("Cross-Layer Guide: Map data flow before coding"),
  );
  // Pain point 4: Code explosion → Plan Agent
  console.log(chalk.gray("✗ ") + '"Asked for a button, got 9000 lines"');
  console.log(
    chalk.green("  ✓ ") +
      chalk.white("Plan Agent: Rejects and splits oversized tasks"),
  );

  console.log("");
}
