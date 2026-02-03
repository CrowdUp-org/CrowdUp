/**
 * Votes API Route
 *
 * POST /api/votes - Toggle vote on a post
 */

import { NextRequest } from 'next/server';
import { voteService } from '@/lib/application/services';
import { getUserFromRequest } from '@/lib/api/auth';
import { successResponse, errorResponse } from '@/lib/api/response';

/**
 * POST /api/votes
 *
 * Toggles a vote on a post with idempotent behavior:
 * - No existing vote → Create new vote
 * - Same vote type → Remove vote
 * - Different vote type → Update vote
 *
 * Requires authentication.
 *
 * @body postId - Target post ID (required)
 * @body voteType - Vote type: 'up' or 'down' (required)
 *
 * @returns {action, vote?, netVotes}
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { userId } = await getUserFromRequest();
    const body = await request.json();

    const result = await voteService.toggleVote(body, userId);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
