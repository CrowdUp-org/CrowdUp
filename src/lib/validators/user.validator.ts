/**
 * User Validators
 *
 * Zod schemas for validating user-related inputs.
 */

import { z } from "zod";

/**
 * Username validation: 3-30 chars, alphanumeric + underscores.
 */
const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;

/**
 * Password validation: min 8 chars, at least one uppercase, one lowercase, one number.
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * Schema for user registration.
 */
export const CreateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      usernameRegex,
      "Username can only contain letters, numbers, and underscores",
    ),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name must be at most 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      passwordRegex,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
});

/**
 * Schema for user profile update.
 */
export const UpdateUserSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name must be at most 50 characters")
    .optional(),
  avatarUrl: z.string().url("Avatar must be a valid URL").nullable().optional(),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .nullable()
    .optional(),
});

/**
 * Schema for user login.
 */
export const LoginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or username is required")
    .refine(
      (val) =>
        val.includes("@")
          ? z.string().email().safeParse(val).success
          : usernameRegex.test(val),
      "Invalid email or username format",
    ),
  password: z.string().min(1, "Password is required"),
});

/**
 * Schema for password change.
 */
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .regex(
      passwordRegex,
      "New password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
});

/**
 * Schema for password reset request.
 */
export const PasswordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

/**
 * Schema for password reset confirmation.
 */
export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .regex(
      passwordRegex,
      "New password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
});

// Inferred types from schemas
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type PasswordResetRequestInput = z.infer<
  typeof PasswordResetRequestSchema
>;
export type PasswordResetConfirmInput = z.infer<
  typeof PasswordResetConfirmSchema
>;
