/**
 * Safe Query Utilities for Supabase/PostgREST
 *
 * These utilities help prevent SQL/PostgREST injection attacks by properly
 * escaping user input before using it in queries.
 *
 * @see https://github.com/CrowdUp-org/CrowdUp/issues/49
 */

/**
 * Characters that have special meaning in PostgREST filter syntax
 * These need to be escaped when used in user-provided values
 */
const POSTGREST_SPECIAL_CHARS = /[(),.*%\\,]/g;

/**
 * Sanitizes a string for safe use in PostgREST filter expressions
 *
 * @param input - User-provided input string
 * @returns Escaped string safe for use in PostgREST queries
 *
 * @example
 * // Prevents injection like "test%,id.eq.1" from breaking out of ilike
 * sanitizeForPostgREST("test%,id.eq.1") // Returns "test\\%\\,id\\.eq\\.1"
 */
export function sanitizeForPostgREST(input: string): string {
  if (!input) return "";
  return input.replace(POSTGREST_SPECIAL_CHARS, (char) => `\\${char}`);
}

/**
 * Builds a safe ilike OR condition for multiple fields
 *
 * @param fields - Array of column names to search
 * @param value - User-provided search value (will be sanitized)
 * @returns Safe PostgREST OR filter string
 *
 * @example
 * // Safe to use with .or()
 * const filter = buildSafeIlikeOr(['title', 'description'], userInput);
 * supabase.from('posts').select('*').or(filter);
 */
export function buildSafeIlikeOr(fields: string[], value: string): string {
  if (!value || !fields.length) return "";

  const sanitized = sanitizeForPostgREST(value.trim().toLowerCase());
  return fields.map((field) => `${field}.ilike.%${sanitized}%`).join(",");
}

/**
 * Builds a safe equality OR condition for multiple fields
 *
 * @param fields - Array of column names to match
 * @param value - User-provided value (will be sanitized)
 * @returns Safe PostgREST OR filter string
 *
 * @example
 * const filter = buildSafeEqOr(['username', 'email'], userInput);
 * supabase.from('users').select('*').or(filter);
 */
export function buildSafeEqOr(fields: string[], value: string): string {
  if (!value || !fields.length) return "";

  const sanitized = sanitizeForPostgREST(value);
  return fields.map((field) => `${field}.eq.${sanitized}`).join(",");
}

/**
 * Validates that a value is a valid UUID format
 * Use this before passing user-provided IDs to queries
 *
 * @param value - String to validate as UUID
 * @returns True if valid UUID format
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Validates and returns a UUID, or null if invalid
 * Useful for sanitizing route parameters before DB queries
 *
 * @param value - String to validate as UUID
 * @returns The UUID if valid, null otherwise
 */
export function validateUUID(value: string): string | null {
  return isValidUUID(value) ? value : null;
}

/**
 * Sanitizes a string for use in LIKE patterns (escapes SQL wildcards)
 *
 * @param input - User-provided input
 * @returns String with SQL wildcards escaped
 */
export function escapeLikePattern(input: string): string {
  if (!input) return "";
  // Escape SQL LIKE special characters: % _ \
  return input.replace(/[%_\\]/g, (char) => `\\${char}`);
}
