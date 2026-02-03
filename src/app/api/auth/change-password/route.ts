import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { verifyAccessToken } from "@/lib/jwt";
import { logger } from "@/lib/logger";

const SALT_ROUNDS = 10;

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await verifyAccessToken(accessToken);
    if (!payload?.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required" },
        { status: 400 },
      );
    }

    // Get user with password hash
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("password_hash")
      .eq("id", payload.sub)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isValid = await bcrypt.compare(
      currentPassword,
      (user as { password_hash: string }).password_hash,
    );
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    const { error: updateError } = await (supabaseAdmin.from("users") as any)
      .update({ password_hash: newPasswordHash })
      .eq("id", payload.sub);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error("Change password error", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: "An error occurred while changing password" },
      { status: 500 },
    );
  }
}
