import Link from "next/link";
import Logo from "./Logo";
import { cookies } from "next/headers";

export default async function Nav() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value || "";
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
      <Logo />
      <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
        <Link href="#features" className="hover:text-purple-600">
          Features
        </Link>
        <Link href="#templates" className="hover:text-purple-600">
          Templates
        </Link>
        <Link href="#pricing" className="hover:text-purple-600">
          Pricing
        </Link>
        <a
          href="https://github.com/kripesh77/excalidraw_project"
          target="blank"
          className="hover:text-purple-600"
        >
          GitHub
        </a>
      </nav>
      <div className="flex items-center gap-3">
        {!refreshToken ? (
          <>
            <Link
              href="/signin"
              className="hidden text-sm font-medium hover:text-purple-600 sm:inline"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="sketch bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Sign up →
            </Link>
          </>
        ) : (
          <Link
            href="dashboard"
            className="sketch bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Dashboard
          </Link>
        )}
      </div>
    </header>
  );
}
