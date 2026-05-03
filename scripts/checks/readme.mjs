/**
 * Check: README.md must contain required sections, badges, and citations
 */

// Canonical Claude Code install command — must appear in README.md.
const CANONICAL_INSTALL_CMD = "/plugin marketplace add hyhmrright/brooks-lint";

export function check(context) {
  const { errors, readText, version, sourceWord, sourceWordCap } = context;

  const readme = readText("README.md");

  if (!readme.includes(`version-${version}-blue.svg`)) {
    errors.push(`README.md badge does not reference version ${version}`);
  }

  if (!readme.includes(CANONICAL_INSTALL_CMD)) {
    errors.push(`README.md should contain canonical install command`);
  }

  if (!readme.includes(`grounded in ${sourceWord} classic engineering books`)) {
    errors.push(`README.md should describe Brooks-Lint as grounded in ${sourceWord} classic engineering books`);
  }

  if (!readme.includes(`## The ${sourceWordCap} Books`)) {
    errors.push(`README.md should expose a unified The ${sourceWordCap} Books section`);
  }

  if (!readme.includes("*The Art of Unit Testing*")) {
    errors.push("README.md should list The Art of Unit Testing in the source inventory");
  }

  if (!readme.includes("*How Google Tests Software*")) {
    errors.push("README.md should list How Google Tests Software in the source inventory");
  }

  if (!readme.includes("source-coverage.md")) {
    errors.push("README.md should link to the source coverage matrix");
  }
}
