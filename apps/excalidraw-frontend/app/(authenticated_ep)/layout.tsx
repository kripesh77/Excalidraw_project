import { getValidAccessToken, getRefreshTokenCookie } from "@/lib/auth.server";
import { WsProvider } from "@/context/wsContext";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const refreshToken = await getRefreshTokenCookie();

  if (!refreshToken) {
    redirect("/api/auth");
  }

  // Read access token without attempting to set cookies here.
  let accessToken = await getValidAccessToken(false);

  if (!accessToken) {
    // Call the dedicated refresh route which is allowed to mutate cookies.
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/auth/refresh`,
      {
        method: "POST",
        cache: "no-store",
      },
    );
    if (res.ok) {
      const json = await res.json().catch(() => ({}));
      accessToken = json?.accessToken ?? null;
    }
  }

  if (!accessToken) {
    redirect("/api/auth");
  }

  return <WsProvider token={accessToken}>{children}</WsProvider>;
}
