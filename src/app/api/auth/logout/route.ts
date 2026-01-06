import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyRefreshToken } from "@/lib/jwt";
import {
  getClearAccessTokenCookie,
  getClearRefreshTokenCookie,
} from "@/lib/cookies";

export async function POST(request: NextRequest) {
  console.log("[Logout API] Request received");
  console.log("[Logout API] Cookies:", {
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
      console.log("[Logout API] Verifying and revoking refresh token");
      const payload = await verifyRefreshToken(refreshToken);
      if (payload?.jti) {
        const { error } = await supabaseAdmin
          .from("refresh_tokens")
          .delete()
          .eq("jti", payload.jti);

        if (error) {
          console.error(
            "[Logout API] Token revocation failed in database:",
            error,
          );
          revocationSuccess = false;
        } else {
          console.log("[Logout API] Refresh token revoked:", payload.jti);
        }
      }
    } else {
      console.log("[Logout API] No refresh token to revoke");
    }

    // If revocation failed, return error BEFORE clearing cookies
    if (!revocationSuccess) {
      console.error("[Logout API] Aborting logout: token revocation failed");
      return NextResponse.json(
        { success: false, error: "Token revocation failed" },
        { status: 500 },
      );
    }

    const response = NextResponse.json({ success: true }, { status: 200 });

    // Clear cookies only after successful revocation
    const clearAccessCookie = getClearAccessTokenCookie();
    const clearRefreshCookie = getClearRefreshTokenCookie();

    console.log("[Logout API] Clearing cookies");

    response.cookies.set(clearAccessCookie);
    response.cookies.set(clearRefreshCookie);

    console.log("[Logout API] Logout successful");
    return response;
  } catch (error) {
    console.error("[Logout API] Logout error:", error);
    // Still clear cookies even on error (fallback)
    const response = NextResponse.json(
      { success: false, error: "Logout encountered an error" },
      { status: 500 },
    );
    response.cookies.set(getClearAccessTokenCookie());
    response.cookies.set(getClearRefreshTokenCookie());
    console.log("[Logout API] Cookies cleared despite error");
    return response;
  }
}
