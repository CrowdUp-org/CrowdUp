import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      logger.warn("Google OAuth not configured");
      return NextResponse.json(
        { error: "Google OAuth is not configured" },
        { status: 500 },
      );
    }

    // Get the origin from the request
    const origin = request.nextUrl.origin;
    const redirectUri = `${origin}/api/auth/callback/google`;

    // Build Google OAuth URL
    const googleAuthUrl = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("access_type", "online");

    return NextResponse.redirect(googleAuthUrl.toString());
  } catch (error) {
    logger.error("Error initiating Google OAuth", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: "Failed to initiate Google sign-in" },
      { status: 500 },
    );
  }
}
