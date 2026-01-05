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

    // Revoke refresh token in database if present
    if (refreshToken) {
      console.log("[Logout API] Revoking refresh token in database");
      const payload = await verifyRefreshToken(refreshToken);
      if (payload?.jti) {
        await supabaseAdmin
          .from("refresh_tokens")
          .delete()
          .eq("jti", payload.jti);
        console.log("[Logout API] Refresh token revoked:", payload.jti);
      }
    } else {
      console.log("[Logout API] No refresh token to revoke");
    }

    const response = NextResponse.json({ success: true }, { status: 200 });

    // Clear cookies
    const clearAccessCookie = getClearAccessTokenCookie();
    const clearRefreshCookie = getClearRefreshTokenCookie();

    console.log("[Logout API] Clearing cookies:", {
      access_token: clearAccessCookie,
      refresh_token: clearRefreshCookie,
    });

    response.cookies.set(clearAccessCookie);
    response.cookies.set(clearRefreshCookie);

    console.log("[Logout API] Logout successful");
    return response;
  } catch (error) {
    console.error("[Logout API] Logout error:", error);
    // Still clear cookies even on error
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set(getClearAccessTokenCookie());
    response.cookies.set(getClearRefreshTokenCookie());
    console.log("[Logout API] Cookies cleared despite error");
    return response;
  }
}
