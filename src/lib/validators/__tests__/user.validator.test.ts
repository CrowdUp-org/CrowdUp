/**
 * User Validator Tests
 *
 * Tests for user-related Zod schemas.
 */

import { describe, it, expect } from "vitest";
import {
  CreateUserSchema,
  UpdateUserSchema,
  LoginSchema,
  ChangePasswordSchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema,
} from "../user.validator";

describe("CreateUserSchema", () => {
  const validUser = {
    username: "john_doe",
    displayName: "John Doe",
    email: "john@example.com",
    password: "Password123",
  };

  describe("valid inputs", () => {
    it("should accept a valid user", () => {
      const result = CreateUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validUser);
      }
    });

    it("should accept username with only letters", () => {
      const result = CreateUserSchema.safeParse({
        ...validUser,
        username: "johndoe",
      });
      expect(result.success).toBe(true);
    });

    it("should accept username with numbers", () => {
      const result = CreateUserSchema.safeParse({
        ...validUser,
        username: "john123",
      });
      expect(result.success).toBe(true);
    });

    it("should accept username with underscores", () => {
      const result = CreateUserSchema.safeParse({
        ...validUser,
        username: "john_doe_123",
      });
      expect(result.success).toBe(true);
    });

    it("should accept username at minimum length (3 chars)", () => {
      const result = CreateUserSchema.safeParse({
        ...validUser,
        username: "joe",
      });
      expect(result.success).toBe(true);
    });

    it("should accept username at maximum length (30 chars)", () => {
      const result = CreateUserSchema.safeParse({
        ...validUser,
        username: "a".repeat(30),
      });
      expect(result.success).toBe(true);
    });

    it("should accept password with special characters", () => {
      const result = CreateUserSchema.safeParse({
        ...validUser,
        password: "Password123!@#",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("invalid inputs", () => {
    it("should reject username shorter than 3 characters", () => {
      const result = CreateUserSchema.safeParse({
        ...validUser,
        username: "ab",
      });
      expect(result.success).toBe(false);
    });

    it("should reject username longer than 30 characters", () => {
      const result = CreateUserSchema.safeParse({
        ...validUser,
        username: "a".repeat(31),
      });
      expect(result.success).toBe(false);
    });

    it("should reject username with special characters", () => {
      const invalidUsernames = [
        "john-doe",
        "john.doe",
        "john@doe",
        "john doe",
        "john!doe",
      ];

      for (const username of invalidUsernames) {
        const result = CreateUserSchema.safeParse({
          ...validUser,
          username,
        });
        expect(result.success).toBe(false);
      }
    });

    it("should reject empty display name", () => {
      const result = CreateUserSchema.safeParse({
        ...validUser,
        displayName: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject display name over 50 characters", () => {
      const result = CreateUserSchema.safeParse({
        ...validUser,
        displayName: "A".repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email formats", () => {
      const invalidEmails = [
        "notanemail",
        "missing@domain",
        "@nodomain.com",
        "spaces in@email.com",
      ];

      for (const email of invalidEmails) {
        const result = CreateUserSchema.safeParse({
          ...validUser,
          email,
        });
        expect(result.success).toBe(false);
      }
    });

    it("should reject password shorter than 8 characters", () => {
      const result = CreateUserSchema.safeParse({
        ...validUser,
        password: "Pass1",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password without uppercase letter", () => {
      const result = CreateUserSchema.safeParse({
        ...validUser,
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password without lowercase letter", () => {
      const result = CreateUserSchema.safeParse({
        ...validUser,
        password: "PASSWORD123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password without number", () => {
      const result = CreateUserSchema.safeParse({
        ...validUser,
        password: "PasswordABC",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing username", () => {
      const { username: _, ...user } = validUser;
      const result = CreateUserSchema.safeParse(user);
      expect(result.success).toBe(false);
    });

    it("should reject missing displayName", () => {
      const { displayName: _, ...user } = validUser;
      const result = CreateUserSchema.safeParse(user);
      expect(result.success).toBe(false);
    });

    it("should reject missing email", () => {
      const { email: _, ...user } = validUser;
      const result = CreateUserSchema.safeParse(user);
      expect(result.success).toBe(false);
    });

    it("should reject missing password", () => {
      const { password: _, ...user } = validUser;
      const result = CreateUserSchema.safeParse(user);
      expect(result.success).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should accept exactly 8 character password meeting requirements", () => {
      const result = CreateUserSchema.safeParse({
        ...validUser,
        password: "Pass1234",
      });
      expect(result.success).toBe(true);
    });

    it("should accept long password meeting requirements", () => {
      const result = CreateUserSchema.safeParse({
        ...validUser,
        password: "Password123" + "a".repeat(100),
      });
      expect(result.success).toBe(true);
    });

    it("should accept display name with special characters", () => {
      const result = CreateUserSchema.safeParse({
        ...validUser,
        displayName: "John O'Brien-Smith",
      });
      expect(result.success).toBe(true);
    });
  });
});

describe("UpdateUserSchema", () => {
  it("should accept partial updates", () => {
    const result = UpdateUserSchema.safeParse({
      displayName: "New Name",
    });
    expect(result.success).toBe(true);
  });

  it("should accept empty object (no updates)", () => {
    const result = UpdateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should accept null avatarUrl", () => {
    const result = UpdateUserSchema.safeParse({
      avatarUrl: null,
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid avatarUrl", () => {
    const result = UpdateUserSchema.safeParse({
      avatarUrl: "https://example.com/avatar.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid avatarUrl", () => {
    const result = UpdateUserSchema.safeParse({
      avatarUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("should accept bio at maximum length", () => {
    const result = UpdateUserSchema.safeParse({
      bio: "A".repeat(500),
    });
    expect(result.success).toBe(true);
  });

  it("should reject bio over 500 characters", () => {
    const result = UpdateUserSchema.safeParse({
      bio: "A".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("LoginSchema", () => {
  it("should accept login with email", () => {
    const result = LoginSchema.safeParse({
      identifier: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should accept login with username", () => {
    const result = LoginSchema.safeParse({
      identifier: "john_doe",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty identifier", () => {
    const result = LoginSchema.safeParse({
      identifier: "",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty password", () => {
    const result = LoginSchema.safeParse({
      identifier: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid email format when @ present", () => {
    const result = LoginSchema.safeParse({
      identifier: "invalid@",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("ChangePasswordSchema", () => {
  it("should accept valid password change", () => {
    const result = ChangePasswordSchema.safeParse({
      currentPassword: "oldpassword",
      newPassword: "NewPass123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject weak new password", () => {
    const result = ChangePasswordSchema.safeParse({
      currentPassword: "oldpassword",
      newPassword: "weak",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty current password", () => {
    const result = ChangePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "NewPass123",
    });
    expect(result.success).toBe(false);
  });
});

describe("PasswordResetRequestSchema", () => {
  it("should accept valid email", () => {
    const result = PasswordResetRequestSchema.safeParse({
      email: "user@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = PasswordResetRequestSchema.safeParse({
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});

describe("PasswordResetConfirmSchema", () => {
  it("should accept valid reset confirmation", () => {
    const result = PasswordResetConfirmSchema.safeParse({
      token: "valid-reset-token",
      newPassword: "NewPass123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty token", () => {
    const result = PasswordResetConfirmSchema.safeParse({
      token: "",
      newPassword: "NewPass123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject weak new password", () => {
    const result = PasswordResetConfirmSchema.safeParse({
      token: "valid-reset-token",
      newPassword: "weak",
    });
    expect(result.success).toBe(false);
  });
});
