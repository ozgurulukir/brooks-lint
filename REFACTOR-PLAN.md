# Brooks-Lint Refactoring Plan

**Current Health Score:** 84/100  
**Target Health Score:** 95–100  
**Duration estimate:** 3–4 hours of focused work  
**Risk level:** Low (all changes are internal; no public API modifications)

---

## Guiding Principles

1. **Preserve all existing behavior** — The validation suite (52 tests, 49 evals) must continue to pass unchanged
2. **Improve modularity without breaking consumers** — All file paths, CLI commands, and plugin loading remain identical
3. **Apply the Iron Law to ourselves** — Every change must follow Symptom → Source → Consequence → Remedy
4. **Incremental commits** — Each phase can be committed and validated independently

---

## Phase 1: Critical Fixes (Must Do)

### 1.1 Split `validate-repo.mjs` into Focused Modules

**Problem:** 348-line monolithic script validates everything; high cognitive load; changes to one check risk breaking unrelated checks.

**Target structure:**
```
scripts/
  validate-repo.mjs          # thin orchestrator (50 lines)
  checks/
    version-consistency.mjs  # checkVersionConsistency()
    docs-consistency.mjs     # checkReadmeIntegrity(), checkConfigExamples()
    source-inventory.mjs     # checkSourceInventory()
    framework-integrity.mjs  # checkSharedFramework(), checkSkillsContent()
    step-alignment.mjs       # checkStepAlignment()
    eval-suite.mjs           # checkEvalSuite()
    contributing.mjs         # checkContributing()
    agents-docs.mjs          # checkAgentsDocs()
    security.mjs             # checkSecurity()
    hook-output.mjs          # checkHookOutput()
```

**Implementation steps:**
1. Create `scripts/checks/` directory
2. Move each `check*()` function into its own file, preserving exact logic
3. Each module exports a single function: `export function check(context) { ... }` where `context` contains `{ errors, readText, readJson, version, sourceWord, evalCount }`
4. Replace `validate-repo.mjs` with thin orchestrator that imports and runs each check
5. Run `npm test` and `npm run validate` to confirm zero regression

---

### 1.2 Centralize Plugin Manifest Version/Description

**Problem:** Version `1.2.2` and long description duplicated across 5 files; release process error-prone.

**Solution:** Create `manifest-source.json` as single source of truth + `sync-manifests.mjs` script.

**Implementation steps:**
1. Create `manifest-source.json` at project root with `version` and `description`
2. Create `scripts/sync-manifests.mjs` that updates all plugin manifest files from source
3. Add `"sync-manifests": "node scripts/sync-manifests.mjs"` to `package.json` scripts
4. Update validation to verify manifests match `manifest-source.json` instead of `package.json`
5. Document release process: `npm run sync-manifests && git add .`

---

## Phase 2: Warning Improvements (Should Do)

### 2.1 Decouple Document Validation Checks

Move each document's validation rules into separate modules under `checks/` subdirectories (e.g., `checks/readme/checks.mjs`, `checks/changelog/checks.mjs`). Orchestrator aggregates errors.

**Benefit:** Changing CHANGELOG format only touches `checks/changelog/checks.mjs`.

---

### 2.2 Extract Step-Sequence Validation

Create `scripts/validate/step-sequence.mjs` with pure function `validateStepSequence(labels, expectedStart)`. Replace dense inline loop.

**Benefit:** Logic testable in isolation; future guide numbering changes localized.

---

### 2.3 Clarify CHANGELOG Version Parser

Rename `extractChangelogVersion` → `parseKeepAChangelogVersion` in `frontmatter.mjs`. Update all call sites and tests. Add JSDoc clarifying Keep a Changelog format.

**Benefit:** Function name communicates narrow scope; prevents misuse.

---

### 2.4 Eliminate guideMap Data Duplication

Refactor `assemble-prompt.mjs` `guideMap` from `[mode]: [dir, file]` to `[mode]: guideFilename`, computing full path via `path.join(skillsDir, mode, guideMap[mode])`.

**Benefit:** Single source of truth for mode→guide mapping.

---

### 2.5 Remove Magic Number 200 from Eval Structural Check

Either remove the `MAX_RISK_CODE_SCAN = 200` limit entirely (49 evals × ~10 references is trivial) or replace with named constant + comment explaining rationale.

**Benefit:** Future maintainers understand threshold purpose (or benefit from its removal).

---

## Phase 3: Polish & Minor Cleanups (Nice to Have)

### 3.1 Extract Ordinal Word Helper (or Drop)

Either create `scripts/_shared/text-utils.mjs` with `ordinalWord(n)` or simplify README message to use numeric "12" instead of "twelve".

**Recommendation:** Drop ordinal; fewer lines, zero maintenance.

---

### 3.2 Consolidate Circular Dependency Notation in Guide

Extract circular-dependency notation into a named example block in `architecture-guide.md` and reference it from prose.

**Benefit:** Single source of truth for notation.

---

## Testing & Validation Strategy

### Before Starting
- Ensure `git status` clean; create feature branch: `git checkout -b refactor/validate-repo-modularization`
- Baseline: `npm test && npm run validate` — both must pass

### After Each Phase
1. `npm test` — 52 unit tests
2. `npm run validate` — repository integrity checks
3. `npm run evals` — structural validation of eval suite (49 scenarios)
4. Commit if all pass

### Final Verification
- `npm run evals:live` (with `ANTHROPIC_API_KEY`) to confirm skills still produce valid reports
- Self-review: run `/brooks-review` on refactored code; target Health Score ≥ 95

---

## Decision Questions

1. **Ordinal words:** Keep "twelve" (with helper) or simplify to "12"?
2. **Release automation:** Should `sync-manifests.mjs` add a `preversion` npm hook, or document as manual step?
3. **Validation strictness:** Add check that all check modules are registered (prevent orphaned modules)?
4. **Eval warnings:** Update the 7 evals lacking risk-code references in `expected_output`, or leave as-is?

---

**Status:** Ready to execute — awaiting your direction on the four questions above.
