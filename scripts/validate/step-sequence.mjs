/**
 * Validate that step labels form a contiguous sequence.
 *
 * Given an array of step labels like ["1", "2", "3"] or ["0", "1", "2a", "2b", "3"],
 * this function extracts the numeric base of each label, deduplicates and sorts them,
 * then verifies they form an unbroken sequence starting at expectedStart.
 *
 * Sub-steps (e.g., "2a", "2b") are collapsed to their numeric base "2" before
 * sequence checking. Duplicate numeric bases are ignored (Set).
 *
 * @param {string[]} labels - Raw step labels extracted from ### Step headings
 * @param {number} expectedStart - The first expected step number (0 for architecture guide, 1 for others)
 * @returns {{ok: boolean, expected?: number, found?: number, gaps?: number[]}}
 *          ok=true if sequence is contiguous; otherwise ok=false with details
 */
export function validateStepSequence(labels, expectedStart) {
  // Extract numeric base from each label: "2a" → 2, "10" → 10, "0" → 0
  const numericBases = labels
    .map(label => parseInt(label, 10))
    .filter(num => !Number.isNaN(num));

  // Deduplicate and sort
  const uniqueSteps = [...new Set(numericBases)].sort((a, b) => a - b);

  if (uniqueSteps.length === 0) {
    return { ok: false, expected: expectedStart, found: 0, gaps: [] };
  }

  // Check for gaps
  const gaps = [];
  for (let i = 0; i < uniqueSteps.length; i++) {
    const expected = expectedStart + i;
    if (uniqueSteps[i] !== expected) {
      gaps.push({ expected, found: uniqueSteps[i] });
    }
  }

  if (gaps.length > 0) {
    const firstGap = gaps[0];
    return { ok: false, expected: firstGap.expected, found: firstGap.found, gaps };
  }

  return { ok: true };
}
