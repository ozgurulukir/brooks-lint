/**
 * Check: hooks/session-start must output correct JSON structure for both Claude and Cursor
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";

export function check(context) {
  const { errors, readText, root } = context;

  function runHook(env = {}) {
    const tempHome = mkdtempSync(path.join(os.tmpdir(), "brooks-lint-hook-home-"));
    try {
      const stdout = execFileSync("bash", ["hooks/session-start"], {
        cwd: root,
        env: { ...process.env, HOME: tempHome, ...env },
        encoding: "utf8",
      });
      return JSON.parse(stdout);
    } finally {
      // Clean up the temporary HOME directory to avoid resource leaks
      rmSync(tempHome, { recursive: true, force: true });
    }
  }

  const defaultOut = runHook();
  if (typeof defaultOut.additional_context !== "string") {
    errors.push("hooks/session-start default output must include additional_context");
  }

  const claudeOut = runHook({ CLAUDE_PLUGIN_ROOT: "1" });
  if (claudeOut.hookSpecificOutput?.hookEventName !== "SessionStart") {
    errors.push("hooks/session-start Claude output must include hookSpecificOutput.hookEventName");
  }
  if (typeof claudeOut.hookSpecificOutput?.additionalContext !== "string") {
    errors.push("hooks/session-start Claude output must include hookSpecificOutput.additionalContext");
  }
}
