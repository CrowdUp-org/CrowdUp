import { supabase } from "../supabase";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export interface User {
  id: string;
  username: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface SignUpData {
  username: string;
  display_name: string;
  email: string;
  password: string;
}

export interface SignInData {
  usernameOrEmail: string;
  password: string;
}

export async function signUp(
  data: SignUpData,
): Promise<{ user: User | null; error: string | null }> {
  try {
    // Check if username exists
    const { data: existingUsername } = (await supabase
      .from("users")
      .select("id")
      .eq("username", data.username)
      .single()) as any;

    if (existingUsername) {
      return { user: null, error: "Username already taken" };
    }

    // Check if email exists
    const { data: existingEmail } = (await supabase
      .from("users")
      .select("id")
      .eq("email", data.email)
      .single()) as any;

    if (existingEmail) {
      return { user: null, error: "Email already registered" };
    }

    // Hash password
    const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user
    const { data: newUser, error } = (await supabase
      .from("users")
      .insert({
        username: data.username,
        display_name: data.display_name,
        email: data.email,
        password_hash,
      } as any)
      .select("id, username, display_name, email, avatar_url, bio, created_at")
      .single()) as any;

    if (error) {
      return { user: null, error: error.message };
    }

    // Store session
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("userId", (newUser as any).id);
    }

    return { user: newUser, error: null };
  } catch (error) {
    return { user: null, error: "An error occurred during sign up" };
  }
}

export async function signIn(
  data: SignInData,
): Promise<{ user: User | null; error: string | null }> {
  try {
    // Find user by username or email
    const { data: users, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .or(
        `username.eq.${data.usernameOrEmail},email.eq.${data.usernameOrEmail}`,
      )
      .limit(1);

    if (fetchError || !users || users.length === 0) {
      return { user: null, error: "Invalid credentials" };
    }

    const user = users[0];

    // Verify password
    const isValid = await bcrypt.compare(
      data.password,
      (user as any).password_hash,
    );

    if (!isValid) {
      return { user: null, error: "Invalid credentials" };
    }

    // Remove password_hash from user object
    const { password_hash, ...userWithoutPassword } = user as any;

    // Store session
    localStorage.setItem("user", JSON.stringify(userWithoutPassword));
    localStorage.setItem("userId", (user as any).id);

    return { user: userWithoutPassword, error: null };
  } catch (error) {
    return { user: null, error: "An error occurred during sign in" };
  }
}

export function signOut() {
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userId");
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Get user with password hash
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("password_hash")
      .eq("id", userId)
      .single();

    if (fetchError || !user) {
      return { success: false, error: "User not found" };
    }

    // Verify current password
    const isValid = await bcrypt.compare(
      currentPassword,
      (user as any).password_hash,
    );
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    const { error: updateError } = (await (supabase.from("users") as any)
      .update({ password_hash: newPasswordHash })
      .eq("id", userId)) as any;

    if (updateError) {
      return { success: false, error: "Failed to update password" };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: "An error occurred while changing password",
    };
  }
}

export async function updateProfile(data: {
  display_name?: string;
  username?: string;
  bio?: string;
}): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // If username is being changed, check if it's available
    if (data.username) {
      const { data: existingUser } = (await supabase
        .from("users")
        .select("id")
        .eq("username", data.username)
        .neq("id", userId)
        .single()) as any;

      if (existingUser) {
        return { success: false, error: "Username already taken" };
      }
    }

    // Update user
    const { error: updateError } = (await (supabase.from("users") as any)
      .update(data)
      .eq("id", userId)) as any;

    if (updateError) {
      return { success: false, error: "Failed to update profile" };
    }

    // Update local storage
    const currentUser = getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: "An error occurred while updating profile",
    };
  }
}
