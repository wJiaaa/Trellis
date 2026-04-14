import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureDir, writeFile } from "../utils/file-writer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type TemplateCategory = "scripts" | "markdown" | "commands";

function getTemplatePath(name: string): string {
  const templatePath = path.join(__dirname, name);
  if (fs.existsSync(templatePath)) {
    return templatePath;
  }

  throw new Error(
    `Could not find ${name} templates directory. Expected at templates/${name}/`,
  );
}

export function getTrellisTemplatePath(): string {
  return getTemplatePath("trellis");
}

export function getClaudeTemplatePath(): string {
  return getTemplatePath("claude");
}

export function getOpenCodeTemplatePath(): string {
  return getTemplatePath("opencode");
}

export function getCodexTemplatePath(): string {
  return getTemplatePath("codex");
}

export function readTrellisFile(relativePath: string): string {
  const trellisPath = getTrellisTemplatePath();
  const filePath = path.join(trellisPath, relativePath);
  return fs.readFileSync(filePath, "utf-8");
}

export function readTemplate(
  category: TemplateCategory,
  filename: string,
): string {
  const templatePath = path.join(__dirname, category, filename);
  return fs.readFileSync(templatePath, "utf-8");
}

export function readScript(relativePath: string): string {
  return readTrellisFile(`scripts/${relativePath}`);
}

export function readMarkdown(relativePath: string): string {
  return readTrellisFile(relativePath);
}

export function readClaudeFile(relativePath: string): string {
  const claudePath = getClaudeTemplatePath();
  const filePath = path.join(claudePath, relativePath);
  return fs.readFileSync(filePath, "utf-8");
}

export function readOpenCodeFile(relativePath: string): string {
  const opencodePath = getOpenCodeTemplatePath();
  const filePath = path.join(opencodePath, relativePath);
  return fs.readFileSync(filePath, "utf-8");
}

export async function copyTrellisDir(
  srcRelativePath: string,
  destPath: string,
  options?: { executable?: boolean },
): Promise<void> {
  const trellisPath = getTrellisTemplatePath();
  const srcPath = path.join(trellisPath, srcRelativePath);
  await copyDirRecursive(srcPath, destPath, options);
}

async function copyDirRecursive(
  src: string,
  dest: string,
  options?: { executable?: boolean },
): Promise<void> {
  ensureDir(dest);

  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      await copyDirRecursive(srcPath, destPath, options);
    } else {
      const content = fs.readFileSync(srcPath, "utf-8");
      const isExecutable =
        options?.executable && (entry.endsWith(".sh") || entry.endsWith(".py"));
      await writeFile(destPath, content, { executable: isExecutable });
    }
  }
}
