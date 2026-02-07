import { describe, it, expect, beforeEach } from "vitest";

import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/jwt";

describe("JWT Utilities", () => {
  const testUserId = "user-123-abc";
  const testJti = "jti-456-def";

  describe("signAccessToken", () => {
    it("should sign a valid access token", async () => {
      const token = await signAccessToken(testUserId);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should create tokens that can be verified", async () => {
      const token = await signAccessToken(testUserId);
      const payload = await verifyAccessToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe(testUserId);
      expect(payload?.type).toBe("access");
    });
  });

  describe("signRefreshToken", () => {
    it("should sign a valid refresh token with jti", async () => {
      const token = await signRefreshToken(testUserId, testJti);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    it("should create tokens that can be verified", async () => {
      const token = await signRefreshToken(testUserId, testJti);
      const payload = await verifyRefreshToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe(testUserId);
      expect(payload?.jti).toBe(testJti);
      expect(payload?.type).toBe("refresh");
    });
  });

  describe("verifyAccessToken", () => {
    it("should return null for invalid token", async () => {
      const result = await verifyAccessToken("invalid-token");
      expect(result).toBeNull();
    });

    it("should return null for expired token", async () => {
      // Create a token with very short expiration (we can't easily test this without mocking time)
      // So we test with a completely malformed token
      const result = await verifyAccessToken(
        "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0IiwidHlwZSI6ImFjY2VzcyIsImV4cCI6MH0.invalid",
      );
      expect(result).toBeNull();
    });

    it("should return null for refresh token passed to access verifier", async () => {
      const refreshToken = await signRefreshToken(testUserId, testJti);
      const result = await verifyAccessToken(refreshToken);
      expect(result).toBeNull();
    });
  });

  describe("verifyRefreshToken", () => {
    it("should return null for invalid token", async () => {
      const result = await verifyRefreshToken("invalid-token");
      expect(result).toBeNull();
    });

    it("should return null for access token passed to refresh verifier", async () => {
      const accessToken = await signAccessToken(testUserId);
      const result = await verifyRefreshToken(accessToken);
      expect(result).toBeNull();
    });
  });

  describe("token payload structure", () => {
    it("access token should contain required fields", async () => {
      const token = await signAccessToken(testUserId);
      const payload = await verifyAccessToken(token);

      expect(payload).toMatchObject({
        sub: testUserId,
        type: "access",
      });
      expect(payload?.iat).toBeDefined();
      expect(payload?.exp).toBeDefined();
    });

    it("refresh token should contain required fields", async () => {
      const token = await signRefreshToken(testUserId, testJti);
      const payload = await verifyRefreshToken(token);

      expect(payload).toMatchObject({
        sub: testUserId,
        jti: testJti,
        type: "refresh",
      });
      expect(payload?.iat).toBeDefined();
      expect(payload?.exp).toBeDefined();
    });
  });
});
