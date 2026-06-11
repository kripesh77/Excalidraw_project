// ${process.env.NEXT_PUBLIC_BACKEND_URL}
// app/verify/route.ts

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    const response = NextResponse.redirect(new URL("/", request.url));
    return response;
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/verify/${token}`,
      {
        method: "GET",
      },
    );

    if (!res.ok) throw new Error(res.statusText);

    const { accessToken, refreshToken } = (await res.json()).data;

    const response = NextResponse.redirect(new URL("/dashboard", request.url));

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return response;
  } catch (e: unknown) {
    const response = NextResponse.redirect(new URL("/", request.url));
    return response;
  }
}
