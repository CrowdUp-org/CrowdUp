# API Documentation

## Overview

CrowdUp API provides endpoints for authentication, user management, posts, voting, comments, and profiles. The API follows RESTful conventions and returns JSON responses.

### Base URL

```
https://api.crowdup.com/v1
```

### Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Authentication Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### POST /auth/login

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John"
  }
}
```

### POST /auth/logout

Logout user and invalidate token.

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

### POST /auth/refresh

Refresh JWT token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200 OK):**
```json
{
  "token": "new_jwt_token_here"
}
```

---

## User Endpoints

### GET /users/:userId

Retrieve user profile by ID.

**Parameters:**
- `userId` (path): User ID

**Response (200 OK):**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Software developer",
  "avatar": "https://...",
  "createdAt": "2024-01-15T10:30:00Z",
  "postsCount": 5,
  "followersCount": 42
}
```

### PUT /users/:userId

Update user profile (authenticated user only).

**Request Body:**
```json
{
  "firstName": "Jonathan",
  "bio": "Full-stack developer",
  "avatar": "https://..."
}
```

**Response (200 OK):**
Same as GET /users/:userId

### GET /users/:userId/posts

Get all posts by a user.

**Query Parameters:**
- `limit` (optional): Number of posts to return (default: 10)
- `offset` (optional): Number of posts to skip (default: 0)

**Response (200 OK):**
```json
{
  "posts": [...],
  "total": 5,
  "limit": 10,
  "offset": 0
}
```

---

## Post Endpoints

### POST /posts

Create a new post (authenticated users only).

**Request Body:**
```json
{
  "title": "My First Post",
  "content": "This is the content of my post",
  "tags": ["programming", "tutorial"]
}
```

**Response (201 Created):**
```json
{
  "id": "post_456",
  "title": "My First Post",
  "content": "This is the content of my post",
  "authorId": "user_123",
  "tags": ["programming", "tutorial"],
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z",
  "votesCount": 0,
  "commentsCount": 0
}
```

### GET /posts/:postId

Retrieve a single post with comments.

**Response (200 OK):**
```json
{
  "id": "post_456",
  "title": "My First Post",
  "content": "This is the content of my post",
  "author": {
    "id": "user_123",
    "firstName": "John",
    "avatar": "https://..."
  },
  "tags": ["programming", "tutorial"],
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z",
  "votesCount": 12,
  "commentsCount": 3,
  "comments": [...]
}
```

### PUT /posts/:postId

Update a post (author only).

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "tags": ["programming"]
}
```

**Response (200 OK):**
Updated post object

### DELETE /posts/:postId

Delete a post (author only).

**Response (204 No Content)**

### GET /posts

List all posts with filtering and pagination.

**Query Parameters:**
- `limit` (optional): Number of posts (default: 10, max: 100)
- `offset` (optional): Number of posts to skip (default: 0)
- `tag` (optional): Filter by tag
- `sort` (optional): Sort by 'recent', 'popular', 'trending' (default: 'recent')

**Response (200 OK):**
```json
{
  "posts": [...],
  "total": 150,
  "limit": 10,
  "offset": 0
}
```

---

## Voting Endpoints

### POST /posts/:postId/votes

Vote on a post (upvote or downvote).

**Request Body:**
```json
{
  "voteType": "upvote"
}
```

Valid values: `upvote`, `downvote`, `neutral`

**Response (201 Created):**
```json
{
  "postId": "post_456",
  "userId": "user_123",
  "voteType": "upvote",
  "createdAt": "2024-01-15T11:05:00Z"
}
```

### DELETE /posts/:postId/votes

Remove vote from a post.

**Response (204 No Content)**

---

## Comment Endpoints

### POST /posts/:postId/comments

Create a comment on a post.

**Request Body:**
```json
{
  "content": "Great post! Very helpful."
}
```

**Response (201 Created):**
```json
{
  "id": "comment_789",
  "postId": "post_456",
  "authorId": "user_123",
  "content": "Great post! Very helpful.",
  "createdAt": "2024-01-15T11:10:00Z",
  "votesCount": 0
}
```

### PUT /comments/:commentId

Update a comment (author only).

**Request Body:**
```json
{
  "content": "Updated comment"
}
```

**Response (200 OK):**
Updated comment object

### DELETE /comments/:commentId

Delete a comment (author only).

**Response (204 No Content)**

### POST /comments/:commentId/votes

Vote on a comment.

**Request Body:**
```json
{
  "voteType": "upvote"
}
```

**Response (201 Created):**
Vote object

---

## Search Endpoints

### GET /search

Search posts and users.

**Query Parameters:**
- `q` (required): Search query
- `type` (optional): 'posts', 'users', 'all' (default: 'all')
- `limit` (optional): Results per category (default: 10)

**Response (200 OK):**
```json
{
  "posts": [...],
  "users": [...]
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid request parameters",
  "details": {
    "email": "Email is required"
  }
}
```

### 401 Unauthorized

```json
{
  "error": "Authentication required",
  "message": "Please provide a valid token"
}
```

### 403 Forbidden

```json
{
  "error": "Access denied",
  "message": "You don't have permission to perform this action"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found",
  "message": "The requested post could not be found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "Something went wrong. Please try again later."
}
```

---

## Rate Limiting

API requests are rate limited to:
- **Authenticated users**: 1000 requests per hour
- **Anonymous users**: 100 requests per hour

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Pagination

Most list endpoints support pagination using `limit` and `offset` parameters:

```
GET /posts?limit=20&offset=40
```

Response includes:
- `limit`: Number of items returned
- `offset`: Number of items skipped
- `total`: Total number of items available

---

## Webhooks

### Webhook Events

- `post.created`: When a new post is created
- `post.updated`: When a post is updated
- `post.deleted`: When a post is deleted
- `comment.created`: When a new comment is created
- `user.registered`: When a new user registers

### Webhook Payload

```json
{
  "event": "post.created",
  "timestamp": "2024-01-15T11:00:00Z",
  "data": {
    "id": "post_456",
    "title": "My First Post",
    "authorId": "user_123"
  }
}
```

---

## References

- [SETUP.md](./SETUP.md) - Local setup instructions
- [FEATURES.md](./FEATURES.md) - Feature documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guides
