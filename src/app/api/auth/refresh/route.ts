import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/jwt";
import {
  getAccessTokenCookie,
  getRefreshTokenCookie,
  getClearAccessTokenCookie,
  getClearRefreshTokenCookie,
} from "@/lib/cookies";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token provided" },
        { status: 401 },
      );
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload || !payload.sub || !payload.jti) {
      const response = NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 },
      );
      response.cookies.set(getClearAccessTokenCookie());
      response.cookies.set(getClearRefreshTokenCookie());
      return response;
    }

    // Check if refresh token is still valid in database (not revoked)
    const { data: storedToken } = await supabaseAdmin
      .from("refresh_tokens")
      .select("*")
      .eq("user_id", payload.sub)
      .eq("jti", payload.jti)
      .single();

    if (!storedToken) {
      const response = NextResponse.json(
        { error: "Refresh token revoked" },
        { status: 401 },
      );
      response.cookies.set(getClearAccessTokenCookie());
      response.cookies.set(getClearRefreshTokenCookie());
      return response;
    }

    // Check expiration
    if (new Date((storedToken as { expires_at: string }).expires_at) < new Date()) {
      // Delete expired token
      await supabaseAdmin
        .from("refresh_tokens")
        .delete()
        .eq("jti", payload.jti);

      const response = NextResponse.json(
        { error: "Refresh token expired" },
        { status: 401 },
      );
      response.cookies.set(getClearAccessTokenCookie());
      response.cookies.set(getClearRefreshTokenCookie());
      return response;
    }

    // Rotate refresh token (delete old, create new)
    await supabaseAdmin
      .from("refresh_tokens")
      .delete()
      .eq("jti", payload.jti);

    const newJti = crypto.randomUUID();
    const newAccessToken = await signAccessToken(payload.sub);
    const newRefreshToken = await signRefreshToken(payload.sub, newJti);

    // Store new refresh token
    await (supabaseAdmin.from("refresh_tokens") as any).insert({
      user_id: payload.sub,
      jti: newJti,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const response = NextResponse.json({ success: true }, { status: 200 });

    // Set new httpOnly cookies
    response.cookies.set(getAccessTokenCookie(newAccessToken));
    response.cookies.set(getRefreshTokenCookie(newRefreshToken));

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "An error occurred during token refresh" },
      { status: 500 },
    );
  }
}
