#!/usr/bin/env node

/**
 * Cross-platform script to copy template files to dist/
 *
 * This script copies src/templates/ to dist/templates/ (excluding .ts files).
 *
 * The templates are GENERIC templates for user projects:
 * - src/templates/trellis/ - Workflow scripts and config
 * - src/templates/claude/ - Claude Code commands, agents, hooks
 * - src/templates/opencode/ - OpenCode commands, agents, hooks
 * - src/templates/codex/ - Codex skills
 * - src/templates/markdown/ - Markdown templates (spec, guides)
 *
 * Note: We NO LONGER copy from the project's own .trellis/, .claude/, .opencode/, or .codex/
 * because those may be customized for the Trellis project itself.
 */

import { cpSync, readdirSync, rmSync, statSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";

function isCompiledArtifact(filename) {
  return (
    filename.endsWith(".d.ts") ||
    filename.endsWith(".d.ts.map") ||
    filename.endsWith(".js") ||
    filename.endsWith(".js.map")
  );
}

/**
 * Recursively copy directory, excluding .ts files
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 */
function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });

  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (extname(entry) !== ".ts") {
      cpSync(srcPath, destPath);
    }
  }
}

/**
 * Remove stale non-compiled template assets while preserving tsc output.
 * This keeps dist/templates/*.js available at runtime.
 */
function pruneStaleAssets(src, dest) {
  mkdirSync(dest, { recursive: true });

  const srcEntries = new Set(readdirSync(src));

  for (const entry of readdirSync(dest)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const destStat = statSync(destPath);

    if (isCompiledArtifact(entry)) {
      continue;
    }

    if (!srcEntries.has(entry)) {
      rmSync(destPath, { recursive: true, force: true });
      continue;
    }

    const srcStat = statSync(srcPath);

    if (srcStat.isDirectory() && destStat.isDirectory()) {
      pruneStaleAssets(srcPath, destPath);
      continue;
    }

    if (srcStat.isDirectory() !== destStat.isDirectory()) {
      rmSync(destPath, { recursive: true, force: true });
    }
  }
}

// Remove stale template assets first, but keep compiled JS from tsc.
pruneStaleAssets("src/templates", "dist/templates");

// Copy src/templates assets to dist/templates
copyDir("src/templates", "dist/templates");
console.log("Copied src/templates/ to dist/templates");
