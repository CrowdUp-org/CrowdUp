import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import {
  getAccessTokenCookie,
  getRefreshTokenCookie,
} from "@/lib/cookies";

export async function POST(request: NextRequest) {
  try {
    const { usernameOrEmail, password } = await request.json();

    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { error: "Username/email and password are required" },
        { status: 400 },
      );
    }

    // Find user by username or email using server-side admin client
    const { data: users, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("*")
      .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`)
      .limit(1);

    if (fetchError || !users || users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = users[0] as { id: string; password_hash: string; [key: string]: unknown };

    // Verify password server-side
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate tokens
    const jti = crypto.randomUUID();
    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id, jti);

    // Store refresh token jti in database for revocation support
    await (supabaseAdmin.from("refresh_tokens") as any).upsert({
      user_id: user.id,
      jti,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Remove sensitive fields from response
    const { password_hash: _, ...safeUser } = user;

    const response = NextResponse.json({ user: safeUser }, { status: 200 });

    // Set httpOnly cookies
    response.cookies.set(getAccessTokenCookie(accessToken));
    response.cookies.set(getRefreshTokenCookie(refreshToken));

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during sign in" },
      { status: 500 },
    );
  }
}
