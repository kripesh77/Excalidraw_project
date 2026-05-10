"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "@/context/authContext";

type Room = {
  id: number;
  slug: string;
  createdAt: string;
};

const SKETCH =
  "border-2 border-[#1a1a2e] rounded-[14px_18px_12px_22px/18px_12px_20px_14px] shadow-[4px_4px_0_0_#1a1a2e]";
const SKETCH_SOFT =
  "border-2 border-[#1a1a2e] rounded-[18px_14px_22px_12px/14px_20px_12px_18px]";

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

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getRooms(accessToken: string): Promise<Room[]> {
  try {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL;

    await sleep(4000);

    const res = await axios.get(`${base}/api/v1/room`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return res.data?.data ?? [];
  } catch (err) {
    return MOCK_ROOMS;
  }
}

function RoomCard({ room, idx }: { room: Room; idx: number }) {
  const palette = [
    { bg: "#fef3c7", ink: "#92400e", tag: "#fbbf24" },
    { bg: "#dbeafe", ink: "#1e40af", tag: "#60a5fa" },
    { bg: "#fce7f3", ink: "#9d174d", tag: "#f472b6" },
  ][idx % 3];

  return (
    <Link
      href={`/canvas/${room.slug}`}
      className={`group block ${SKETCH} bg-white p-5 transition hover:-translate-y-1`}
    >
      <div
        className={`mb-4 flex h-32 items-center justify-center ${SKETCH_SOFT}`}
        style={{ backgroundColor: palette?.bg }}
      >
        <svg width="100%" height="100%" viewBox="0 0 200 120" className="px-4">
          <path
            d={`M10 60 Q 50 20 90 50 T 190 40`}
            stroke={palette?.ink}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="text-xs uppercase text-black/50">Room #{room.id}</div>

      <h3 className="mt-1 truncate font-[Caveat,ui-sans-serif] text-2xl font-bold">
        {room.slug}
      </h3>

      <div className="mt-3 flex justify-between text-xs text-black/60">
        <span>🕒 {timeAgo(room.createdAt)}</span>
        <span className="font-bold underline decoration-wavy decoration-purple-500">
          Open →
        </span>
      </div>
    </Link>
  );
}

function RoomCardSkeleton() {
  return (
    <div className={`${SKETCH} bg-white p-5 animate-pulse`}>
      <div
        className={`mb-4 flex h-32 items-center justify-center ${SKETCH_SOFT} bg-gray-300`}
      />
      <div className="mb-2 h-3 w-20 bg-gray-300 rounded" />
      <div className="mb-3 h-6 w-32 bg-gray-300 rounded" />
      <div className="flex justify-between">
        <div className="h-3 w-20 bg-gray-300 rounded" />
        <div className="h-3 w-12 bg-gray-300 rounded" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchRooms = async () => {
      const data = await getRooms(accessToken);
      setRooms(data);
      setLoading(false);
    };
    fetchRooms();
  }, [accessToken]);

  return (
    <div className="min-h-screen bg-[#fdfcf7] text-[#1a1a2e]">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="font-bold text-xl">
          Scribbly
        </Link>

        <Link href="/signin" className="text-sm">
          Account
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-6">
        <h1 className="mb-2 font-[Caveat,ui-sans-serif] text-5xl font-bold">
          Joined rooms
        </h1>

        <p className="mb-8 text-sm text-black/60">
          {loading ? "Loading..." : `${rooms.length} canvas available`}
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <>
              <RoomCardSkeleton />
              <RoomCardSkeleton />
              <RoomCardSkeleton />
            </>
          ) : (
            rooms.map((room, i) => (
              <RoomCard key={room.id} room={room} idx={i} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
