"use client";

import { supabase } from "@/lib/supabase";
import { createNotification } from "@/lib/services/notifications.service";
import bcrypt from "bcryptjs";
import type { Json } from "@/lib/database.types";

const SALT_ROUNDS = 10;

/**
 * Verification document structure
 */
export interface VerificationDocuments {
  businessEmail?: string;
  roleDescription?: string;
  additionalNotes?: string;
  submittedAt: string;
}

/**
 * Verification request with user and company info
 */
export interface VerificationRequest {
  id: string;
  company_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  verified: boolean;
  verification_status: "pending" | "approved" | "rejected" | null;
  verification_date: string | null;
  verification_documents: VerificationDocuments | null;
  verification_notes: string | null;
  created_at: string;
  user?: {
    id: string;
    username: string;
    display_name: string;
    email: string;
    avatar_url: string | null;
  };
  company?: {
    id: string;
    name: string;
    display_name: string;
    logo_url: string | null;
  };
}

/**
 * Submit a verification request
 */
export async function requestVerification(
  userId: string,
  companyId: string,
  documents: Omit<VerificationDocuments, "submittedAt">,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user is a member of the company
    const { data: membership, error: memberError } = await supabase
      .from("company_members")
      .select("id, verification_status, verification_rejected_at")
      .eq("user_id", userId)
      .eq("company_id", companyId)
      .single();

    if (memberError || !membership) {
      return {
        success: false,
        error: "You must be a member of this company to request verification",
      };
    }

    // Check if already pending
    if ((membership as any).verification_status === "pending") {
      return {
        success: false,
        error: "A verification request is already pending",
      };
    }

    // Check cooldown for rejected requests (7 days)
    if (
      (membership as any).verification_status === "rejected" &&
      (membership as any).verification_rejected_at
    ) {
      const rejectedAt = new Date((membership as any).verification_rejected_at);
      const daysSince =
        (Date.now() - rejectedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        const daysRemaining = Math.ceil(7 - daysSince);
        return {
          success: false,
          error: `Please wait ${daysRemaining} more day(s) before resubmitting`,
        };
      }
    }

    if (memberError || !membership) {
      return {
        success: false,
        error: "You must be a member of this company to request verification",
      };
    }

    // Check if already verified or pending
    if ((membership as any).verification_status === "pending") {
      return {
        success: false,
        error: "A verification request is already pending",
      };
    }

    // Submit verification request
    const verificationDocs: VerificationDocuments = {
      ...documents,
      submittedAt: new Date().toISOString(),
    };

    const { error: updateError } = (await (
      supabase.from("company_members") as any
    )
      .update({
        verification_status: "pending",
        verification_documents: verificationDocs as unknown as Json,
      })
      .eq("id", (membership as any).id)) as any;

    if (updateError) {
      console.error("Verification request error:", updateError);
      return { success: false, error: "Failed to submit verification request" };
    }

    return { success: true };
  } catch (error) {
    console.error("Verification request error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get verification status for a user in a company
 */
export async function getVerificationStatus(
  userId: string,
  companyId: string,
): Promise<{
  verified: boolean;
  status: "pending" | "approved" | "rejected" | null;
  notes: string | null;
} | null> {
  const { data, error } = await supabase
    .from("company_members")
    .select("verified, verification_status, verification_notes")
    .eq("user_id", userId)
    .eq("company_id", companyId)
    .single();

  if (error || !data) return null;

  return {
    verified: (data as any).verified || false,
    status: (data as any).verification_status as
      | "pending"
      | "approved"
      | "rejected"
      | null,
    notes: (data as any).verification_notes,
  };
}

/**
 * Get all pending verification requests (admin only)
 */
export async function getPendingRequests(): Promise<VerificationRequest[]> {
  const { data, error } = (await supabase
    .from("company_members")
    .select(
      `
      id,
      company_id,
      user_id,
      role,
      verified,
      verification_status,
      verification_date,
      verification_documents,
      verification_notes,
      created_at,
      users:user_id (id, username, display_name, email, avatar_url),
      companies:company_id (id, name, display_name, logo_url)
    `,
    )
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true })) as any;

  if (error) {
    console.error("Error fetching pending requests:", error);
    return [];
  }

  return (data || []).map((item: any) => ({
    ...item,
    verification_documents:
      item.verification_documents as VerificationDocuments | null,
    user: item.users,
    company: item.companies,
  }));
}

/**
 * Approve a verification request (admin only)
 */
export async function approveVerification(
  membershipId: string,
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get membership info to send notification
    const { data: membership, error: fetchError } = await supabase
      .from("company_members")
      .select("user_id, company_id, companies(display_name)")
      .eq("id", membershipId)
      .single();

    if (fetchError || !membership) {
      return { success: false, error: "Membership not found" };
    }

    const { error } = (await (supabase.from("company_members") as any)
      .update({
        verification_status: "approved",
        verified: true,
        verification_date: new Date().toISOString(),
        verification_notes: notes || "Verification approved",
      })
      .eq("id", membershipId)) as any;

    if (error) {
      console.error("Approval error:", error);
      return { success: false, error: "Failed to approve verification" };
    }

    // Send notification
    const companyName =
      (membership as any).companies?.display_name || "your company";
    await createNotification(
      (membership as any).user_id,
      "verification",
      "Verification Approved! ✅",
      `Good news! Your verification request for ${companyName} has been approved.`,
      `/company/${(membership as any).company_id}`,
    );

    return { success: true };
  } catch (error) {
    console.error("Approval error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Reject a verification request (admin only)
 */
export async function rejectVerification(
  membershipId: string,
  notes: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get membership info to send notification
    const { data: membership, error: fetchError } = await supabase
      .from("company_members")
      .select("user_id, company_id, companies(display_name)")
      .eq("id", membershipId)
      .single();

    if (fetchError || !membership) {
      return { success: false, error: "Membership not found" };
    }

    const { error } = (await (supabase.from("company_members") as any)
      .update({
        verification_status: "rejected",
        verified: false,
        verification_notes: notes,
      })
      .eq("id", membershipId)) as any;

    if (error) {
      console.error("Rejection error:", error);
      return { success: false, error: "Failed to reject verification" };
    }

    // Send notification
    const companyName =
      (membership as any).companies?.display_name || "your company";
    await createNotification(
      (membership as any).user_id,
      "verification",
      "Verification Rejected ❌",
      `Your verification request for ${companyName} was not approved. Reason: ${notes}`,
      `/company/${(membership as any).company_id}`,
    );

    return { success: true };
  } catch (error) {
    console.error("Rejection error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Check if current user is an admin
 */
export async function isCurrentUserAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (error || !data) return false;

  return (data as any).is_admin === true;
}

/**
 * Get verified members of a company
 */
export async function getVerifiedMembers(companyId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("company_members")
    .select("user_id")
    .eq("company_id", companyId)
    .eq("verified", true);

  if (error || !data) return [];

  return (data as any[]).map((m) => m.user_id as string);
}

/**
 * Update a user's admin status (admin only)
 */
export async function updateUserAdminStatus(
  userId: string,
  isAdmin: boolean,
  currentAdminId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = (await (supabase.from("users") as any)
      .update({ is_admin: isAdmin })
      .eq("id", userId)) as any;

    if (error) {
      console.error("User update error:", error);
      return { success: false, error: "Failed to update user status" };
    }

    // Log the action
    (await supabase.from("user_role_audit").insert({
      target_user_id: userId,
      admin_id: currentAdminId,
      action: isAdmin ? "promote" : "demote",
    } as any)) as any;

    return { success: true };
  } catch (error) {
    console.error("User update error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get all users with their reputation and admin status (admin only)
 */
export async function getAllUsers(
  limit: number = 50,
  offset: number = 0,
): Promise<any[]> {
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, username, display_name, email, is_admin, is_banned, banned_reason, reputation_score, reputation_level, created_at",
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) {
    console.error("Get users error:", error);
    return [];
  }

  return data;
}

/**
 * Ban a user (admin only)
 */
export async function banUser(
  userId: string,
  reason: string,
  currentAdminId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = (await (supabase.from("users") as any)
      .update({
        is_banned: true,
        banned_reason: reason,
      })
      .eq("id", userId)) as any;

    if (error) {
      console.error("Ban user error:", error);
      return { success: false, error: "Failed to ban user" };
    }

    // Log the action
    await supabase.from("user_role_audit").insert({
      target_user_id: userId,
      admin_id: currentAdminId,
      action: "ban",
      action_details: reason,
    } as any);

    return { success: true };
  } catch (error) {
    console.error("Ban user error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Unban a user (admin only)
 */
export async function unbanUser(
  userId: string,
  currentAdminId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = (await (supabase.from("users") as any)
      .update({
        is_banned: false,
        banned_reason: null,
      })
      .eq("id", userId)) as any;

    if (error) {
      console.error("Unban user error:", error);
      return { success: false, error: "Failed to unban user" };
    }

    // Log the action
    await supabase.from("user_role_audit").insert({
      target_user_id: userId,
      admin_id: currentAdminId,
      action: "unban",
    } as any);

    return { success: true };
  } catch (error) {
    console.error("Unban user error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Kick a user (admin only)
 * Note: Primarily logs the action for now as sessions are client-side.
 */
export async function kickUser(
  userId: string,
  currentAdminId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Log the action
    await supabase.from("user_role_audit").insert({
      target_user_id: userId,
      admin_id: currentAdminId,
      action: "kick",
    } as any);

    return { success: true };
  } catch (error) {
    console.error("Kick user error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Reset a user's password (admin only)
 */
export async function resetUserPassword(
  userId: string,
  newPassword: string,
  currentAdminId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    const { error } = (await (supabase.from("users") as any)
      .update({ password_hash })
      .eq("id", userId)) as any;

    if (error) {
      console.error("Password reset error:", error);
      return { success: false, error: "Failed to reset password" };
    }

    // Log the action
    await supabase.from("user_role_audit").insert({
      target_user_id: userId,
      admin_id: currentAdminId,
      action: "reset_password",
    } as any);

    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get trending companies (admin only)
 */
export async function getTrendingCompanies(limit: number = 6): Promise<any[]> {
  const { data, error } = await (supabase.rpc as any)(
    "get_trending_companies",
    {
      limit_count: limit,
    },
  );

  if (error) {
    console.error("Get trending companies error:", error);
    return [];
  }

  return data;
}

/**
 * Get trending topics (admin only)
 */
export async function getTrendingTopics(limit: number = 6): Promise<any[]> {
  const { data, error } = await (supabase.rpc as any)("get_trending_topics", {
    limit_count: limit,
  });

  if (error) {
    console.error("Get trending topics error:", error);
    return [];
  }

  return data;
}

/**
 * Get audit logs (admin only)
 */
export async function getAuditLogs(
  limit: number = 50,
  offset: number = 0,
): Promise<any[]> {
  const { data, error } = await supabase
    .from("user_role_audit")
    .select(
      `
      id,
      action,
      action_details,
      created_at,
      target_user:target_user_id (id, username, display_name),
      admin:admin_id (id, username, display_name)
    `,
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Get audit logs error:", error);
    return [];
  }

  return (data || []).map((log: any) => ({
    ...log,
    target_user: log.target_user,
    admin: log.admin,
  }));
}

/**
 * Get general platform statistics (admin only)
 */
export async function getPlatformStats(): Promise<{
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalVotes: number;
}> {
  try {
    const [
      { count: userCount },
      { count: postCount },
      { count: commentCount },
      { count: voteCount },
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("comments").select("*", { count: "exact", head: true }),
      supabase.from("votes").select("*", { count: "exact", head: true }),
    ]);

    return {
      totalUsers: userCount || 0,
      totalPosts: postCount || 0,
      totalComments: commentCount || 0,
      totalVotes: voteCount || 0,
    };
  } catch (error) {
    console.error("Get platform stats error:", error);
    return {
      totalUsers: 0,
      totalPosts: 0,
      totalComments: 0,
      totalVotes: 0,
    };
  }
}
