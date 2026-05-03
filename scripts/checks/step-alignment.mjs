/**
 * Check: All skill guides must have sequential step labels and valid SKILL.md Process sections
 */

import { extractGuideStepLabels } from "../frontmatter.mjs";
import { validateStepSequence } from "../validate/step-sequence.mjs";

const SKILL_GUIDES = [
  ["brooks-review", "pr-review-guide.md"],
  ["brooks-audit", "architecture-guide.md"],
  ["brooks-debt", "debt-guide.md"],
  ["brooks-test", "test-guide.md"],
  ["brooks-health", "health-guide.md"],
  ["brooks-sweep", "sweep-guide.md"],
];

export function check(context) {
  const { errors, readText, sourceWord } = context;

  for (const [mode, guide] of SKILL_GUIDES) {
    const guideText = readText(`skills/${mode}/${guide}`);
    const guideLabels = extractGuideStepLabels(guideText);

    // Guard: guide must have at least 1 step
    if (guideLabels.length === 0) {
      errors.push(`skills/${mode}/${guide} has no ### Step headings — expected at least one`);
    }

    // Check for duplicate step labels within the guide
    const uniqueLabels = new Set(guideLabels);
    if (uniqueLabels.size !== guideLabels.length) {
      const duplicates = guideLabels.filter((l, i) => guideLabels.indexOf(l) !== i);
      errors.push(`skills/${mode}/${guide} has duplicate step labels: ${duplicates.join(", ")}`);
    }

    // Verify main step numbers are sequential using extracted helper
    // Derive expectedStart from the smallest step number present
    const numericBases = guideLabels
      .map(l => parseInt(l, 10))
      .filter(n => !Number.isNaN(n));
    if (numericBases.length > 0) {
      const uniqueSteps = [...new Set(numericBases)].sort((a, b) => a - b);
      const expectedStart = uniqueSteps[0];
      const seq = validateStepSequence(guideLabels, expectedStart);
      if (!seq.ok && seq.gaps && seq.gaps.length > 0) {
        const firstGap = seq.gaps[0];
        errors.push(
          `skills/${mode}/${guide} main step sequence has a gap: expected ${firstGap.expected}, found ${firstGap.found}`
        );
      }
    }

    // SKILL.md Process section must exist and have at least one numbered item
    const skillText = readText(`skills/${mode}/SKILL.md`);
    const processMatch = skillText.match(/## Process\n([\s\S]*?)(?=\n##|$)/);
    if (!processMatch) {
      errors.push(`skills/${mode}/SKILL.md has no ## Process section`);
    } else if (!/^\d+\./m.test(processMatch[1])) {
      errors.push(`skills/${mode}/SKILL.md Process section has no numbered items`);
    }

    // Guard: SKILL.md frontmatter description must reference the current book count.
    const frontmatterMatch = skillText.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      if (!frontmatter.includes(`${sourceWord} classic`)) {
        errors.push(`skills/${mode}/SKILL.md frontmatter description should reference "${sourceWord} classic engineering books" — update stale book count`);
      }
    }
  }
}
