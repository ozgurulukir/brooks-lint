/**
 * Check: SECURITY.md must not contain placeholder content and must describe multi-platform support
 */

export function check(context) {
  const { errors, readText } = context;

  const security = readText("SECURITY.md");

  if (security.includes("<!--")) {
    errors.push("SECURITY.md still contains placeholder content");
  }

  if (!security.includes("Claude Code, Codex CLI, and Gemini CLI")) {
    errors.push("SECURITY.md should describe the repository as multi-platform");
  }
}
