"use client";

import Link from "next/link";
import InputField from "@/components/InputField";
import { useActionState } from "react";
import { signin } from "@/lib/actions";
import { SigninActionState } from "@/lib/types";

export default function SignIn() {
  const [data, action, isPending] = useActionState(
    signin as (
      state: SigninActionState | undefined,
      payload: FormData,
    ) => Promise<SigninActionState | undefined>,
    undefined,
  );

  return (
    <main className="relative grid place-items-center px-6 py-10 md:py-16">
      {/* floating doodles */}
      <svg
        className="pointer-events-none absolute left-8 top-4 hidden md:block"
        width="120"
        height="80"
        viewBox="0 0 120 80"
        fill="none"
      >
        <path
          d="M5 60 Q 30 10 60 40 T 115 25"
          stroke="#7c3aed"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M100 30 l 12 -5 M115 25 l 8 17"
          stroke="#7c3aed"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <svg
        className="pointer-events-none absolute right-12 bottom-10 hidden md:block rotate-12"
        width="90"
        height="90"
        viewBox="0 0 90 90"
        fill="none"
      >
        <circle
          cx="45"
          cy="45"
          r="30"
          stroke="#1a1a2e"
          strokeWidth="2.5"
          fill="#fde68a"
        />
        <path
          d="M30 45 q 15 18 30 0"
          stroke="#1a1a2e"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="35" cy="38" r="2" fill="#1a1a2e" />
        <circle cx="55" cy="38" r="2" fill="#1a1a2e" />
      </svg>

      <div className="sketch relative w-full max-w-md bg-white p-8 md:p-10">
        {/* sticky tag */}
        <div className="sketch-soft absolute -top-5 -right-5 rotate-6 bg-amber-200 px-3 py-1 text-xs font-bold">
          ✏️ welcome back
        </div>

        <h1 className="font-[Caveat,ui-sans-serif] text-5xl font-bold leading-none">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-[#1a1a2e]/70">
          Pick up your sketches where you left off.
        </p>

        <form className="grid gap-4 mt-8" action={action}>
          <InputField
            data={data}
            label="Email"
            name="email"
            inputType="email"
            placeholder="you@studio.com"
          />

          <InputField
            data={data}
            label="Password"
            name="password"
            inputType="password"
            placeholder="••••••••"
            rightLabel={
              <a
                href="#"
                className="text-xs font-medium text-purple-600 hover:underline"
              >
                Forgot password?
              </a>
            }
          />

          <button
            type="submit"
            className="sketch cursor-pointer mt-1 bg-purple-600 px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            disabled={isPending}
          >
            Sign in →
          </button>
        </form>

        <p className="mt-6 text-center text-sm flex justify-center gap-2">
          New here?
          <Link
            href="/signup"
            className="font-bold text-purple-600 underline decoration-wavy underline-offset-4"
          >
            Signup
          </Link>
        </p>
      </div>
    </main>
  );
}
