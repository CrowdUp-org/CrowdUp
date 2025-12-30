import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { getAccessTokenCookie, getRefreshTokenCookie } from "@/lib/cookies";

const SALT_ROUNDS = 10;

export async function POST(request: NextRequest) {
  try {
    const { username, display_name, email, password } = await request.json();

    if (!username || !display_name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Check if username exists
    const { data: existingUsername } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 },
      );
    }

    // Check if email exists
    const { data: existingEmail } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 },
      );
    }

    // Hash password server-side
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const { data: newUser, error } = await (supabaseAdmin.from("users") as any)
      .insert({
        username,
        display_name,
        email,
        password_hash: passwordHash,
      })
      .select("id, username, display_name, email, avatar_url, bio, created_at")
      .single();

    if (error || !newUser) {
      return NextResponse.json(
        { error: error?.message || "Failed to create user" },
        { status: 500 },
      );
    }

    // Generate tokens
    const user = newUser as { id: string; [key: string]: unknown };
    const jti = crypto.randomUUID();
    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id, jti);

    // Store refresh token jti
    await (supabaseAdmin.from("refresh_tokens") as any).upsert({
      user_id: user.id,
      jti,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const response = NextResponse.json({ user: newUser }, { status: 201 });

    // Set httpOnly cookies
    response.cookies.set(getAccessTokenCookie(accessToken));
    response.cookies.set(getRefreshTokenCookie(refreshToken));

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An error occurred during sign up" },
      { status: 500 },
    );
  }
}
