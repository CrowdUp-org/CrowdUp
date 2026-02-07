/**
 * Single Post API Routes
 *
 * GET    /api/posts/[id] - Get post by ID
 * PUT    /api/posts/[id] - Update post
 * DELETE /api/posts/[id] - Delete post
 */

import { NextRequest } from "next/server";
import { postService } from "@/lib/application/services";
import { getUserFromRequest } from "@/lib/api/auth";
import {
  successResponse,
  noContentResponse,
  errorResponse,
} from "@/lib/api/response";

/**
 * Route context with dynamic params.
 */
interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/posts/[id]
 *
 * Retrieves a single post by ID.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  try {
    const { id } = await context.params;
    const post = await postService.getPostById(id);
    return successResponse(post);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PUT /api/posts/[id]
 *
 * Updates an existing post. Requires authentication and ownership.
 *
 * @body title - Updated title (optional)
 * @body description - Updated description (optional)
 * @body type - Updated type (optional)
 * @body company - Updated company (optional)
 * @body companyColor - Updated company color (optional)
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  try {
    const { id } = await context.params;
    const { userId } = await getUserFromRequest();
    const body = await request.json();

    const post = await postService.updatePost(id, body, userId);
    return successResponse(post);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/posts/[id]
 *
 * Deletes a post. Requires authentication and ownership (or admin).
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  try {
    const { id } = await context.params;
    const { userId } = await getUserFromRequest();

    // TODO: Add admin check from user service
    const isAdmin = false;

    await postService.deletePost(id, userId, isAdmin);
    return noContentResponse();
  } catch (error) {
    return errorResponse(error);
  }
}
