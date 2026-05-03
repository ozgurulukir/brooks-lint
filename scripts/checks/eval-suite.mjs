/**
 * Check: Eval suite must have at least 49 benchmark scenarios
 */

export function check(context) {
  const { errors, evalCount } = context;

  if (evalCount < 49) {
    errors.push(`evals/evals.json should include at least 49 benchmark scenarios (found ${evalCount})`);
  }
}
