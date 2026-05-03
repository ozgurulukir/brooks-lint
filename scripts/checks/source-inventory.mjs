/**
 * Check: source-coverage.md must have valid frontmatter and include all book sections
 */

import { countBookSections } from "../frontmatter.mjs";

export function check(context) {
  const { errors, books, sourceCoverage, readText } = context;

  if (!books || books.length === 0) {
    errors.push("skills/_shared/source-coverage.md must have a books: frontmatter list");
    return;
  }

  for (const title of books) {
    if (!sourceCoverage.includes(`*${title}*`)) {
      errors.push(`skills/_shared/source-coverage.md should include a section for ${title}`);
    }
  }

  // Verify frontmatter book count matches actual book sections in the document.
  const bookSections = countBookSections(sourceCoverage);
  if (bookSections !== books.length) {
    errors.push(
      `skills/_shared/source-coverage.md frontmatter lists ${books.length} books but has ${bookSections} book sections (## Author — *Title*)`
    );
  }
}
