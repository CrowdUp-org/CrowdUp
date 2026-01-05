import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { getAccessTokenCookie, getRefreshTokenCookie } from "@/lib/cookies";

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/auth/signin?error=oauth_failed`,
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/auth/signin?error=no_code`,
      );
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/auth/signin?error=config_missing`,
      );
    }

    const redirectUri = `${request.nextUrl.origin}/api/auth/callback/google`;

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for tokens");
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      },
    );

    if (!userInfoResponse.ok) {
      throw new Error("Failed to get user info from Google");
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json();

    // Check if OAuth account already exists
    const { data: existingOAuthAccount } = (await supabaseAdmin
      .from("oauth_accounts")
      .select("user_id, users(*)")
      .eq("provider", "google")
      .eq("provider_user_id", googleUser.id)
      .single()) as any;

    let userId: string;

    if (existingOAuthAccount) {
      // User already exists with this Google account
      userId = existingOAuthAccount.user_id;
    } else {
      // Check if user exists with this email
      const { data: existingUser } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", googleUser.email)
        .single();

      if (existingUser) {
        // Link Google account to existing user
        userId = (existingUser as any).id;
        await (supabaseAdmin.from("oauth_accounts").insert({
          user_id: userId,
          provider: "google",
          provider_user_id: googleUser.id,
          email: googleUser.email,
        } as any) as any);
      } else {
        // Create new user
        const username = googleUser.email
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        let finalUsername = username;
        let counter = 1;

        // Ensure username is unique
        while (true) {
          const { data: existingUsername } = (await supabaseAdmin
            .from("users")
            .select("id")
            .eq("username", finalUsername)
            .single()) as any;

          if (!existingUsername) break;
          finalUsername = `${username}${counter}`;
          counter++;
        }

        const { data: newUser, error: createError } = (await supabaseAdmin
          .from("users")
          .insert({
            username: finalUsername,
            display_name: googleUser.name,
            email: googleUser.email,
            password_hash: null, // OAuth users don't have a password
            avatar_url: googleUser.picture,
          } as any)
          .select("id")
          .single()) as any;

        if (createError || !newUser) {
          throw new Error("Failed to create user");
        }

        userId = newUser.id;

        // Create OAuth account link
        (await supabaseAdmin.from("oauth_accounts").insert({
          user_id: userId,
          provider: "google",
          provider_user_id: googleUser.id,
          email: googleUser.email,
        } as any)) as any;
      }
    }

    // Get full user details
    const { data: user } = (await supabaseAdmin
      .from("users")
      .select("id, username, display_name, email, avatar_url, bio, created_at")
      .eq("id", userId)
      .single()) as any;

    if (!user) {
      throw new Error("User not found after creation");
    }

    // Generate JWT tokens
    const jti = crypto.randomUUID();
    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id, jti);

    // Store refresh token jti in database for revocation support
    await (supabaseAdmin.from("refresh_tokens") as any).upsert({
      user_id: user.id,
      jti,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Create response with redirect
    const response = NextResponse.redirect(`${request.nextUrl.origin}/`);

    // Set httpOnly cookies
    response.cookies.set(getAccessTokenCookie(accessToken));
    response.cookies.set(getRefreshTokenCookie(refreshToken));

    return response;
  } catch (error) {
    console.error("Error in Google OAuth callback:", error);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/auth/signin?error=callback_failed`,
    );
  }
}
