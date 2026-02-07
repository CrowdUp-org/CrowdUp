/**
 * Vote Repository Tests
 *
 * Tests for the vote repository with mocked Supabase client.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { voteRepository } from "../vote.repository";
import type { CreateVoteDTO } from "@/lib/domain/dtos/vote.dto";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from "@/lib/supabase";

// Mock data
const mockVoteRow = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  post_id: "123e4567-e89b-12d3-a456-426614174001",
  user_id: "123e4567-e89b-12d3-a456-426614174002",
  vote_type: "up" as const,
  created_at: "2024-01-15T10:30:00.000Z",
};

const mockCreateDTO: CreateVoteDTO = {
  postId: mockVoteRow.post_id,
  voteType: "up",
};

describe("voteRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create vote and return mapped entity", async () => {
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockVoteRow, error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await voteRepository.create(
        mockCreateDTO,
        mockVoteRow.user_id,
      );

      expect(supabase.from).toHaveBeenCalledWith("votes");
      expect(mockChain.insert).toHaveBeenCalledWith({
        post_id: mockCreateDTO.postId,
        user_id: mockVoteRow.user_id,
        vote_type: mockCreateDTO.voteType,
      });
      expect(result).toEqual({
        id: mockVoteRow.id,
        postId: mockVoteRow.post_id,
        userId: mockVoteRow.user_id,
        voteType: mockVoteRow.vote_type,
        createdAt: new Date(mockVoteRow.created_at),
      });
    });

    it("should throw error when creation fails", async () => {
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Duplicate vote" },
        }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      await expect(
        voteRepository.create(mockCreateDTO, mockVoteRow.user_id),
      ).rejects.toThrow("Failed to create vote: Duplicate vote");
    });
  });

  describe("findById", () => {
    it("should return vote when found", async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockVoteRow, error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await voteRepository.findById(mockVoteRow.id);

      expect(supabase.from).toHaveBeenCalledWith("votes");
      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockVoteRow.id);
      expect(result?.voteType).toBe("up");
    });

    it("should return null when not found", async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116", message: "Not found" },
        }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await voteRepository.findById("nonexistent-id");

      expect(result).toBeNull();
    });
  });

  describe("findByPostAndUser", () => {
    it("should return vote when found", async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi
          .fn()
          .mockResolvedValue({ data: mockVoteRow, error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await voteRepository.findByPostAndUser(
        mockVoteRow.post_id,
        mockVoteRow.user_id,
      );

      expect(supabase.from).toHaveBeenCalledWith("votes");
      expect(mockChain.eq).toHaveBeenCalledWith("post_id", mockVoteRow.post_id);
      expect(mockChain.eq).toHaveBeenCalledWith("user_id", mockVoteRow.user_id);
      expect(result).not.toBeNull();
      expect(result?.voteType).toBe("up");
    });

    it("should return null when no vote exists", async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await voteRepository.findByPostAndUser(
        "post-id",
        "user-id",
      );

      expect(result).toBeNull();
    });
  });

  describe("findByPost", () => {
    it("should return all votes for a post", async () => {
      const mockVotes = [
        mockVoteRow,
        {
          ...mockVoteRow,
          id: "vote-2",
          user_id: "user-2",
          vote_type: "down" as const,
        },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockVotes, error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await voteRepository.findByPost(mockVoteRow.post_id);

      expect(supabase.from).toHaveBeenCalledWith("votes");
      expect(mockChain.eq).toHaveBeenCalledWith("post_id", mockVoteRow.post_id);
      expect(result).toHaveLength(2);
      expect(result[0].voteType).toBe("up");
      expect(result[1].voteType).toBe("down");
    });
  });

  describe("findByUser", () => {
    it("should return votes by user with pagination", async () => {
      const mockVotes = [mockVoteRow];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockVotes, error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await voteRepository.findByUser(
        mockVoteRow.user_id,
        50,
        0,
      );

      expect(mockChain.eq).toHaveBeenCalledWith("user_id", mockVoteRow.user_id);
      expect(mockChain.range).toHaveBeenCalledWith(0, 49);
      expect(result).toHaveLength(1);
    });
  });

  describe("update", () => {
    it("should update vote type and return mapped entity", async () => {
      const updatedRow = { ...mockVoteRow, vote_type: "down" as const };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedRow, error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await voteRepository.update(mockVoteRow.id, "down");

      expect(mockChain.update).toHaveBeenCalledWith({ vote_type: "down" });
      expect(result.voteType).toBe("down");
    });

    it("should throw error when update fails", async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Update failed" },
        }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      await expect(
        voteRepository.update(mockVoteRow.id, "down"),
      ).rejects.toThrow("Failed to update vote: Update failed");
    });
  });

  describe("delete", () => {
    it("should delete vote successfully", async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      await expect(
        voteRepository.delete(mockVoteRow.id),
      ).resolves.toBeUndefined();

      expect(supabase.from).toHaveBeenCalledWith("votes");
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith("id", mockVoteRow.id);
    });

    it("should throw error when deletion fails", async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          error: { message: "Delete failed" },
        }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      await expect(voteRepository.delete(mockVoteRow.id)).rejects.toThrow(
        "Failed to delete vote: Delete failed",
      );
    });
  });

  describe("deleteByPostAndUser", () => {
    it("should delete vote by post and user", async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      // Final eq returns the promise
      mockChain.eq.mockImplementation(() => mockChain);
      mockChain.eq.mockResolvedValueOnce({ error: null });

      // Make the last call return the resolved value
      const finalMockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      finalMockChain.eq
        .mockReturnValueOnce(finalMockChain)
        .mockResolvedValueOnce({ error: null });

      (supabase.from as Mock).mockReturnValue(finalMockChain);

      await expect(
        voteRepository.deleteByPostAndUser(
          mockVoteRow.post_id,
          mockVoteRow.user_id,
        ),
      ).resolves.toBeUndefined();

      expect(supabase.from).toHaveBeenCalledWith("votes");
    });
  });

  describe("countByPost", () => {
    it("should return upvote and downvote counts", async () => {
      const mockVotes = [
        { vote_type: "up" },
        { vote_type: "up" },
        { vote_type: "up" },
        { vote_type: "down" },
        { vote_type: "down" },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockVotes, error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await voteRepository.countByPost(mockVoteRow.post_id);

      expect(result).toEqual({ upvotes: 3, downvotes: 2 });
    });

    it("should return zero counts when no votes", async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await voteRepository.countByPost("post-without-votes");

      expect(result).toEqual({ upvotes: 0, downvotes: 0 });
    });
  });

  describe("getVoteStatusesForPosts", () => {
    it("should return vote statuses map", async () => {
      const mockVotes = [
        { post_id: "post-1", vote_type: "up" },
        { post_id: "post-2", vote_type: "down" },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockVotes, error: null }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      const result = await voteRepository.getVoteStatusesForPosts("user-1", [
        "post-1",
        "post-2",
        "post-3",
      ]);

      expect(result.get("post-1")).toBe("up");
      expect(result.get("post-2")).toBe("down");
      expect(result.has("post-3")).toBe(false);
    });

    it("should return empty map when no post IDs provided", async () => {
      const result = await voteRepository.getVoteStatusesForPosts("user-1", []);

      expect(result.size).toBe(0);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("should throw error when query fails", async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Query failed" },
        }),
      };
      (supabase.from as Mock).mockReturnValue(mockChain);

      await expect(
        voteRepository.getVoteStatusesForPosts("user-1", ["post-1"]),
      ).rejects.toThrow("Failed to fetch vote statuses: Query failed");
    });
  });
});
