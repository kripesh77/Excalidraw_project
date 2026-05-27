import DashboardClient, { type Room } from "./DashboardClient";
import {
  getValidAccessToken,
  getRefreshTokenCookie,
  refreshAccessToken,
} from "@/lib/auth.server";
import { redirect } from "next/navigation";

const MOCK_ROOMS: Room[] = [
  { id: 7, slug: "hello-world-13ca", createdAt: "2026-05-10T07:02:17.938Z" },
  { id: 8, slug: "red-room-a9x3", createdAt: "2026-05-10T07:05:17.938Z" },
  {
    id: 9,
    slug: "midnight-doodles-77kp",
    createdAt: "2026-05-08T19:21:00.000Z",
  },
  {
    id: 10,
    slug: "sketch-jam-friday-ff21",
    createdAt: "2026-05-03T14:12:30.000Z",
  },
];
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

  // Read access token without mutating cookies.
  let accessToken = await getValidAccessToken(false);

  if (!accessToken) {
    // Attempt refresh via route that can mutate cookies.
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
    // Try server refresh route when backend rejects the token.
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

  const rooms: Room[] = res.ok ? (json?.data ?? []) : MOCK_ROOMS;

  return <DashboardClient rooms={rooms} />;
}
