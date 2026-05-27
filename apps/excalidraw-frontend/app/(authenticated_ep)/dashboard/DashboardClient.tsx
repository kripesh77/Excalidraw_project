"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/Modal";
import { JoinRoomModal } from "@/components/JoinRoomModal";
import { CreateRoomModal } from "@/components/CreateRoomModal";

export type Room = {
  id: number;
  slug: string;
  createdAt: string;
};

const SKETCH =
  "border-2 border-[#1a1a2e] rounded-[14px_18px_12px_22px/18px_12px_20px_14px] shadow-[4px_4px_0_0_#1a1a2e]";
const SKETCH_SOFT =
  "border-2 border-[#1a1a2e] rounded-[18px_14px_22px_12px/14px_20px_12px_18px]";

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

function RoomCard({ room, idx }: { room: Room; idx: number }) {
  const palette = [
    { bg: "#fef3c7", ink: "#92400e", tag: "#fbbf24" },
    { bg: "#dbeafe", ink: "#1e40af", tag: "#60a5fa" },
    { bg: "#fce7f3", ink: "#9d174d", tag: "#f472b6" },
  ][idx % 3];

  return (
    <Link
      href={`/canvas/${room.slug}`}
      prefetch={false}
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

export default function DashboardClient({ rooms }: { rooms: Room[] }) {
  const [modal, setModal] = useState<"join" | "create" | null>(null);

  function setModalNull() {
    setModal(null);
  }

  return (
    <>
      {modal && (
        <Modal onClick={setModalNull}>
          {modal === "join" && <JoinRoomModal onSuccess={setModalNull} />}
          {modal === "create" && <CreateRoomModal onSuccess={setModalNull} />}
        </Modal>
      )}
      <div className="min-h-screen bg-[#fdfcf7] text-[#1a1a2e]">
        <header className="flex flex-wrap items-center justify-between px-6 py-5">
          <Link href="/" className="font-bold text-xl">
            Scribbly
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setModal("join")}
              className="text-sm font-medium hover:text-purple-600 cursor-pointer"
            >
              Join Room
            </button>
            <button
              onClick={() => setModal("create")}
              className="sketch bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              Create Room
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 pb-20 pt-6">
          <h1 className="mb-2 font-[Caveat,ui-sans-serif] text-5xl font-bold">
            Joined rooms
          </h1>

          <p className="mb-8 text-sm text-black/60">
            {rooms.length} canvas available
          </p>

          {rooms.length === 0 ? (
            <div className="text-sm text-black/60">No rooms yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room, i) => (
                <RoomCard key={room.id} room={room} idx={i} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
