/**
 * Check: Configuration example files and shared docs must contain expected T5 references
 */

export function check(context) {
  const { errors, readText } = context;

  const commonMd = readText("skills/_shared/common.md");
  const exampleYaml = readText(".brooks-lint.example.yaml");
  const readme = readText("README.md");

  if (!commonMd.includes("- T5")) {
    errors.push("skills/_shared/common.md should use T5 in the disable section of config examples");
  }

  if (!exampleYaml.includes("- T5")) {
    errors.push(".brooks-lint.example.yaml should use T5 in the disable section");
  }

  if (!readme.includes("- T5")) {
    errors.push("README.md configuration example should include T5 in the disable section");
  }

  if (!exampleYaml.includes("# suppress:")) {
    errors.push(".brooks-lint.example.yaml should include a commented suppress example");
  }
}
