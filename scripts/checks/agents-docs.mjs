/**
 * Check: AGENTS.md must describe repository correctly and mention eval count
 */

export function check(context) {
  const { errors, readText, sourceWord, evalCount } = context;

  const agents = readText("AGENTS.md");
  if (!agents.includes(`${sourceWord} classic engineering books`)) {
    errors.push(`AGENTS.md should describe the repository as grounded in ${sourceWord} classic engineering books`);
  }
  if (!agents.includes(`${evalCount} scenarios`)) {
    errors.push(`AGENTS.md should mention the expanded eval suite (${evalCount} scenarios)`);
  }
}
