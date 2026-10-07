import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect(new URL("/signin", process.env.APP_URL));

  res.cookies.set("refreshToken", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return res;
}
