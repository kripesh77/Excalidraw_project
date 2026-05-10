import Link from "next/link";
import Logo from "./Logo";

export default function Nav() {
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
        <Link href="#" className="hover:text-purple-600">
          GitHub
        </Link>
      </nav>
      <div className="flex items-center gap-3">
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
      </div>
    </header>
  );
}
