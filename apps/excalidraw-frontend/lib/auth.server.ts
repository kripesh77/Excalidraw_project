import "server-only";

import { cookies } from "next/headers";

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

const ACCESS_TOKEN_MAX_AGE = 60 * 15;
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

const baseCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
};

export async function getAccessTokenCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshTokenCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}

export async function setAccessTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, token, {
    ...baseCookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
}

export async function setRefreshTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_TOKEN_COOKIE, token, {
    ...baseCookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export async function refreshAccessToken(
  refreshToken?: string,
  setCookie = false,
) {
  const token = refreshToken ?? (await getRefreshTokenCookie());
  if (!token) return null;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/refresh`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) return null;

  const json = await res.json().catch(() => null);
  const accessToken = json?.data?.accessToken as string | undefined;

  if (!accessToken) return null;

  if (setCookie) {
    await setAccessTokenCookie(accessToken);
  }
  return accessToken;
}

export function isTokenExpired(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return false;
    const decoded = JSON.parse(
      Buffer.from(payload, "base64").toString("utf8"),
    ) as { exp?: number };
    if (!decoded.exp) return false;
    return decoded.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

export async function getValidAccessToken(setCookie = false) {
  const accessToken = await getAccessTokenCookie();
  if (accessToken && !isTokenExpired(accessToken)) {
    return accessToken;
  }

  return refreshAccessToken(undefined, setCookie);
}
