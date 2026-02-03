/**
 * Post Repository Tests
 *
 * Tests for the post repository with mocked Supabase client.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { postRepository } from '../post.repository';
import type { CreatePostDTO, UpdatePostDTO } from '@/lib/domain/dtos/post.dto';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';

// Mock data
const mockPostRow = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  user_id: '123e4567-e89b-12d3-a456-426614174001',
  type: 'Bug Report' as const,
  company: 'Test Company',
  company_color: '#FF5733',
  title: 'Test Post Title',
  description: 'This is a test post description that is long enough.',
  votes: 10,
  app_id: null,
  created_at: '2024-01-15T10:30:00.000Z',
  updated_at: '2024-01-15T10:30:00.000Z',
};

const mockCreateDTO: CreatePostDTO = {
  type: 'Bug Report',
  company: 'Test Company',
  companyColor: '#FF5733',
  title: 'Test Post Title',
  description: 'This is a test post description that is long enough.',
};

const mockUpdateDTO: UpdatePostDTO = {
  title: 'Updated Title',
  description: 'Updated description that is also long enough.',
};

describe('postRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create post and return mapped entity', async () => {
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPostRow, error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await postRepository.create(mockCreateDTO, mockPostRow.user_id);

      expect(supabase.from).toHaveBeenCalledWith('posts');
      expect(mockChain.insert).toHaveBeenCalledWith({
        user_id: mockPostRow.user_id,
        type: mockCreateDTO.type,
        company: mockCreateDTO.company,
        company_color: mockCreateDTO.companyColor,
        title: mockCreateDTO.title,
        description: mockCreateDTO.description,
        app_id: null,
      });
      expect(result).toEqual({
        id: mockPostRow.id,
        userId: mockPostRow.user_id,
        type: mockPostRow.type,
        company: mockPostRow.company,
        companyColor: mockPostRow.company_color,
        title: mockPostRow.title,
        description: mockPostRow.description,
        votes: mockPostRow.votes,
        appId: mockPostRow.app_id,
        createdAt: new Date(mockPostRow.created_at),
        updatedAt: new Date(mockPostRow.updated_at),
      });
    });

    it('should throw error when creation fails', async () => {
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' },
        }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      await expect(
        postRepository.create(mockCreateDTO, mockPostRow.user_id)
      ).rejects.toThrow('Failed to create post: Insert failed');
    });
  });

  describe('findById', () => {
    it('should return post when found', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPostRow, error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await postRepository.findById(mockPostRow.id);

      expect(supabase.from).toHaveBeenCalledWith('posts');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.eq).toHaveBeenCalledWith('id', mockPostRow.id);
      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockPostRow.id);
    });

    it('should return null when not found', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await postRepository.findById('nonexistent-id');

      expect(result).toBeNull();
    });

    it('should throw error for other errors', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'OTHER', message: 'Database error' },
        }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      await expect(postRepository.findById('some-id')).rejects.toThrow(
        'Failed to fetch post: Database error'
      );
    });
  });

  describe('update', () => {
    it('should update post and return mapped entity', async () => {
      const updatedRow = {
        ...mockPostRow,
        title: mockUpdateDTO.title!,
        description: mockUpdateDTO.description!,
      };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedRow, error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await postRepository.update(mockPostRow.id, mockUpdateDTO);

      expect(supabase.from).toHaveBeenCalledWith('posts');
      expect(mockChain.update).toHaveBeenCalledWith({
        title: mockUpdateDTO.title,
        description: mockUpdateDTO.description,
      });
      expect(result.title).toBe(mockUpdateDTO.title);
      expect(result.description).toBe(mockUpdateDTO.description);
    });

    it('should throw error when update fails', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Update failed' },
        }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      await expect(
        postRepository.update(mockPostRow.id, mockUpdateDTO)
      ).rejects.toThrow('Failed to update post: Update failed');
    });
  });

  describe('delete', () => {
    it('should delete post successfully', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      await expect(postRepository.delete(mockPostRow.id)).resolves.toBeUndefined();

      expect(supabase.from).toHaveBeenCalledWith('posts');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', mockPostRow.id);
    });

    it('should throw error when deletion fails', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          error: { message: 'Delete failed' },
        }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      await expect(postRepository.delete(mockPostRow.id)).rejects.toThrow(
        'Failed to delete post: Delete failed'
      );
    });
  });

  describe('findByUser', () => {
    it('should return posts for user with pagination', async () => {
      const mockPosts = [mockPostRow, { ...mockPostRow, id: 'another-id' }];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockPosts, error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await postRepository.findByUser(mockPostRow.user_id, 20, 0);

      expect(supabase.from).toHaveBeenCalledWith('posts');
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', mockPostRow.user_id);
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockChain.range).toHaveBeenCalledWith(0, 19);
      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe(mockPostRow.user_id);
    });

    it('should throw error when query fails', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Query failed' },
        }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      await expect(
        postRepository.findByUser(mockPostRow.user_id)
      ).rejects.toThrow('Failed to fetch user posts: Query failed');
    });
  });

  describe('findByCompany', () => {
    it('should return posts for company', async () => {
      const mockPosts = [mockPostRow];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockPosts, error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await postRepository.findByCompany('Test Company');

      expect(mockChain.eq).toHaveBeenCalledWith('company', 'Test Company');
      expect(result).toHaveLength(1);
      expect(result[0].company).toBe('Test Company');
    });
  });

  describe('findByApp', () => {
    it('should return posts for app', async () => {
      const appId = 'app-123';
      const postWithApp = { ...mockPostRow, app_id: appId };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: [postWithApp], error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await postRepository.findByApp(appId);

      expect(mockChain.eq).toHaveBeenCalledWith('app_id', appId);
      expect(result).toHaveLength(1);
      expect(result[0].appId).toBe(appId);
    });
  });

  describe('findAll', () => {
    it('should return all posts with pagination', async () => {
      const mockPosts = [mockPostRow];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockPosts, error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await postRepository.findAll(10, 5);

      expect(mockChain.range).toHaveBeenCalledWith(5, 14);
      expect(result).toHaveLength(1);
    });
  });

  describe('findTrending', () => {
    it('should return trending posts sorted by votes', async () => {
      const trendingPosts = [
        { ...mockPostRow, votes: 100 },
        { ...mockPostRow, id: 'post-2', votes: 50 },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: trendingPosts, error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await postRepository.findTrending(5);

      expect(mockChain.order).toHaveBeenCalledWith('votes', { ascending: false });
      expect(mockChain.limit).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(2);
      expect(result[0].votes).toBe(100);
    });
  });

  describe('updateVoteCount', () => {
    it('should increment vote count', async () => {
      const fetchChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { votes: 10 }, error: null }),
      };

      const updatedRow = { ...mockPostRow, votes: 11 };
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedRow, error: null }),
      };

      let callCount = 0;
      (supabase.from as Mock).mockImplementation(() => {
        callCount++;
        return callCount === 1 ? fetchChain : updateChain;
      });

      const result = await postRepository.updateVoteCount(mockPostRow.id, 1);

      expect(updateChain.update).toHaveBeenCalledWith({ votes: 11 });
      expect(result.votes).toBe(11);
    });

    it('should decrement vote count', async () => {
      const fetchChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { votes: 10 }, error: null }),
      };

      const updatedRow = { ...mockPostRow, votes: 9 };
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedRow, error: null }),
      };

      let callCount = 0;
      (supabase.from as Mock).mockImplementation(() => {
        callCount++;
        return callCount === 1 ? fetchChain : updateChain;
      });

      const result = await postRepository.updateVoteCount(mockPostRow.id, -1);

      expect(updateChain.update).toHaveBeenCalledWith({ votes: 9 });
      expect(result.votes).toBe(9);
    });
  });
});
