import { redirect } from "next/navigation";
import {
  getRefreshTokenCookie,
  getValidAccessToken,
} from "@/src/lib/auth.server";
import CanvasClient from "./CanvasClient";
import { Shape } from "@/src/types/shapes";

async function fetchShapes(accessToken: string, slug: string) {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL;

  const res = await fetch(`${base}/api/v1/room/shapes/${slug}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { tags: ["shapes"] },
  });

  const json = await res.json().catch(() => ({}));

  return { res, json };
}

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const refreshToken = await getRefreshTokenCookie();
  if (!refreshToken) redirect("/api/auth");

  const accessToken = await getValidAccessToken(false);
  if (!accessToken) redirect("/api/auth");

  const { slug } = await params;
  const { json } = await fetchShapes(accessToken, slug);
  const shapes = json?.data || [];
  const s = shapes.map((shape: { data: Shape }) => shape.data);

  return <CanvasClient slug={slug} shapes={s} />;
}
