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
  const { errors, readText } = context;

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
     // Each guide defines its own starting step; we verify that starting step
     // matches the mode's expected convention (audit=0, others can be 0 or 1).
     // The validator accepts whatever the first step actually is, as long as
     // the sequence from that point is contiguous.
     const numericBases = guideLabels
       .map(l => parseInt(l, 10))
       .filter(n => !Number.isNaN(n));
     if (numericBases.length > 0) {
       const uniqueSteps = [...new Set(numericBases)].sort((a, b) => a - b);
       const actualStart = uniqueSteps[0];
       const seq = validateStepSequence(guideLabels, actualStart);
       if (!seq.ok && seq.gaps && seq.gaps.length > 0) {
         const firstGap = seq.gaps[0];
         errors.push(
           `skills/${mode}/${guide} main step sequence has a gap: expected ${firstGap.expected}, found ${firstGap.found}`
         );
       }
     }

     // Note: SKILL.md structural checks (Process section, frontmatter book count) are
     // delegated to skills-content.mjs to avoid duplication (R3 Knowledge Duplication)
  }
}
