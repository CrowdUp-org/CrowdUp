import { describe, it, expect } from 'vitest';

import {
  sanitizeForPostgREST,
  buildSafeIlikeOr,
  buildSafeEqOr,
  isValidUUID,
  validateUUID,
  escapeLikePattern
} from '@/lib/utils/safe-query';

describe('Safe Query Utilities', () => {
  describe('sanitizeForPostgREST', () => {
    it('should return empty string for empty input', () => {
      expect(sanitizeForPostgREST('')).toBe('');
    });

    it('should return empty string for null/undefined input', () => {
      expect(sanitizeForPostgREST(null as unknown as string)).toBe('');
      expect(sanitizeForPostgREST(undefined as unknown as string)).toBe('');
    });

    it('should not modify safe strings', () => {
      expect(sanitizeForPostgREST('hello world')).toBe('hello world');
      expect(sanitizeForPostgREST('test123')).toBe('test123');
    });

    it('should escape parentheses', () => {
      expect(sanitizeForPostgREST('test(injection)')).toBe('test\\(injection\\)');
    });

    it('should escape periods', () => {
      expect(sanitizeForPostgREST('id.eq.1')).toBe('id\\.eq\\.1');
    });

    it('should escape wildcards', () => {
      expect(sanitizeForPostgREST('test*')).toBe('test\\*');
      expect(sanitizeForPostgREST('test%')).toBe('test\\%');
    });

    it('should escape commas', () => {
      expect(sanitizeForPostgREST('a,b,c')).toBe('a\\,b\\,c');
    });

    it('should escape backslashes', () => {
      expect(sanitizeForPostgREST('test\\injection')).toBe('test\\\\injection');
    });

    it('should prevent PostgREST injection attempts', () => {
      // Attempt to break out of ilike filter
      const malicious = 'test%,id.eq.1';
      const sanitized = sanitizeForPostgREST(malicious);
      expect(sanitized).toBe('test\\%\\,id\\.eq\\.1');
      expect(sanitized).not.toContain(',id.eq.');
    });

    it('should handle complex injection attempts', () => {
      const injection = "'), (select * from users where ('";
      const sanitized = sanitizeForPostgREST(injection);
      expect(sanitized).toContain('\\(');
      expect(sanitized).toContain('\\)');
      expect(sanitized).toContain('\\*');
    });
  });

  describe('buildSafeIlikeOr', () => {
    it('should return empty string for empty value', () => {
      expect(buildSafeIlikeOr(['title', 'description'], '')).toBe('');
    });

    it('should return empty string for empty fields', () => {
      expect(buildSafeIlikeOr([], 'search')).toBe('');
    });

    it('should build correct ilike filter for single field', () => {
      const result = buildSafeIlikeOr(['title'], 'test');
      expect(result).toBe('title.ilike.%test%');
    });

    it('should build correct ilike filter for multiple fields', () => {
      const result = buildSafeIlikeOr(['title', 'description'], 'test');
      expect(result).toBe('title.ilike.%test%,description.ilike.%test%');
    });

    it('should sanitize special characters in value', () => {
      const result = buildSafeIlikeOr(['title'], 'test%injection');
      expect(result).toBe('title.ilike.%test\\%injection%');
    });

    it('should trim and lowercase input', () => {
      const result = buildSafeIlikeOr(['title'], '  TEST  ');
      expect(result).toBe('title.ilike.%test%');
    });

    it('should prevent injection through field names (field names are trusted)', () => {
      // This tests that even with sanitization, the filter is correct
      const result = buildSafeIlikeOr(['title', 'description'], 'bug,id.eq.1');
      expect(result).toContain('\\,');
      expect(result).toContain('id\\.eq\\.1');
    });
  });

  describe('buildSafeEqOr', () => {
    it('should return empty string for empty value', () => {
      expect(buildSafeEqOr(['username', 'email'], '')).toBe('');
    });

    it('should return empty string for empty fields', () => {
      expect(buildSafeEqOr([], 'test')).toBe('');
    });

    it('should build correct eq filter for single field', () => {
      const result = buildSafeEqOr(['username'], 'john');
      expect(result).toBe('username.eq.john');
    });

    it('should build correct eq filter for multiple fields', () => {
      const result = buildSafeEqOr(['username', 'email'], 'john');
      expect(result).toBe('username.eq.john,email.eq.john');
    });

    it('should sanitize special characters', () => {
      const result = buildSafeEqOr(['username'], 'john.doe');
      expect(result).toBe('username.eq.john\\.doe');
    });
  });

  describe('isValidUUID', () => {
    it('should return true for valid UUIDs', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidUUID('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
      expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
    });

    it('should return false for invalid UUIDs', () => {
      expect(isValidUUID('')).toBe(false);
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false); // Too short
      expect(isValidUUID('550e8400-e29b-41d4-a716-4466554400001')).toBe(false); // Too long
      expect(isValidUUID('550e8400-e29b-41d4-a716-44665544000g')).toBe(false); // Invalid char
    });

    it('should be case insensitive', () => {
      expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
      expect(isValidUUID('550e8400-E29B-41d4-A716-446655440000')).toBe(true);
    });

    it('should reject SQL injection attempts', () => {
      expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000'; DROP TABLE users;--")).toBe(false);
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000 OR 1=1')).toBe(false);
    });
  });

  describe('validateUUID', () => {
    it('should return UUID for valid input', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      expect(validateUUID(validUUID)).toBe(validUUID);
    });

    it('should return null for invalid input', () => {
      expect(validateUUID('invalid')).toBeNull();
      expect(validateUUID('')).toBeNull();
    });
  });

  describe('escapeLikePattern', () => {
    it('should return empty string for empty input', () => {
      expect(escapeLikePattern('')).toBe('');
    });

    it('should not modify safe strings', () => {
      expect(escapeLikePattern('hello world')).toBe('hello world');
    });

    it('should escape percent signs', () => {
      expect(escapeLikePattern('100%')).toBe('100\\%');
    });

    it('should escape underscores', () => {
      expect(escapeLikePattern('hello_world')).toBe('hello\\_world');
    });

    it('should escape backslashes', () => {
      expect(escapeLikePattern('path\\to\\file')).toBe('path\\\\to\\\\file');
    });

    it('should escape all special characters together', () => {
      expect(escapeLikePattern('%_\\')).toBe('\\%\\_\\\\');
    });
  });
});
