import AuthNav from "@/components/AuthNav";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen">
      <AuthNav />
      {children}
    </div>
  );
}
