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

  const accessToken = await getValidAccessToken(false);

  if (!accessToken) {
    redirect("/api/auth");
  }

  return <WsProvider token={accessToken}>{children}</WsProvider>;
}
