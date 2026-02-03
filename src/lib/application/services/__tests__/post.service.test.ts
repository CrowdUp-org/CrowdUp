/**
 * Post Service Tests
 *
 * Tests for post service business logic, validation, and authorization.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { postService } from '../post.service';
import { postRepository } from '@/lib/infrastructure/repositories/post.repository';
import { ValidationError, NotFoundError, ForbiddenError, BusinessRuleError } from '../../errors';

// Mock the repository
vi.mock('@/lib/infrastructure/repositories/post.repository');

describe('postService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPost', () => {
    it('should validate and create post with valid input', async () => {
      const mockPost = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user-1',
        type: 'Bug Report' as const,
        company: 'Test Company',
        companyColor: '#FF0000',
        title: 'Test Bug Report Title',
        description: 'This is a detailed description of the bug that needs to be addressed.',
        votes: 0,
        appId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(postRepository.create).mockResolvedValue(mockPost);
      vi.mocked(postRepository.findByUser).mockResolvedValue([]);

      const result = await postService.createPost(
        {
          type: 'Bug Report',
          company: 'Test Company',
          companyColor: '#FF0000',
          title: 'Test Bug Report Title',
          description: 'This is a detailed description of the bug that needs to be addressed.',
        },
        'user-1'
      );

      expect(result).toEqual(mockPost);
      expect(postRepository.create).toHaveBeenCalledWith(
        {
          type: 'Bug Report',
          company: 'Test Company',
          companyColor: '#FF0000',
          title: 'Test Bug Report Title',
          description: 'This is a detailed description of the bug that needs to be addressed.',
        },
        'user-1'
      );
    });

    it('should throw ValidationError on invalid input - missing required fields', async () => {
      await expect(
        postService.createPost({ title: 'Short' }, 'user-1')
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError on invalid input - title too short', async () => {
      await expect(
        postService.createPost(
          {
            type: 'Bug Report',
            company: 'Test Company',
            companyColor: '#FF0000',
            title: 'Short',
            description: 'This is a detailed description of the bug that needs to be addressed.',
          },
          'user-1'
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError on invalid input - invalid hex color', async () => {
      await expect(
        postService.createPost(
          {
            type: 'Bug Report',
            company: 'Test Company',
            companyColor: 'not-a-hex-color',
            title: 'Test Bug Report Title',
            description: 'This is a detailed description of the bug that needs to be addressed.',
          },
          'user-1'
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw BusinessRuleError when rate limit exceeded', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const recentPosts = Array(10)
        .fill(null)
        .map((_, i) => ({
          id: `post-${i}`,
          userId: 'user-1',
          type: 'Bug Report' as const,
          company: 'Test Company',
          companyColor: '#FF0000',
          title: `Post ${i}`,
          description: 'Description',
          votes: 0,
          appId: null,
          createdAt: new Date(), // Today
          updatedAt: new Date(),
        }));

      vi.mocked(postRepository.findByUser).mockResolvedValue(recentPosts);

      await expect(
        postService.createPost(
          {
            type: 'Bug Report',
            company: 'Test Company',
            companyColor: '#FF0000',
            title: 'New Bug Report Title',
            description: 'This is a detailed description of the bug.',
          },
          'user-1'
        )
      ).rejects.toThrow(BusinessRuleError);
    });
  });

  describe('getPostById', () => {
    it('should return post when found', async () => {
      const mockPost = {
        id: '123',
        userId: 'user-1',
        type: 'Bug Report' as const,
        company: 'Test Company',
        companyColor: '#FF0000',
        title: 'Test Post',
        description: 'Test description',
        votes: 5,
        appId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(postRepository.findById).mockResolvedValue(mockPost);

      const result = await postService.getPostById('123');

      expect(result).toEqual(mockPost);
      expect(postRepository.findById).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundError when post does not exist', async () => {
      vi.mocked(postRepository.findById).mockResolvedValue(null);

      await expect(postService.getPostById('non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updatePost', () => {
    const existingPost = {
      id: '123',
      userId: 'user-1',
      type: 'Bug Report' as const,
      company: 'Test Company',
      companyColor: '#FF0000',
      title: 'Original Title',
      description: 'Original description that is long enough',
      votes: 5,
      appId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update post when user is owner', async () => {
      const updatedPost = { ...existingPost, title: 'Updated Title That Is Long Enough' };

      vi.mocked(postRepository.findById).mockResolvedValue(existingPost);
      vi.mocked(postRepository.update).mockResolvedValue(updatedPost);

      const result = await postService.updatePost(
        '123',
        { title: 'Updated Title That Is Long Enough' },
        'user-1'
      );

      expect(result.title).toBe('Updated Title That Is Long Enough');
      expect(postRepository.update).toHaveBeenCalledWith('123', {
        title: 'Updated Title That Is Long Enough',
      });
    });

    it('should throw ForbiddenError when user is not owner', async () => {
      vi.mocked(postRepository.findById).mockResolvedValue(existingPost);

      await expect(
        postService.updatePost(
          '123',
          { title: 'Updated Title That Is Long Enough' },
          'different-user'
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw NotFoundError when post does not exist', async () => {
      vi.mocked(postRepository.findById).mockResolvedValue(null);

      await expect(
        postService.updatePost(
          'non-existent',
          { title: 'Updated Title That Is Long Enough' },
          'user-1'
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError on invalid update data', async () => {
      vi.mocked(postRepository.findById).mockResolvedValue(existingPost);

      await expect(
        postService.updatePost('123', { title: 'Short' }, 'user-1')
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('deletePost', () => {
    const existingPost = {
      id: '123',
      userId: 'user-1',
      type: 'Bug Report' as const,
      company: 'Test Company',
      companyColor: '#FF0000',
      title: 'Test Post',
      description: 'Test description',
      votes: 5,
      appId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should delete post when user is owner', async () => {
      vi.mocked(postRepository.findById).mockResolvedValue(existingPost);
      vi.mocked(postRepository.delete).mockResolvedValue(undefined);

      await postService.deletePost('123', 'user-1');

      expect(postRepository.delete).toHaveBeenCalledWith('123');
    });

    it('should delete post when user is admin', async () => {
      vi.mocked(postRepository.findById).mockResolvedValue(existingPost);
      vi.mocked(postRepository.delete).mockResolvedValue(undefined);

      await postService.deletePost('123', 'different-user', true);

      expect(postRepository.delete).toHaveBeenCalledWith('123');
    });

    it('should throw ForbiddenError when user is not owner and not admin', async () => {
      vi.mocked(postRepository.findById).mockResolvedValue(existingPost);

      await expect(
        postService.deletePost('123', 'different-user', false)
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw NotFoundError when post does not exist', async () => {
      vi.mocked(postRepository.findById).mockResolvedValue(null);

      await expect(postService.deletePost('non-existent', 'user-1')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('getTrendingPosts', () => {
    it('should return trending posts with default limit', async () => {
      const mockPosts = [
        {
          id: '1',
          userId: 'user-1',
          type: 'Bug Report' as const,
          company: 'Company A',
          companyColor: '#FF0000',
          title: 'Popular Post',
          description: 'Description',
          votes: 100,
          appId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(postRepository.findTrending).mockResolvedValue(mockPosts);

      const result = await postService.getTrendingPosts();

      expect(result).toEqual(mockPosts);
      expect(postRepository.findTrending).toHaveBeenCalledWith(10);
    });

    it('should accept custom limit', async () => {
      vi.mocked(postRepository.findTrending).mockResolvedValue([]);

      await postService.getTrendingPosts({ limit: 5 });

      expect(postRepository.findTrending).toHaveBeenCalledWith(5);
    });

    it('should throw ValidationError on invalid query', async () => {
      await expect(
        postService.getTrendingPosts({ limit: 'invalid' })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getPostsByUser', () => {
    it('should return posts for user', async () => {
      const mockPosts = [
        {
          id: '1',
          userId: 'user-1',
          type: 'Bug Report' as const,
          company: 'Company A',
          companyColor: '#FF0000',
          title: 'User Post',
          description: 'Description',
          votes: 10,
          appId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(postRepository.findByUser).mockResolvedValue(mockPosts);

      const result = await postService.getPostsByUser('user-1');

      expect(result).toEqual(mockPosts);
      expect(postRepository.findByUser).toHaveBeenCalledWith('user-1', 20, 0);
    });

    it('should accept pagination parameters', async () => {
      vi.mocked(postRepository.findByUser).mockResolvedValue([]);

      await postService.getPostsByUser('user-1', 10, 5);

      expect(postRepository.findByUser).toHaveBeenCalledWith('user-1', 10, 5);
    });
  });
});
