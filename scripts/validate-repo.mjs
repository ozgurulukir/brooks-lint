/**
 * Repository validation orchestrator.
 *
 * This script verifies that the brooks-lint repository maintains structural integrity:
 * - Version and description consistency across plugin manifests
 * - Documentation completeness and cross-references
 * - Skill guide structure and step alignment
 * - Eval suite size and CONTRIBUTING.md accuracy
 * - Security.md placeholder cleanup
 * - Hook output format validation
 *
 * All validation logic is delegated to focused modules in ./checks/.
 * This orchestrator assembles shared context and aggregates errors.
 *
 * Usage:  node scripts/validate-repo.mjs
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — one or more checks failed (errors printed to stderr)
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import {
  parseFrontmatterBooks,
  countBookSections,
  countProductionRisks,
  countTestRisks,
  parseKeepAChangelogVersion,
  extractGuideStepLabels,
  PRODUCTION_RISK_COUNT,
  TEST_RISK_COUNT,
} from "./frontmatter.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function readText(relPath) {
  return readFileSync(path.join(root, relPath), "utf8");
}

function readJson(relPath) {
  return JSON.parse(readText(relPath));
}

// ── Canonical data ─────────────────────────────────────────────────────────

const packageJson = readJson("package.json");
const version = packageJson.version;

const sourceCoverage = readText("skills/_shared/source-coverage.md");
const books = parseFrontmatterBooks(sourceCoverage);
const sourceCount = books?.length ?? 0;

const _countWords = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
];
const sourceWord = _countWords[sourceCount] ?? String(sourceCount);
const sourceWordCap = sourceWord.charAt(0).toUpperCase() + sourceWord.slice(1);

const evals = readJson("evals/evals.json");
const evalCount = evals.evals.length;

// ── Shared context ─────────────────────────────────────────────────────────

const context = {
  errors: [],
  readText,
  readJson,
  root,
  version,
  sourceWord,
  sourceWordCap,
  books,
  sourceCoverage,
  evalCount,
};

// ── Check modules ───────────────────────────────────────────────────────────

import * as versionChecks from "./checks/version-consistency.mjs";
import * as descriptionChecks from "./checks/description-consistency.mjs";
import * as changelogCheck from "./checks/changelog.mjs";
import * as readmeCheck from "./checks/readme.mjs";
import * as configCheck from "./checks/config-examples.mjs";
import * as inventoryCheck from "./checks/source-inventory.mjs";
import * as frameworkCheck from "./checks/framework-integrity.mjs";
import * as stepCheck from "./checks/step-alignment.mjs";
import * as skillsCheck from "./checks/skills-content.mjs";
import * as evalCheck from "./checks/eval-suite.mjs";
import * as contributingCheck from "./checks/contributing.mjs";
import * as agentsCheck from "./checks/agents-docs.mjs";
import * as securityCheck from "./checks/security.mjs";
import * as hookCheck from "./checks/hook-output.mjs";

const checks = [
  versionChecks.check,
  descriptionChecks.check,
  changelogCheck.check,
  readmeCheck.check,
  configCheck.check,
  inventoryCheck.check,
  frameworkCheck.check,
  stepCheck.check,
  skillsCheck.check,
  evalCheck.check,
  contributingCheck.check,
  agentsCheck.check,
  securityCheck.check,
  hookCheck.check,
];

for (const check of checks) {
  check(context);
}

// ── Report ─────────────────────────────────────────────────────────────────

if (context.errors.length > 0) {
  console.error("Repository validation failed:");
  for (const error of context.errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log(`Repository validation passed for version ${version}.`);
