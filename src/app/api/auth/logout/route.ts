import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyRefreshToken } from "@/lib/jwt";
import {
  getClearAccessTokenCookie,
  getClearRefreshTokenCookie,
} from "@/lib/cookies";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refresh_token")?.value;

    // Revoke refresh token in database if present
    if (refreshToken) {
      const payload = await verifyRefreshToken(refreshToken);
      if (payload?.jti) {
        await supabaseAdmin
          .from("refresh_tokens")
          .delete()
          .eq("jti", payload.jti);
      }
    }

    const response = NextResponse.json({ success: true }, { status: 200 });

    // Clear cookies
    response.cookies.set(getClearAccessTokenCookie());
    response.cookies.set(getClearRefreshTokenCookie());

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear cookies even on error
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set(getClearAccessTokenCookie());
    response.cookies.set(getClearRefreshTokenCookie());
    return response;
  }
}
