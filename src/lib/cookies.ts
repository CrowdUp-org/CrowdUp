import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

// Access token cookie: 15 minutes, httpOnly, secure
export const ACCESS_TOKEN_COOKIE: Partial<ResponseCookie> = {
  name: "access_token",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 15, // 15 minutes
};

// Refresh token cookie: 7 days, httpOnly, secure, restricted path
export const REFRESH_TOKEN_COOKIE: Partial<ResponseCookie> = {
  name: "refresh_token",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/auth",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export function getAccessTokenCookie(value: string): ResponseCookie {
  return { ...ACCESS_TOKEN_COOKIE, value } as ResponseCookie;
}

export function getRefreshTokenCookie(value: string): ResponseCookie {
  return { ...REFRESH_TOKEN_COOKIE, value } as ResponseCookie;
}

export function getClearAccessTokenCookie(): ResponseCookie {
  return { ...ACCESS_TOKEN_COOKIE, value: "", maxAge: 0 } as ResponseCookie;
}

export function getClearRefreshTokenCookie(): ResponseCookie {
  return { ...REFRESH_TOKEN_COOKIE, value: "", maxAge: 0 } as ResponseCookie;
}
