/**
 * Sync plugin manifest files to the single source of truth: manifest-source.json
 *
 * Usage:  node scripts/sync-manifests.mjs
 *
 * Updates version and description fields in:
 *   - .claude-plugin/plugin.json
 *   - .claude-plugin/marketplace.json (inside plugins[0])
 *   - .codex-plugin/plugin.json
 *   - gemini-extension.json
 *
 * All fields are overwritten to match manifest-source.json exactly.
 * Prints a summary of updated files.
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function readJson(relPath) {
  return JSON.parse(readFileSync(path.join(root, relPath), "utf8"));
}

function writeJson(relPath, data) {
  writeFileSync(path.join(root, relPath), JSON.stringify(data, null, 2) + "\n", "utf8");
}

const source = readJson("manifest-source.json");
const sourceVersion = source.version;
const sourceDescription = source.description;

const updates = [];

// 1. .claude-plugin/plugin.json
let claudePlugin = readJson(".claude-plugin/plugin.json");
if (claudePlugin.version !== sourceVersion || claudePlugin.description !== sourceDescription) {
  claudePlugin.version = sourceVersion;
  claudePlugin.description = sourceDescription;
  writeJson(".claude-plugin/plugin.json", claudePlugin);
  updates.push(".claude-plugin/plugin.json");
}

// 2. .claude-plugin/marketplace.json
let marketplace = readJson(".claude-plugin/marketplace.json");
let changed = false;
if (marketplace.plugins[0].version !== sourceVersion) {
  marketplace.plugins[0].version = sourceVersion;
  changed = true;
}
if (marketplace.plugins[0].description !== sourceDescription) {
  marketplace.plugins[0].description = sourceDescription;
  changed = true;
}
if (changed) {
  writeJson(".claude-plugin/marketplace.json", marketplace);
  updates.push(".claude-plugin/marketplace.json");
}

// 3. .codex-plugin/plugin.json
let codexPlugin = readJson(".codex-plugin/plugin.json");
if (codexPlugin.version !== sourceVersion || codexPlugin.description !== sourceDescription) {
  codexPlugin.version = sourceVersion;
  codexPlugin.description = sourceDescription;
  writeJson(".codex-plugin/plugin.json", codexPlugin);
  updates.push(".codex-plugin/plugin.json");
}

// 4. gemini-extension.json
let geminiExt = readJson("gemini-extension.json");
if (geminiExt.version !== sourceVersion || geminiExt.description !== sourceDescription) {
  geminiExt.version = sourceVersion;
  geminiExt.description = sourceDescription;
  writeJson("gemini-extension.json", geminiExt);
  updates.push("gemini-extension.json");
}

if (updates.length > 0) {
  console.log(`✅ Synced ${updates.length} manifest(s) to version ${sourceVersion}:`);
  for (const file of updates) {
    console.log(`   - ${file}`);
  }
} else {
  console.log(`✅ All manifests already in sync with version ${sourceVersion}`);
}

process.exit(0);
