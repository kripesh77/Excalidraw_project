import DashboardClient, { type Room } from "./DashboardClient";
import { getValidAccessToken, getRefreshTokenCookie } from "@/lib/auth.server";
import { redirect } from "next/navigation";

async function fetchRooms(accessToken: string) {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL;

  const res = await fetch(`${base}/api/v1/room`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { tags: ["rooms"] },
  });

  const json = await res.json().catch(() => ({}));

  return { res, json };
}

export default async function DashboardPage() {
  const refreshToken = await getRefreshTokenCookie();

  if (!refreshToken) {
    redirect("/api/auth");
  }

  let accessToken = await getValidAccessToken(false);

  if (!accessToken) {
    const r = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/auth/refresh`,
      {
        method: "POST",
        cache: "no-store",
      },
    );
    if (r.ok) {
      const json = await r.json().catch(() => ({}));
      accessToken = json?.accessToken ?? null;
    }
  }

  if (!accessToken) {
    redirect("/api/auth");
  }

  let { res, json } = await fetchRooms(accessToken);

  if (res.status === 401) {
    const r = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/auth/refresh`,
      {
        method: "POST",
        cache: "no-store",
      },
    );
    if (r.ok) {
      const j = await r.json().catch(() => ({}));
      accessToken = j?.accessToken ?? null;
      if (accessToken) {
        ({ res, json } = await fetchRooms(accessToken));
      }
    }

    if (res.status === 401) {
      redirect("/api/auth");
    }
  }

  const rooms: Room[] = json?.data ?? [];

  return <DashboardClient rooms={rooms} />;
}
