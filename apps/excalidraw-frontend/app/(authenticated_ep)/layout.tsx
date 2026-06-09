import { getAccessTokenCookie } from "@/lib/auth.server";
import { WsProvider } from "@/context/wsContext";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const accessToken = await getAccessTokenCookie();

  if (!accessToken) {
    redirect("/signin");
  }

  return <WsProvider token={accessToken}>{children}</WsProvider>;
}
