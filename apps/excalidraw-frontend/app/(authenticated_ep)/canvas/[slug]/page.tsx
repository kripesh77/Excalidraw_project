import ExcaliCanvas from "@/components/ExcaliCanvas";
import { getValidAccessToken, getRefreshTokenCookie } from "@/lib/auth.server";
import { redirect } from "next/navigation";

type ChatItem = {
  message: string;
  createdAt: string;
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const refreshToken = await getRefreshTokenCookie();

  if (!refreshToken) {
    redirect("/api/auth");
  }

  // Read without mutating cookies here; refresh via route if missing
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
      const j = await r.json().catch(() => ({}));
      accessToken = j?.accessToken ?? null;
    }
  }

  if (!accessToken) {
    redirect("/api/auth");
  }

  const fetchChats = (token: string) =>
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/room/chats/${slug}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

  let response = await fetchChats(accessToken);

  if (response.status === 401) {
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
        response = await fetchChats(accessToken);
      }
    }

    if (response.status === 401) {
      redirect("/api/auth");
    }
  }

  const json = await response.json().catch(() => null);
  const messages = Array.isArray(json?.data)
    ? (json.data as ChatItem[])
        .filter(
          (item) =>
            typeof item?.message === "string" &&
            typeof item?.createdAt === "string",
        )
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
        .map((item) => item.message)
    : [];

  return <ExcaliCanvas initialMessages={messages} />;
}
