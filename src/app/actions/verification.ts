"use server";

import { supabaseAdmin } from "@/lib/supabase";

// Helper to check if user is admin
async function checkIsAdmin(userId: string) {
  if (!userId) return false;

  const { data: userData } = await (supabaseAdmin as any)
    .from("users")
    .select("is_platform_admin")
    .eq("id", userId)
    .single();

  return !!userData?.is_platform_admin;
}

export async function getPendingVerifications(adminUserId: string) {
  const isAdmin = await checkIsAdmin(adminUserId);
  if (!isAdmin) {
    throw new Error("Unauthorized");
  }

  // Fetch pending verifications with user and company details
  const { data, error } = await (supabaseAdmin as any)
    .from("company_members")
    .select(
      `
      id,
      role,
      created_at,
      verification_status,
      verification_date,
      verification_notes,
      users (
        id,
        username,
        display_name,
        email,
        avatar_url
      ),
      companies (
        id,
        name,
        display_name,
        logo_url
      )
    `,
    )
    .eq("verification_status", "pending")
    .order("verification_date", { ascending: true });

  if (error) {
    console.error("Error fetching pending verifications:", error);
    throw new Error("Failed to fetch verifications");
  }

  return data;
}

export async function approveVerification(
  adminUserId: string,
  memberId: string,
) {
  const isAdmin = await checkIsAdmin(adminUserId);
  if (!isAdmin) {
    throw new Error("Unauthorized");
  }

  const { error } = await (supabaseAdmin as any)
    .from("company_members")
    .update({
      verification_status: "approved",
      verified: true,
      verification_date: new Date().toISOString(),
    })
    .eq("id", memberId);

  if (error) {
    console.error("Error approving verification:", error);
    throw new Error("Failed to approve verification");
  }

  return { success: true };
}

export async function rejectVerification(
  adminUserId: string,
  memberId: string,
  reason: string,
) {
  const isAdmin = await checkIsAdmin(adminUserId);
  if (!isAdmin) {
    throw new Error("Unauthorized");
  }

  const { error } = await (supabaseAdmin as any)
    .from("company_members")
    .update({
      verification_status: "rejected",
      verified: false,
      verification_notes: reason,
      verification_date: new Date().toISOString(),
    })
    .eq("id", memberId);

  if (error) {
    console.error("Error rejecting verification:", error);
    throw new Error("Failed to reject verification");
  }

  return { success: true };
}
