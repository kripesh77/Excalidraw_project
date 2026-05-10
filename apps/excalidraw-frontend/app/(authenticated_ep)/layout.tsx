import { AuthProvider } from "@/context/authContext";
import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    redirect("/api/auth");
  }

  let accessToken: string;

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    );
    accessToken = response.data.data.accessToken;
  } catch (e: unknown) {
    redirect("/api/auth");
  }
  return (
    <AuthProvider token={accessToken}>
      <div>{children}</div>
    </AuthProvider>
  );
}
