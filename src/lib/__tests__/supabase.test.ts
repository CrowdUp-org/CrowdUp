/**
 * Supabase Configuration Tests
 *
 * Tests for Supabase client initialization and environment validation.
 */

import { describe, it, expect, vi, afterEach } from "vitest";

describe("Supabase Configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("development environment", () => {
    it("should use placeholder when NEXT_PUBLIC_SUPABASE_URL is not set", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
      vi.stubEnv(
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        "test-publishable-key",
      );
      vi.stubEnv("SUPABASE_SECRET_KEY", "test-secret-key");

      await vi.resetModules();
      const { supabase } = await import("@/lib/supabase");

      expect(supabase).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("NEXT_PUBLIC_SUPABASE_URL not set"),
      );

      consoleSpy.mockRestore();
    });

    it("should use placeholder when NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
      vi.stubEnv("SUPABASE_SECRET_KEY", "test-secret-key");

      await vi.resetModules();
      const { supabase } = await import("@/lib/supabase");

      expect(supabase).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY not set"),
      );

      consoleSpy.mockRestore();
    });

    it("should use placeholder when SUPABASE_SECRET_KEY is not set", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
      vi.stubEnv(
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        "test-publishable-key",
      );
      vi.stubEnv("SUPABASE_SECRET_KEY", "");

      await vi.resetModules();
      const { supabaseAdmin } = await import("@/lib/supabase");

      expect(supabaseAdmin).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("SUPABASE_SECRET_KEY not set"),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("production environment", () => {
    it("should throw error when NEXT_PUBLIC_SUPABASE_URL is missing", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
      vi.stubEnv(
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        "test-publishable-key",
      );
      vi.stubEnv("SUPABASE_SECRET_KEY", "test-secret-key");

      await vi.resetModules();

      await expect(async () => {
        await import("@/lib/supabase");
      }).rejects.toThrow(
        "NEXT_PUBLIC_SUPABASE_URL environment variable is required",
      );
    });

    it("should throw error when NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
      vi.stubEnv("SUPABASE_SECRET_KEY", "test-secret-key");

      await vi.resetModules();

      await expect(async () => {
        await import("@/lib/supabase");
      }).rejects.toThrow(
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable is required",
      );
    });

    it("should throw error when SUPABASE_SECRET_KEY is missing", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
      vi.stubEnv(
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        "test-publishable-key",
      );
      vi.stubEnv("SUPABASE_SECRET_KEY", "");

      await vi.resetModules();

      await expect(async () => {
        await import("@/lib/supabase");
      }).rejects.toThrow(
        "SUPABASE_SECRET_KEY environment variable is required in production",
      );
    });
  });

  describe("client initialization", () => {
    it("should create client-side supabase client with correct config", async () => {
      vi.stubEnv("NODE_ENV", "test");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-pub-key");
      vi.stubEnv("SUPABASE_SECRET_KEY", "test-secret-key");

      await vi.resetModules();
      const { supabase } = await import("@/lib/supabase");

      expect(supabase).toBeDefined();
      // The supabase client should have the expected structure
      expect(supabase.auth).toBeDefined();
      expect(supabase.from).toBeDefined();
    });

    it("should create admin supabase client with correct config", async () => {
      vi.stubEnv("NODE_ENV", "test");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-pub-key");
      vi.stubEnv("SUPABASE_SECRET_KEY", "test-secret-key");

      await vi.resetModules();
      const { supabaseAdmin } = await import("@/lib/supabase");

      expect(supabaseAdmin).toBeDefined();
      // The admin client should have the expected structure
      expect(supabaseAdmin.auth).toBeDefined();
      expect(supabaseAdmin.from).toBeDefined();
    });
  });
});
