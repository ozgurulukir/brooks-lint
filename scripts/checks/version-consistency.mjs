/**
 * Check: All plugin manifest files must have the same version as manifest-source.json
 */

export function check(context) {
  const { errors, readJson, readText } = context;

  const source = readJson("manifest-source.json");
  const sourceVersion = source.version;

  const manifestVersions = [
    ["package.json", context.version],
    [".claude-plugin/plugin.json", readJson(".claude-plugin/plugin.json").version],
    [".claude-plugin/marketplace.json", readJson(".claude-plugin/marketplace.json").plugins[0]?.version],
    [".codex-plugin/plugin.json", readJson(".codex-plugin/plugin.json").version],
    ["gemini-extension.json", readJson("gemini-extension.json").version],
  ];

  for (const [file, foundVersion] of manifestVersions) {
    if (foundVersion !== sourceVersion) {
      errors.push(`${file} version ${foundVersion} does not match manifest-source.json version ${sourceVersion}`);
    }
  }
}
