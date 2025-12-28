"use client";

import { supabase } from "./supabase";
import { createNotification } from "./notifications";
import type { Json } from "./database.types";

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
    if (membership.verification_status === "pending") {
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

    const { error: updateError } = await supabase
      .from("company_members")
      .update({
        verification_status: "pending",
        verification_documents: verificationDocs as unknown as Json,
      } as any)
      .eq("id", membership.id);

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
    verified: data.verified || false,
    status: data.verification_status as
      | "pending"
      | "approved"
      | "rejected"
      | null,
    notes: data.verification_notes,
  };
}

/**
 * Get all pending verification requests (admin only)
 */
export async function getPendingRequests(): Promise<VerificationRequest[]> {
  const { data, error } = await supabase
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
    .order("created_at", { ascending: true });

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

    const { error } = await supabase
      .from("company_members")
      .update({
        verification_status: "approved",
        verified: true,
        verification_date: new Date().toISOString(),
        verification_notes: notes || "Verification approved",
      } as any)
      .eq("id", membershipId);

    if (error) {
      console.error("Approval error:", error);
      return { success: false, error: "Failed to approve verification" };
    }

    // Send notification
    const companyName =
      (membership.companies as any)?.display_name || "your company";
    await createNotification(
      membership.user_id,
      "verification",
      "Verification Approved! ✅",
      `Good news! Your verification request for ${companyName} has been approved.`,
      `/company/${membership.company_id}`,
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

    const { error } = await supabase
      .from("company_members")
      .update({
        verification_status: "rejected",
        verified: false,
        verification_notes: notes,
      } as any)
      .eq("id", membershipId);

    if (error) {
      console.error("Rejection error:", error);
      return { success: false, error: "Failed to reject verification" };
    }

    // Send notification
    const companyName =
      (membership.companies as any)?.display_name || "your company";
    await createNotification(
      membership.user_id,
      "verification",
      "Verification Rejected ❌",
      `Your verification request for ${companyName} was not approved. Reason: ${notes}`,
      `/company/${membership.company_id}`,
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

  return data.is_admin === true;
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

  return data.map((m) => m.user_id as string);
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
    const { error } = await supabase
      .from("users")
      .update({ is_admin: isAdmin } as any)
      .eq("id", userId);

    if (error) {
      console.error("User update error:", error);
      return { success: false, error: "Failed to update user status" };
    }

    // Log the action
    await supabase.from("user_role_audit").insert({
      target_user_id: userId,
      admin_id: currentAdminId,
      action: isAdmin ? "promote" : "demote",
    } as any);

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
      "id, username, display_name, email, is_admin, reputation_score, reputation_level, created_at",
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) {
    console.error("Get users error:", error);
    return [];
  }

  return data;
}
