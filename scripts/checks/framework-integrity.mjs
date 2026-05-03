/**
 * Check: Shared framework files must be present and well-formed
 */

import {
  countProductionRisks,
  countTestRisks,
  PRODUCTION_RISK_COUNT,
  TEST_RISK_COUNT,
} from "../frontmatter.mjs";

export function check(context) {
  const { errors, readText, sourceWord } = context;

  const commonMd = readText("skills/_shared/common.md");
  if (!commonMd.includes("source-coverage.md")) {
    errors.push("skills/_shared/common.md should reference source-coverage.md");
  }

  const testDecayRisks = readText("skills/_shared/test-decay-risks.md");
  if (!testDecayRisks.includes("## Risk T3: Test Duplication")) {
    errors.push("T3 definition missing from test-decay-risks.md");
  }
  if (!testDecayRisks.includes("## Risk T5: Coverage Illusion")) {
    errors.push("T5 definition missing from test-decay-risks.md");
  }
  if (!testDecayRisks.includes("### What Not to Flag")) {
    errors.push("skills/_shared/test-decay-risks.md should include false-positive guidance");
  }

  const decayRisks = readText("skills/_shared/decay-risks.md");
  if (!decayRisks.includes("### What Not to Flag")) {
    errors.push("skills/_shared/decay-risks.md should include false-positive guidance");
  }

  const productionRisks = countProductionRisks(decayRisks);
  if (productionRisks !== PRODUCTION_RISK_COUNT) {
    errors.push(`skills/_shared/decay-risks.md should define exactly ${PRODUCTION_RISK_COUNT} risks (found ${productionRisks})`);
  }

  const testRisks = countTestRisks(testDecayRisks);
  if (testRisks !== TEST_RISK_COUNT) {
    errors.push(`skills/_shared/test-decay-risks.md should define exactly ${TEST_RISK_COUNT} test risks (found ${testRisks})`);
  }
}
