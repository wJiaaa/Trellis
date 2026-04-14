import fs from "node:fs";
import path from "node:path";
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
import { AI_TOOLS } from "../types/ai-tools.js";
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
    const taskJson = getBootstrapTaskJson(projectType, packages);
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

interface InitOptions {
  yes?: boolean;
  force?: boolean;
  skipExisting?: boolean;
  monorepo?: boolean;
}

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

  if (!isFirstInit) {
    const configuredPlatforms = getConfiguredPlatforms(cwd);
    const configuredNames = [...configuredPlatforms]
      .map((id) => AI_TOOLS[id].name)
      .join(", ");

    console.log(chalk.gray(`Already initialized with: ${configuredNames || "(none)"}`));
    console.log(chalk.gray("Use `trellis update` to refresh templates or platform integration."));
    return;
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

  let tools: string[];

  if (options.yes) {
    // Default non-interactive selection: Claude only
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

  // Create bootstrap task only on first init (not re-init for new platforms/devices)
  if (isFirstInit) {
    createBootstrapTask(cwd, projectType, monorepoPackages);
  }

  // Print "What We Solve" section
  printWhatWeSolve();
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
