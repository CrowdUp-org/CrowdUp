export interface User {
  id: string;
  username: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface SignUpData {
  username: string;
  display_name: string;
  email: string;
  password: string;
}

export interface SignInData {
  usernameOrEmail: string;
  password: string;
}

// In-memory cache for current user (populated by fetchCurrentUser)
let cachedUser: User | null = null;

/**
 * Get CSRF token from cookie
 * Required for all POST/PUT/PATCH/DELETE requests to API routes
 */
function getCsrfToken(): string {
  if (typeof document === "undefined") return "";

  const csrfCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="));

  return csrfCookie ? csrfCookie.split("=")[1] : "";
}

/**
 * Create headers with CSRF token for authenticated API requests
 */
function getAuthHeaders(
  additionalHeaders: Record<string, string> = {},
): Record<string, string> {
  return {
    "x-csrf-token": getCsrfToken(),
    ...additionalHeaders,
  };
}

/**
 * Sign up a new user via secure API route
 * Credentials are hashed server-side, session stored in httpOnly cookies
 */
export async function signUp(
  data: SignUpData,
): Promise<{ user: User | null; error: string | null }> {
  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { user: null, error: result.error || "Sign up failed" };
    }

    // Update cache
    cachedUser = result.user;

    // Clean up any legacy localStorage data
    cleanupLegacyStorage();

    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: "An error occurred during sign up" };
  }
}

/**
 * Sign in via secure API route
 * Password verified server-side, session stored in httpOnly cookies
 */
export async function signIn(
  data: SignInData,
): Promise<{ user: User | null; error: string | null }> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { user: null, error: result.error || "Sign in failed" };
    }

    // Update cache
    cachedUser = result.user;

    // Clean up any legacy localStorage data
    cleanupLegacyStorage();

    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: "An error occurred during sign in" };
  }
}

/**
 * Sign out via secure API route
 * Clears httpOnly cookies and revokes refresh token
 */
export async function signOut(): Promise<void> {
  console.log("[signOut] Starting logout process...");
  try {
    const csrfToken = getCsrfToken();
    console.log("[signOut] CSRF token:", csrfToken ? "present" : "missing");

    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders(),
    });

    console.log("[signOut] Logout response:", {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
    });

    if (!response.ok) {
      throw new Error(`Logout failed: ${response.statusText}`);
    }

    // Cleanup SOLO dopo che il server ha confermato il logout
    cachedUser = null;
    cleanupLegacyStorage();
    console.log("[signOut] Cleanup completed, cachedUser is now null");
  } catch (error) {
    console.error("[signOut] Logout error:", error);
    // Cleanup anche in caso di errore (fallback)
    cachedUser = null;
    cleanupLegacyStorage();
    console.log("[signOut] Fallback cleanup completed");
    throw error; // Re-throw per che il caller sappia che è fallito
  }
}

/**
 * Fetch current user from secure API route
 * Used by AuthContext for async user loading
 */
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      cachedUser = null;
      return null;
    }

    const result = await response.json();
    cachedUser = result.user;
    return result.user;
  } catch (error) {
    cachedUser = null;
    return null;
  }
}

/**
 * Refresh the access token using refresh token cookie
 * Called automatically when access token expires
 */
export async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders(),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Get cached current user (synchronous, for backward compatibility)
 * Note: Use fetchCurrentUser() for authoritative data
 */
export function getCurrentUser(): User | null {
  return cachedUser;
}

/**
 * Get cached current user ID (synchronous, for backward compatibility)
 * Note: Use fetchCurrentUser() for authoritative data
 */
export function getCurrentUserId(): string | null {
  return cachedUser?.id ?? null;
}

/**
 * Clean up legacy localStorage data from previous auth implementation
 */
function cleanupLegacyStorage(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
  } catch {
    // Ignore storage errors
  }
}

/**
 * Change password via secure API route
 * Password verification and hashing done server-side
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; error: string | null }> {
  try {
    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to change password",
      };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: "An error occurred while changing password",
    };
  }
}

/**
 * Update profile via secure API route
 */
export async function updateProfile(data: {
  display_name?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
}): Promise<{ success: boolean; error: string | null; user?: User }> {
  try {
    const response = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to update profile",
      };
    }

    // Update cache with new user data
    if (result.user) {
      cachedUser = result.user;
    }

    return { success: true, error: null, user: result.user };
  } catch (error) {
    return {
      success: false,
      error: "An error occurred while updating profile",
    };
  }
}

/**
 * Update the cached user (for use after profile updates from other sources)
 */
export function updateCachedUser(user: User): void {
  cachedUser = user;
}
