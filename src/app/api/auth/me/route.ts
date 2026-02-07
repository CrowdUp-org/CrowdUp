import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAccessToken } from "@/lib/jwt";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Verify access token
    const payload = await verifyAccessToken(accessToken);
    if (!payload || !payload.sub) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Fetch user data
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, username, display_name, email, avatar_url, bio, created_at")
      .eq("id", payload.sub)
      .single();

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    logger.error(
      "Get current user error",
      error instanceof Error ? error : undefined,
    );
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
