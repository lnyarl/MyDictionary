/**
 * Extract search term from query string
 * Trims whitespace and returns empty string if invalid
 */
export function normalizeSearchTerm(term: string | undefined): string {
  if (!term || typeof term !== "string") {
    return "";
  }
  return term.trim();
}
