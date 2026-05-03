/**
 * Check: CHANGELOG.md latest version must match package.json version
 */

import { parseKeepAChangelogVersion } from "../frontmatter.mjs";

export function check(context) {
  const { errors, readText, version } = context;

  const changelog = readText("CHANGELOG.md");
  const latestVersion = parseKeepAChangelogVersion(changelog);
  if (latestVersion !== version) {
    errors.push(
      `CHANGELOG.md latest version ${latestVersion ?? "<missing>"} does not match package.json version ${version}`
    );
  }
}
