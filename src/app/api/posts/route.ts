/**
 * Posts API Routes
 *
 * GET  /api/posts - List posts with filters
 * POST /api/posts - Create a new post
 */

import { NextRequest } from 'next/server';
import { postService } from '@/lib/application/services';
import { getUserFromRequest, getOptionalUserFromRequest } from '@/lib/api/auth';
import {
  successResponse,
  createdResponse,
  errorResponse,
} from '@/lib/api/response';

/**
 * GET /api/posts
 *
 * Retrieves posts with optional filters and pagination.
 *
 * @query limit - Max posts to return (default 20)
 * @query offset - Starting offset (default 0)
 * @query company - Filter by company name
 * @query appId - Filter by app ID
 * @query userId - Filter by author user ID
 * @query trending - If 'true', return trending posts
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);
    const company = searchParams.get('company');
    const appId = searchParams.get('appId');
    const userId = searchParams.get('userId');
    const trending = searchParams.get('trending') === 'true';

    let posts;

    if (trending) {
      posts = await postService.getTrendingPosts({ limit });
    } else if (company) {
      posts = await postService.getPostsByCompany(company, limit, offset);
    } else if (appId) {
      posts = await postService.getPostsByApp(appId, limit, offset);
    } else if (userId) {
      posts = await postService.getPostsByUser(userId, limit, offset);
    } else {
      posts = await postService.getAllPosts(limit, offset);
    }

    return successResponse(posts);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/posts
 *
 * Creates a new post. Requires authentication.
 *
 * @body title - Post title (10-200 chars)
 * @body description - Post description (20-5000 chars)
 * @body type - Post type (Bug Report, Feature Request, etc.)
 * @body company - Target company name
 * @body companyColor - Company brand color (hex)
 * @body appId - Optional linked app ID
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { userId } = await getUserFromRequest();
    const body = await request.json();

    const post = await postService.createPost(body, userId);

    return createdResponse(post);
  } catch (error) {
    return errorResponse(error);
  }
}
