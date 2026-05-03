/**
 * Check: All plugin manifest files must have the same description as manifest-source.json
 */

export function check(context) {
  const { errors, readJson } = context;

  const source = readJson("manifest-source.json");
  const canonicalDesc = source.description;

  const manifestDescs = [
    [".claude-plugin/plugin.json", readJson(".claude-plugin/plugin.json").description],
    [".claude-plugin/marketplace.json", readJson(".claude-plugin/marketplace.json").plugins[0]?.description],
    [".codex-plugin/plugin.json", readJson(".codex-plugin/plugin.json").description],
    ["gemini-extension.json", readJson("gemini-extension.json").description],
  ];

  for (const [file, desc] of manifestDescs) {
    if (desc !== canonicalDesc) {
      errors.push(`${file} description does not match manifest-source.json`);
    }
  }
}
