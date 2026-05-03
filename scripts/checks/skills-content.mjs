/**
 * Check: Skill metadata and guide content must meet structural requirements
 */

export function check(context) {
  const { errors, readText, sourceWord } = context;

  const modes = ["brooks-review", "brooks-audit", "brooks-debt", "brooks-test", "brooks-health", "brooks-sweep"];

  // Guard: _shared/ must never contain a SKILL.md
  try {
    readText("skills/_shared/SKILL.md");
    errors.push("skills/_shared/SKILL.md must not exist — _shared/ is a library, not a skill");
  } catch (_) {
    // expected — file should not exist
  }

  for (const mode of modes) {
    const skillMd = readText(`skills/${mode}/SKILL.md`);

    if (!skillMd.includes("## Setup")) {
      errors.push(`skills/${mode}/SKILL.md should have a ## Setup section`);
    }

    // Check Process section exists and contains at least one numbered item
    const processMatch = skillMd.match(/## Process\n([\s\S]*?)(?=\n##|$)/);
    if (!processMatch) {
      errors.push(`skills/${mode}/SKILL.md has no ## Process section`);
    } else if (!/^\d+\./m.test(processMatch[1])) {
      errors.push(`skills/${mode}/SKILL.md Process section has no numbered items`);
    }

    // Check frontmatter description references current book count
    const frontmatterMatch = skillMd.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      if (!frontmatter.includes(`${sourceWord} classic`)) {
        errors.push(
          `skills/${mode}/SKILL.md frontmatter description should reference "${sourceWord} classic engineering books" — update stale book count`
        );
      }
    }
  }

  // All guides must reference the Iron Law
  const guides = [
    ["brooks-review", "pr-review-guide.md"],
    ["brooks-audit", "architecture-guide.md"],
    ["brooks-debt", "debt-guide.md"],
    ["brooks-test", "test-guide.md"],
    ["brooks-health", "health-guide.md"],
    ["brooks-sweep", "sweep-guide.md"],
  ];

  for (const [mode, guide] of guides) {
    const content = readText(`skills/${mode}/${guide}`);
    if (!content.includes("Iron Law")) {
      errors.push(`skills/${mode}/${guide} should reference the Iron Law`);
    }
  }
}
