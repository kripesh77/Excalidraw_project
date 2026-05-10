import Link from "next/link";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-[#1a1a2e]">
      <svg
        width="36"
        height="36"
        viewBox="0 0 40 40"
        fill="none"
        className="-rotate-6"
      >
        <path
          d="M6 30 Q 12 8 22 14 T 34 28"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle
          cx="32"
          cy="10"
          r="3"
          fill="#fbbf24"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      <span className="font-[Caveat,ui-sans-serif] text-2xl font-bold">
        Scribbly
      </span>
    </Link>
  );
}

export default function AuthNav() {
  return (
    <header className="flex items-center justify-between px-6 py-5 md:px-10">
      <Logo />
      <Link href="/" className="text-sm font-medium hover:text-purple-600">
        ← Back home
      </Link>
    </header>
  );
}
