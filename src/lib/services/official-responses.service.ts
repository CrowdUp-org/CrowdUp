import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";
import { createNotification } from "./notifications.service";

type OfficialResponse =
  Database["public"]["Tables"]["official_responses"]["Row"];
type OfficialResponseInsert =
  Database["public"]["Tables"]["official_responses"]["Insert"];
type OfficialResponseUpdate =
  Database["public"]["Tables"]["official_responses"]["Update"];

export type ResponseType =
  | "acknowledgment"
  | "investigating"
  | "planned"
  | "fixed"
  | "wont_fix"
  | "duplicate";

export interface OfficialResponseWithUser extends OfficialResponse {
  users: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
  companies?: {
    id: string;
    name: string;
    display_name: string;
    logo_url: string | null;
  };
}

/**
 * Check if a user can post official responses for a specific post
 * User must be a verified member of the company related to the post
 */
export async function canUserRespond(
  userId: string,
  postId: string,
): Promise<{ canRespond: boolean; companyId?: string; error?: string }> {
  try {
    // Get the post's company
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("company, app_id, apps(company_id)")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      return { canRespond: false, error: "Post not found" };
    }

    // Get company_id from app or company name
    let companyId: string | null = null;
    if ((post as any).app_id && (post as any).apps) {
      companyId = (post as any).apps.company_id;
    } else {
      // Try to find company by name
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("name", (post as any).company)
        .single();

      companyId = (company as any)?.id || null;
    }

    if (!companyId) {
      return { canRespond: false, error: "Company not found" };
    }

    // Check if user is a verified member of the company
    const { data: membership, error: memberError } = await supabase
      .from("company_members")
      .select("verified, role")
      .eq("company_id", companyId)
      .eq("user_id", userId)
      .eq("verified", true)
      .single();

    if (memberError || !membership) {
      return {
        canRespond: false,
        error: "User is not a verified company member",
      };
    }

    return { canRespond: true, companyId };
  } catch (error) {
    console.error("Error checking user response permission:", error);
    return { canRespond: false, error: "Failed to check permissions" };
  }
}

/**
 * Create an official response to a post
 */
export async function createOfficialResponse(
  postId: string,
  userId: string,
  content: string,
  responseType: ResponseType = "acknowledgment",
  isPinned: boolean = true,
): Promise<{
  success: boolean;
  data?: OfficialResponseWithUser;
  error?: string;
}> {
  try {
    // Verify user can respond
    const {
      canRespond,
      companyId,
      error: permError,
    } = await canUserRespond(userId, postId);

    if (!canRespond) {
      return { success: false, error: permError || "Permission denied" };
    }

    // Create the response
    const responseData: OfficialResponseInsert = {
      post_id: postId,
      company_id: companyId,
      responder_id: userId,
      content,
      response_type: responseType,
      is_pinned: isPinned,
    };

    const { data: response, error: insertError } = await supabase
      .from("official_responses")
      .insert(responseData as any)
      .select(
        `
        *,
        users (id, username, display_name, avatar_url),
        companies (id, name, display_name, logo_url)
      `,
      )
      .single();

    if (insertError || !response) {
      console.error("Error creating official response:", insertError);
      return { success: false, error: "Failed to create response" };
    }

    // Send notification to post author
    const { data: post } = await supabase
      .from("posts")
      .select("user_id, title")
      .eq("id", postId)
      .single();

    if (post && (post as any).user_id !== userId) {
      const { data: company } = await supabase
        .from("companies")
        .select("display_name")
        .eq("id", companyId!)
        .single();

      const companyName = (company as any)?.display_name || "A company";

      await createNotification(
        (post as any).user_id,
        "official_response",
        "Official Response to Your Post",
        `${companyName} has responded to your post: "${(post as any).title}"`,
        `/post/${postId}`,
      );
    }

    return { success: true, data: response as OfficialResponseWithUser };
  } catch (error) {
    console.error("Error in createOfficialResponse:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update an official response
 * Only the responder or company admins can update
 */
export async function updateOfficialResponse(
  responseId: string,
  userId: string,
  updates: {
    content?: string;
    response_type?: ResponseType;
    is_pinned?: boolean;
  },
): Promise<{ success: boolean; data?: OfficialResponse; error?: string }> {
  try {
    // Get the response to check permissions
    const { data: existingResponse, error: fetchError } = await supabase
      .from("official_responses")
      .select("*, companies!inner(id)")
      .eq("id", responseId)
      .single();

    if (fetchError || !existingResponse) {
      return { success: false, error: "Response not found" };
    }

    // Check if user is the responder or company admin
    const isResponder = (existingResponse as any).responder_id === userId;
    let isCompanyAdmin = false;

    if (!isResponder && (existingResponse as any).company_id) {
      const { data: membership } = await supabase
        .from("company_members")
        .select("role")
        .eq("company_id", (existingResponse as any).company_id)
        .eq("user_id", userId)
        .in("role", ["owner", "admin"])
        .single();

      isCompanyAdmin = !!membership;
    }

    if (!isResponder && !isCompanyAdmin) {
      return { success: false, error: "Permission denied" };
    }

    // Update the response
    const updateData: OfficialResponseUpdate = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedResponse, error: updateError } = await (
      supabase.from("official_responses") as any
    )
      .update(updateData as any)
      .eq("id", responseId)
      .select()
      .single();

    if (updateError || !updatedResponse) {
      console.error("Error updating official response:", updateError);
      return { success: false, error: "Failed to update response" };
    }

    return { success: true, data: updatedResponse };
  } catch (error) {
    console.error("Error in updateOfficialResponse:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete an official response
 * Only the responder or company admins can delete
 */
export async function deleteOfficialResponse(
  responseId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the response to check permissions
    const { data: existingResponse, error: fetchError } = await supabase
      .from("official_responses")
      .select("responder_id, company_id")
      .eq("id", responseId)
      .single();

    if (fetchError || !existingResponse) {
      return { success: false, error: "Response not found" };
    }

    // Check if user is the responder or company admin
    const isResponder = (existingResponse as any).responder_id === userId;
    let isCompanyAdmin = false;

    if (!isResponder && (existingResponse as any).company_id) {
      const { data: membership } = await supabase
        .from("company_members")
        .select("role")
        .eq("company_id", (existingResponse as any).company_id)
        .eq("user_id", userId)
        .in("role", ["owner", "admin"])
        .single();

      isCompanyAdmin = !!membership;
    }

    if (!isResponder && !isCompanyAdmin) {
      return { success: false, error: "Permission denied" };
    }

    // Delete the response
    const { error: deleteError } = await supabase
      .from("official_responses")
      .delete()
      .eq("id", responseId);

    if (deleteError) {
      console.error("Error deleting official response:", deleteError);
      return { success: false, error: "Failed to delete response" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteOfficialResponse:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get all official responses for a post
 * Returns pinned responses first, then by creation date
 */
export async function getResponsesForPost(postId: string): Promise<{
  success: boolean;
  data?: OfficialResponseWithUser[];
  error?: string;
}> {
  try {
    const { data: responses, error } = await supabase
      .from("official_responses")
      .select(
        `
        *,
        users (id, username, display_name, avatar_url),
        companies (id, name, display_name, logo_url)
      `,
      )
      .eq("post_id", postId)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching official responses:", error);
      return { success: false, error: "Failed to fetch responses" };
    }

    return {
      success: true,
      data: (responses || []) as OfficialResponseWithUser[],
    };
  } catch (error) {
    console.error("Error in getResponsesForPost:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Toggle pin status of a response
 * Only company admins can pin/unpin
 */
export async function togglePinResponse(
  responseId: string,
  userId: string,
  isPinned: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the response to check permissions
    const { data: existingResponse, error: fetchError } = await supabase
      .from("official_responses")
      .select("company_id")
      .eq("id", responseId)
      .single();

    if (fetchError || !existingResponse) {
      return { success: false, error: "Response not found" };
    }

    // Check if user is company admin
    if ((existingResponse as any).company_id) {
      const { data: membership } = await supabase
        .from("company_members")
        .select("role")
        .eq("company_id", (existingResponse as any).company_id)
        .eq("user_id", userId)
        .in("role", ["owner", "admin"])
        .single();

      if (!membership) {
        return {
          success: false,
          error: "Only company admins can pin/unpin responses",
        };
      }
    } else {
      return { success: false, error: "Company not found" };
    }

    // Update pin status
    const { error: updateError } = await (
      supabase.from("official_responses") as any
    )
      .update({ is_pinned: isPinned } as any)
      .eq("id", responseId);

    if (updateError) {
      console.error("Error toggling pin status:", updateError);
      return { success: false, error: "Failed to update pin status" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in togglePinResponse:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get response count for a post
 */
export async function getResponseCount(postId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("official_responses")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    if (error) {
      console.error("Error counting responses:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getResponseCount:", error);
    return 0;
  }
}

/**
 * Check if a post has any official responses
 */
export async function hasOfficialResponse(postId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("official_responses")
      .select("id")
      .eq("post_id", postId)
      .limit(1)
      .single();

    return !error && !!data;
  } catch (error) {
    return false;
  }
}
