import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAccessToken } from "@/lib/jwt";
import { logger } from "@/lib/logger";

export async function PATCH(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await verifyAccessToken(accessToken);
    if (!payload?.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const data = await request.json();
    const allowedFields = ["display_name", "username", "bio", "avatar_url"];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    // If username is being changed, check if it's available
    if (updateData.username) {
      const { data: existingUser } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("username", updateData.username as string)
        .neq("id", payload.sub)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 },
        );
      }
    }

    // Update user
    const { data: updatedUser, error: updateError } = await (
      supabaseAdmin.from("users") as any
    )
      .update(updateData)
      .eq("id", payload.sub)
      .select("id, username, display_name, email, avatar_url, bio, created_at")
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 },
      );
    }

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    logger.error(
      "Update profile error",
      error instanceof Error ? error : undefined,
    );
    return NextResponse.json(
      { error: "An error occurred while updating profile" },
      { status: 500 },
    );
  }
}
