/**
 * Post Validator Tests
 *
 * Tests for post-related Zod schemas.
 */

import { describe, it, expect } from 'vitest';
import {
  CreatePostSchema,
  UpdatePostSchema,
  PostListQuerySchema,
  TrendingPostsQuerySchema,
} from '../post.validator';

describe('CreatePostSchema', () => {
  const validPost = {
    type: 'Bug Report' as const,
    company: 'Acme Corp',
    companyColor: '#FF5733',
    title: 'This is a valid post title',
    description: 'This is a valid description that is at least 20 characters long.',
    appId: '550e8400-e29b-41d4-a716-446655440000',
  };

  describe('valid inputs', () => {
    it('should accept a valid post with all fields', () => {
      const result = CreatePostSchema.safeParse(validPost);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validPost);
      }
    });

    it('should accept a post without optional appId', () => {
      const { appId: _, ...postWithoutAppId } = validPost;
      const result = CreatePostSchema.safeParse(postWithoutAppId);
      expect(result.success).toBe(true);
    });

    it('should accept a post with null appId', () => {
      const postWithNullAppId = { ...validPost, appId: null };
      const result = CreatePostSchema.safeParse(postWithNullAppId);
      expect(result.success).toBe(true);
    });

    it('should accept all valid post types', () => {
      const postTypes = [
        'Bug Report',
        'Feature Request',
        'Complaint',
        'App Review Request',
      ] as const;

      for (const type of postTypes) {
        const result = CreatePostSchema.safeParse({ ...validPost, type });
        expect(result.success).toBe(true);
      }
    });

    it('should accept valid hex colors', () => {
      const validColors = ['#000000', '#FFFFFF', '#ff5733', '#ABC123'];

      for (const color of validColors) {
        const result = CreatePostSchema.safeParse({
          ...validPost,
          companyColor: color,
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('invalid inputs', () => {
    it('should reject invalid post type', () => {
      const result = CreatePostSchema.safeParse({
        ...validPost,
        type: 'Invalid Type',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty company name', () => {
      const result = CreatePostSchema.safeParse({ ...validPost, company: '' });
      expect(result.success).toBe(false);
    });

    it('should reject company name over 100 characters', () => {
      const result = CreatePostSchema.safeParse({
        ...validPost,
        company: 'A'.repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid hex color formats', () => {
      const invalidColors = ['#FFF', 'FF5733', '#GGGGGG', 'red', '#12345', '#1234567'];

      for (const color of invalidColors) {
        const result = CreatePostSchema.safeParse({
          ...validPost,
          companyColor: color,
        });
        expect(result.success).toBe(false);
      }
    });

    it('should reject title shorter than 10 characters', () => {
      const result = CreatePostSchema.safeParse({
        ...validPost,
        title: 'Short',
      });
      expect(result.success).toBe(false);
    });

    it('should reject title longer than 200 characters', () => {
      const result = CreatePostSchema.safeParse({
        ...validPost,
        title: 'A'.repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it('should reject description shorter than 20 characters', () => {
      const result = CreatePostSchema.safeParse({
        ...validPost,
        description: 'Too short',
      });
      expect(result.success).toBe(false);
    });

    it('should reject description longer than 5000 characters', () => {
      const result = CreatePostSchema.safeParse({
        ...validPost,
        description: 'A'.repeat(5001),
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID for appId', () => {
      const result = CreatePostSchema.safeParse({
        ...validPost,
        appId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing type', () => {
      const { type: _, ...post } = validPost;
      const result = CreatePostSchema.safeParse(post);
      expect(result.success).toBe(false);
    });

    it('should reject missing company', () => {
      const { company: _, ...post } = validPost;
      const result = CreatePostSchema.safeParse(post);
      expect(result.success).toBe(false);
    });

    it('should reject missing companyColor', () => {
      const { companyColor: _, ...post } = validPost;
      const result = CreatePostSchema.safeParse(post);
      expect(result.success).toBe(false);
    });

    it('should reject missing title', () => {
      const { title: _, ...post } = validPost;
      const result = CreatePostSchema.safeParse(post);
      expect(result.success).toBe(false);
    });

    it('should reject missing description', () => {
      const { description: _, ...post } = validPost;
      const result = CreatePostSchema.safeParse(post);
      expect(result.success).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should accept exactly 10 character title', () => {
      const result = CreatePostSchema.safeParse({
        ...validPost,
        title: 'A'.repeat(10),
      });
      expect(result.success).toBe(true);
    });

    it('should accept exactly 200 character title', () => {
      const result = CreatePostSchema.safeParse({
        ...validPost,
        title: 'A'.repeat(200),
      });
      expect(result.success).toBe(true);
    });

    it('should accept exactly 20 character description', () => {
      const result = CreatePostSchema.safeParse({
        ...validPost,
        description: 'A'.repeat(20),
      });
      expect(result.success).toBe(true);
    });

    it('should accept exactly 5000 character description', () => {
      const result = CreatePostSchema.safeParse({
        ...validPost,
        description: 'A'.repeat(5000),
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('UpdatePostSchema', () => {
  it('should accept partial updates', () => {
    const result = UpdatePostSchema.safeParse({
      title: 'Updated title here',
    });
    expect(result.success).toBe(true);
  });

  it('should accept empty object (no updates)', () => {
    const result = UpdatePostSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should reject invalid title length', () => {
    const result = UpdatePostSchema.safeParse({
      title: 'Short',
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid type update', () => {
    const result = UpdatePostSchema.safeParse({
      type: 'Feature Request',
    });
    expect(result.success).toBe(true);
  });
});

describe('PostListQuerySchema', () => {
  it('should accept empty query (defaults)', () => {
    const result = PostListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should coerce string page to number', () => {
    const result = PostListQuerySchema.safeParse({ page: '5' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(5);
    }
  });

  it('should reject page less than 1', () => {
    const result = PostListQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it('should reject limit over 100', () => {
    const result = PostListQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it('should accept valid sort parameters', () => {
    const result = PostListQuerySchema.safeParse({
      sortBy: 'votes',
      sortOrder: 'asc',
    });
    expect(result.success).toBe(true);
  });
});

describe('TrendingPostsQuerySchema', () => {
  it('should accept empty query (defaults)', () => {
    const result = TrendingPostsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should reject timeWindow over 720 hours', () => {
    const result = TrendingPostsQuerySchema.safeParse({ timeWindow: 721 });
    expect(result.success).toBe(false);
  });

  it('should reject limit over 50', () => {
    const result = TrendingPostsQuerySchema.safeParse({ limit: 51 });
    expect(result.success).toBe(false);
  });
});
