/**
 * Vote Service Tests
 *
 * Tests for vote service business logic including idempotent toggle behavior.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { voteService } from '../vote.service';
import { voteRepository } from '@/lib/infrastructure/repositories/vote.repository';
import { postRepository } from '@/lib/infrastructure/repositories/post.repository';
import { ValidationError, NotFoundError, BusinessRuleError } from '../../errors';

// Mock the repositories
vi.mock('@/lib/infrastructure/repositories/vote.repository');
vi.mock('@/lib/infrastructure/repositories/post.repository');

// Valid UUIDs for test data
const POST_ID = '123e4567-e89b-12d3-a456-426614174000';
const USER_ID = '223e4567-e89b-12d3-a456-426614174001';
const OWNER_ID = '323e4567-e89b-12d3-a456-426614174002';
const VOTE_ID = '423e4567-e89b-12d3-a456-426614174003';

describe('voteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPost = {
    id: POST_ID,
    userId: OWNER_ID,
    type: 'Bug Report' as const,
    company: 'Test Company',
    companyColor: '#FF0000',
    title: 'Test Post',
    description: 'Test description',
    votes: 0,
    appId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('toggleVote', () => {
    describe('creating a new vote', () => {
      it('should create new vote when no existing vote', async () => {
        const mockVote = {
          id: VOTE_ID,
          postId: POST_ID,
          userId: USER_ID,
          voteType: 'up' as const,
          createdAt: new Date(),
        };

        vi.mocked(postRepository.findById).mockResolvedValue(mockPost);
        vi.mocked(voteRepository.findByPostAndUser).mockResolvedValue(null);
        vi.mocked(voteRepository.create).mockResolvedValue(mockVote);
        vi.mocked(voteRepository.countByPost).mockResolvedValue({ upvotes: 1, downvotes: 0 });
        vi.mocked(postRepository.updateVoteCount).mockResolvedValue({ ...mockPost, votes: 1 });

        const result = await voteService.toggleVote(
          { postId: POST_ID, voteType: 'up' },
          USER_ID
        );

        expect(result.action).toBe('created');
        expect(result.vote).toEqual(mockVote);
        expect(result.netVotes).toBe(1);
        expect(voteRepository.create).toHaveBeenCalledWith(
          { postId: POST_ID, voteType: 'up' },
          USER_ID
        );
      });

      it('should create downvote', async () => {
        const mockVote = {
          id: VOTE_ID,
          postId: POST_ID,
          userId: USER_ID,
          voteType: 'down' as const,
          createdAt: new Date(),
        };

        vi.mocked(postRepository.findById).mockResolvedValue(mockPost);
        vi.mocked(voteRepository.findByPostAndUser).mockResolvedValue(null);
        vi.mocked(voteRepository.create).mockResolvedValue(mockVote);
        vi.mocked(voteRepository.countByPost).mockResolvedValue({ upvotes: 0, downvotes: 1 });
        vi.mocked(postRepository.updateVoteCount).mockResolvedValue({ ...mockPost, votes: -1 });

        const result = await voteService.toggleVote(
          { postId: POST_ID, voteType: 'down' },
          USER_ID
        );

        expect(result.action).toBe('created');
        expect(result.vote?.voteType).toBe('down');
        expect(result.netVotes).toBe(-1);
      });
    });

    describe('toggling off an existing vote (same type)', () => {
      it('should remove vote when clicking same vote type', async () => {
        const existingVote = {
          id: VOTE_ID,
          postId: POST_ID,
          userId: USER_ID,
          voteType: 'up' as const,
          createdAt: new Date(),
        };

        vi.mocked(postRepository.findById).mockResolvedValue({ ...mockPost, votes: 1 });
        vi.mocked(voteRepository.findByPostAndUser).mockResolvedValue(existingVote);
        vi.mocked(voteRepository.delete).mockResolvedValue(undefined);
        vi.mocked(voteRepository.countByPost).mockResolvedValue({ upvotes: 0, downvotes: 0 });
        vi.mocked(postRepository.updateVoteCount).mockResolvedValue({ ...mockPost, votes: 0 });

        const result = await voteService.toggleVote(
          { postId: POST_ID, voteType: 'up' },
          USER_ID
        );

        expect(result.action).toBe('removed');
        expect(result.vote).toBeUndefined();
        expect(result.netVotes).toBe(0);
        expect(voteRepository.delete).toHaveBeenCalledWith(VOTE_ID);
      });
    });

    describe('changing vote type', () => {
      it('should update vote when changing from up to down', async () => {
        const existingVote = {
          id: VOTE_ID,
          postId: POST_ID,
          userId: USER_ID,
          voteType: 'up' as const,
          createdAt: new Date(),
        };

        const updatedVote = {
          ...existingVote,
          voteType: 'down' as const,
        };

        vi.mocked(postRepository.findById).mockResolvedValue({ ...mockPost, votes: 1 });
        vi.mocked(voteRepository.findByPostAndUser).mockResolvedValue(existingVote);
        vi.mocked(voteRepository.update).mockResolvedValue(updatedVote);
        vi.mocked(voteRepository.countByPost).mockResolvedValue({ upvotes: 0, downvotes: 1 });
        vi.mocked(postRepository.updateVoteCount).mockResolvedValue({ ...mockPost, votes: -1 });

        const result = await voteService.toggleVote(
          { postId: POST_ID, voteType: 'down' },
          USER_ID
        );

        expect(result.action).toBe('updated');
        expect(result.vote?.voteType).toBe('down');
        expect(result.netVotes).toBe(-1);
        expect(voteRepository.update).toHaveBeenCalledWith(VOTE_ID, 'down');
      });

      it('should update vote when changing from down to up', async () => {
        const existingVote = {
          id: VOTE_ID,
          postId: POST_ID,
          userId: USER_ID,
          voteType: 'down' as const,
          createdAt: new Date(),
        };

        const updatedVote = {
          ...existingVote,
          voteType: 'up' as const,
        };

        vi.mocked(postRepository.findById).mockResolvedValue({ ...mockPost, votes: -1 });
        vi.mocked(voteRepository.findByPostAndUser).mockResolvedValue(existingVote);
        vi.mocked(voteRepository.update).mockResolvedValue(updatedVote);
        vi.mocked(voteRepository.countByPost).mockResolvedValue({ upvotes: 1, downvotes: 0 });
        vi.mocked(postRepository.updateVoteCount).mockResolvedValue({ ...mockPost, votes: 1 });

        const result = await voteService.toggleVote(
          { postId: POST_ID, voteType: 'up' },
          USER_ID
        );

        expect(result.action).toBe('updated');
        expect(result.vote?.voteType).toBe('up');
        expect(result.netVotes).toBe(1);
      });
    });

    describe('validation and business rules', () => {
      it('should throw ValidationError on invalid input - missing postId', async () => {
        await expect(
          voteService.toggleVote({ voteType: 'up' }, 'user-1')
        ).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError on invalid input - invalid voteType', async () => {
        await expect(
          voteService.toggleVote({ postId: 'post-1', voteType: 'invalid' }, 'user-1')
        ).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError on invalid postId format', async () => {
        await expect(
          voteService.toggleVote({ postId: 'not-a-uuid', voteType: 'up' }, 'user-1')
        ).rejects.toThrow(ValidationError);
      });

      it('should throw NotFoundError when post does not exist', async () => {
        vi.mocked(postRepository.findById).mockResolvedValue(null);

        await expect(
          voteService.toggleVote(
            { postId: '123e4567-e89b-12d3-a456-426614174000', voteType: 'up' },
            'user-1'
          )
        ).rejects.toThrow(NotFoundError);
      });

      it('should throw BusinessRuleError when voting on own post', async () => {
        const ownPost = { ...mockPost, userId: 'user-1' };
        vi.mocked(postRepository.findById).mockResolvedValue(ownPost);

        await expect(
          voteService.toggleVote(
            { postId: '123e4567-e89b-12d3-a456-426614174000', voteType: 'up' },
            'user-1'
          )
        ).rejects.toThrow(BusinessRuleError);
      });
    });
  });

  describe('getVoteStatus', () => {
    it('should return vote type when vote exists', async () => {
      const mockVote = {
        id: 'vote-1',
        postId: 'post-1',
        userId: 'user-1',
        voteType: 'up' as const,
        createdAt: new Date(),
      };

      vi.mocked(voteRepository.findByPostAndUser).mockResolvedValue(mockVote);

      const result = await voteService.getVoteStatus('post-1', 'user-1');

      expect(result).toBe('up');
    });

    it('should return null when no vote exists', async () => {
      vi.mocked(voteRepository.findByPostAndUser).mockResolvedValue(null);

      const result = await voteService.getVoteStatus('post-1', 'user-1');

      expect(result).toBeNull();
    });
  });

  describe('getVoteStatusesForPosts', () => {
    it('should return vote statuses for multiple posts', async () => {
      const voteMap = new Map([
        ['post-1', 'up' as const],
        ['post-2', 'down' as const],
      ]);

      vi.mocked(voteRepository.getVoteStatusesForPosts).mockResolvedValue(voteMap);

      const result = await voteService.getVoteStatusesForPosts('user-1', [
        'post-1',
        'post-2',
        'post-3',
      ]);

      expect(result.get('post-1')).toBe('up');
      expect(result.get('post-2')).toBe('down');
      expect(result.get('post-3')).toBeUndefined();
    });

    it('should return empty map for empty post list', async () => {
      const result = await voteService.getVoteStatusesForPosts('user-1', []);

      expect(result.size).toBe(0);
      expect(voteRepository.getVoteStatusesForPosts).not.toHaveBeenCalled();
    });
  });

  describe('removeVote', () => {
    it('should remove existing vote and return true', async () => {
      const existingVote = {
        id: 'vote-1',
        postId: 'post-1',
        userId: 'user-1',
        voteType: 'up' as const,
        createdAt: new Date(),
      };

      vi.mocked(voteRepository.findByPostAndUser).mockResolvedValue(existingVote);
      vi.mocked(voteRepository.delete).mockResolvedValue(undefined);
      vi.mocked(voteRepository.countByPost).mockResolvedValue({ upvotes: 0, downvotes: 0 });
      vi.mocked(postRepository.findById).mockResolvedValue(mockPost);
      vi.mocked(postRepository.updateVoteCount).mockResolvedValue(mockPost);

      const result = await voteService.removeVote('post-1', 'user-1');

      expect(result).toBe(true);
      expect(voteRepository.delete).toHaveBeenCalledWith('vote-1');
    });

    it('should return false when no vote exists', async () => {
      vi.mocked(voteRepository.findByPostAndUser).mockResolvedValue(null);

      const result = await voteService.removeVote('post-1', 'user-1');

      expect(result).toBe(false);
      expect(voteRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getVoteCounts', () => {
    it('should return vote counts for post', async () => {
      vi.mocked(postRepository.findById).mockResolvedValue(mockPost);
      vi.mocked(voteRepository.countByPost).mockResolvedValue({ upvotes: 10, downvotes: 3 });

      const result = await voteService.getVoteCounts('post-1');

      expect(result).toEqual({ upvotes: 10, downvotes: 3, net: 7 });
    });

    it('should throw NotFoundError when post does not exist', async () => {
      vi.mocked(postRepository.findById).mockResolvedValue(null);

      await expect(voteService.getVoteCounts('non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('recalculatePostVotes', () => {
    it('should recalculate and update post vote count', async () => {
      vi.mocked(voteRepository.countByPost).mockResolvedValue({ upvotes: 5, downvotes: 2 });
      vi.mocked(postRepository.findById).mockResolvedValue({ ...mockPost, votes: 0 });
      vi.mocked(postRepository.updateVoteCount).mockResolvedValue({ ...mockPost, votes: 3 });

      const result = await voteService.recalculatePostVotes('post-1');

      expect(result).toBe(3);
      expect(postRepository.updateVoteCount).toHaveBeenCalledWith('post-1', 3);
    });

    it('should not update if vote count unchanged', async () => {
      vi.mocked(voteRepository.countByPost).mockResolvedValue({ upvotes: 5, downvotes: 2 });
      vi.mocked(postRepository.findById).mockResolvedValue({ ...mockPost, votes: 3 });

      const result = await voteService.recalculatePostVotes('post-1');

      expect(result).toBe(3);
      expect(postRepository.updateVoteCount).not.toHaveBeenCalled();
    });
  });
});
