import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * JWT Secret Configuration
 *
 * SECURITY: JWT_SECRET must be set in production.
 * - Minimum 32 characters recommended
 * - Use cryptographically random value
 * - Never commit real secrets to version control
 *
 * In development, a placeholder is allowed for local testing.
 * In production, missing JWT_SECRET will cause a startup error.
 */
let cachedSecret: Uint8Array | null = null;

const getJwtSecret = (): Uint8Array => {
  // Return cached secret to avoid repeated warnings
  if (cachedSecret) return cachedSecret;

  const secret = process.env.JWT_SECRET;
  const isDev = process.env.NODE_ENV !== "production";

  if (!secret) {
    if (isDev) {
      // Development fallback - NOT SECURE, only for local testing
      console.warn(
        "[SECURITY WARNING] JWT_SECRET not set. Using insecure development fallback.",
      );
      cachedSecret = new TextEncoder().encode(
        "crowdup-dev-jwt-secret-NOT-FOR-PRODUCTION",
      );
      return cachedSecret;
    }
    throw new Error(
      "JWT_SECRET environment variable is required in production",
    );
  }

  if (secret.length < 32) {
    console.warn(
      "[SECURITY WARNING] JWT_SECRET should be at least 32 characters",
    );
  }

  cachedSecret = new TextEncoder().encode(secret);
  return cachedSecret;
};

export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  type: "access";
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string;
  jti: string;
  type: "refresh";
}

// Access token: 15 minutes
export async function signAccessToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getJwtSecret());
}

// Refresh token: 7 days
export async function signRefreshToken(
  userId: string,
  jti: string,
): Promise<string> {
  return new SignJWT({ sub: userId, jti, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.type !== "access") return null;
    return payload as AccessTokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string,
): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.type !== "refresh") return null;
    return payload as RefreshTokenPayload;
  } catch {
    return null;
  }
}
