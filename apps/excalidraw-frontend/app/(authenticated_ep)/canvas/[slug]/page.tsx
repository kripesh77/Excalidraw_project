import ExcaliCanvas from "@/components/ExcaliCanvas";
import { getValidAccessToken, getRefreshTokenCookie } from "@/lib/auth.server";
import { redirect } from "next/navigation";

export default async function Page() {
  const refreshToken = await getRefreshTokenCookie();

  if (!refreshToken) {
    redirect("/api/auth");
  }

  const accessToken = await getValidAccessToken(false);

  if (!accessToken) {
    redirect("/api/auth");
  }

  return <ExcaliCanvas />;
}
