import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isTokenExpired } from "./lib/auth.server";

const protectedPaths = ["/dashboard", "/canvas"];

function isProtected(pathname: string) {
  return protectedPaths.some((path) => pathname.startsWith(path));
}

async function handleAuth(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  let accessToken = request.cookies.get("accessToken")?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (!accessToken || isTokenExpired(accessToken)) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/refresh`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
          cache: "no-store",
        },
      );

      if (!res.ok) {
        const response = NextResponse.redirect(new URL("/signin", request.url));
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");
        return response;
      }

      const data = await res.json();
      accessToken = data?.data?.accessToken;

      if (!accessToken) {
        throw new Error("No access token in refresh response");
      }

      const response = NextResponse.next();
      response.cookies.set("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "lax",
        path: "/",
      });
      return response;
    } catch (error) {
      console.error("Middleware refresh error:", error);
      const response = NextResponse.redirect(new URL("/signin", request.url));
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      return response;
    }
  }

  return NextResponse.next();
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  return handleAuth(request);
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico|signin|signup).*)",
};
