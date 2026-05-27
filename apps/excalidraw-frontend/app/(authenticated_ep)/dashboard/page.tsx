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

  let accessToken = await getValidAccessToken(false);

  if (!accessToken) {
    redirect("/api/auth");
  }

  let { res, json } = await fetchRooms(accessToken);

  if (res.status === 401) {
    const refreshed = await refreshAccessToken(refreshToken, false);
    if (!refreshed) {
      redirect("/api/auth");
    }
    accessToken = refreshed;
    ({ res, json } = await fetchRooms(accessToken));
  }

  const rooms: Room[] = res.ok ? (json?.data ?? []) : MOCK_ROOMS;

  return <DashboardClient rooms={rooms} />;
}
