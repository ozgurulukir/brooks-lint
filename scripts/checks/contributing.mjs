/**
 * Check: CONTRIBUTING.md must mention current eval count
 */

export function check(context) {
  const { errors, readText, evalCount } = context;

  const contributing = readText("CONTRIBUTING.md");
  if (!contributing.includes(`currently ${evalCount}`)) {
    errors.push(`CONTRIBUTING.md should mention the current eval count (${evalCount})`);
  }
}
