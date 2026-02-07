/**
 * Comments API Routes
 *
 * GET  /api/comments - List comments for a post
 * POST /api/comments - Create a new comment
 */

import { NextRequest } from "next/server";
import { commentService } from "@/lib/application/services";
import { getUserFromRequest } from "@/lib/api/auth";
import {
  successResponse,
  createdResponse,
  errorResponse,
  badRequestResponse,
} from "@/lib/api/response";

/**
 * GET /api/comments
 *
 * Retrieves comments for a specific post.
 *
 * @query postId - Target post ID (required)
 * @query limit - Max comments to return (default 50)
 * @query offset - Starting offset (default 0)
 * @query ascending - Sort order (default 'true' - oldest first)
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get("postId");

    if (!postId) {
      return badRequestResponse("postId is required");
    }

    const limit = parseInt(searchParams.get("limit") ?? "50", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);
    const ascending = searchParams.get("ascending") !== "false";

    const comments = await commentService.getCommentsByPost(
      postId,
      limit,
      offset,
      ascending,
    );

    const total = await commentService.getCommentCount(postId);

    return successResponse({ comments, total });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/comments
 *
 * Creates a new comment. Requires authentication.
 *
 * @body postId - Target post ID (required)
 * @body content - Comment content (1-2000 chars)
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { userId } = await getUserFromRequest();
    const body = await request.json();

    const comment = await commentService.createComment(body, userId);

    return createdResponse(comment);
  } catch (error) {
    return errorResponse(error);
  }
}
