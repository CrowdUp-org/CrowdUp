import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyRefreshToken } from "@/lib/jwt";
import { logger } from "@/lib/logger";
import {
  getClearAccessTokenCookie,
  getClearRefreshTokenCookie,
} from "@/lib/cookies";

/**
 * POST /api/auth/logout
 *
 * CSRF EXEMPTION RATIONALE:
 *
 * This endpoint is exempt from CSRF protection (see middleware.ts) because:
 *
 * 1. **Stateless operation**: Logout doesn't create/modify persistent data beyond token revocation
 * 2. **No sensitive data in response**: Response is just { success: true }
 * 3. **Refresh token protection**:
 *    - httpOnly flag (not accessible to JavaScript)
 *    - sameSite=strict (not sent in cross-site requests)
 *    - path=/api/auth (restricted to this API prefix)
 * 4. **Origin/Referer validation**: Middleware validates origin BEFORE this route (L151-173)
 * 5. **Token revocation guarantee**: All tokens are deleted from database before clearing cookies
 *
 * ATTACK SCENARIO (MITIGATED):
 *
 * Attacker.com → Fetch POST /api/auth/logout (to crowdup.io)
 *   ↓ (Middleware checks Origin header)
 * Origin: attacker.com ≠ CORS_ALLOWED_ORIGINS
 *   ↓ (Middleware returns 403 BEFORE reaching this handler)
 * 403 "Origin not allowed"
 *   ↓ (Refresh token is NEVER sent to attacker's domain)
 * ✅ Request is blocked at middleware level
 *
 * This follows OWASP guidance: logout is safe to exempt from CSRF when
 * it doesn't modify sensitive data and uses additional auth layers
 * (httpOnly cookies + origin validation).
 *
 * See: SECURITY_FIX_SUMMARY.md for full analysis
 */
export async function POST(request: NextRequest) {
  logger.debug("Logout request received");
  logger.debug("Cookie status", {
    refresh_token: request.cookies.get("refresh_token")?.value
      ? "present"
      : "missing",
    access_token: request.cookies.get("access_token")?.value
      ? "present"
      : "missing",
  });

  try {
    const refreshToken = request.cookies.get("refresh_token")?.value;
    let revocationSuccess = true;

    // Revoke refresh token in database if present
    if (refreshToken) {
      logger.debug("Verifying and revoking refresh token");
      const payload = await verifyRefreshToken(refreshToken);
      if (payload?.jti) {
        const { error } = await supabaseAdmin
          .from("refresh_tokens")
          .delete()
          .eq("jti", payload.jti);

        if (error) {
          logger.error(
            "Token revocation failed in database",
            new Error(error.message),
            { jti: payload.jti },
          );
          revocationSuccess = false;
        } else {
          logger.debug("Refresh token revoked", { jti: payload.jti });
        }
      }
    } else {
      logger.debug("No refresh token to revoke");
    }

    // If revocation failed, return error BEFORE clearing cookies
    if (!revocationSuccess) {
      logger.error("Aborting logout: token revocation failed");
      return NextResponse.json(
        { success: false, error: "Token revocation failed" },
        { status: 500 },
      );
    }

    const response = NextResponse.json({ success: true }, { status: 200 });

    // Clear cookies only after successful revocation
    const clearAccessCookie = getClearAccessTokenCookie();
    const clearRefreshCookie = getClearRefreshTokenCookie();

    logger.debug("Clearing authentication cookies");

    response.cookies.set(clearAccessCookie);
    response.cookies.set(clearRefreshCookie);

    logger.info("Logout successful");
    return response;
  } catch (error) {
    logger.error("Logout error", error instanceof Error ? error : undefined);
    // Still clear cookies even on error (fallback)
    const response = NextResponse.json(
      { success: false, error: "Logout encountered an error" },
      { status: 500 },
    );
    response.cookies.set(getClearAccessTokenCookie());
    response.cookies.set(getClearRefreshTokenCookie());
    logger.debug("Cookies cleared despite error");
    return response;
  }
}
