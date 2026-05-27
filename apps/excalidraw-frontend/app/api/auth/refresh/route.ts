import { NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/auth.server";

export async function POST() {
  try {
    const accessToken = await refreshAccessToken(undefined, true);
    if (!accessToken) {
      return NextResponse.json({ error: "could_not_refresh" }, { status: 401 });
    }
    return NextResponse.json({ accessToken }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "unexpected" }, { status: 500 });
  }
}
