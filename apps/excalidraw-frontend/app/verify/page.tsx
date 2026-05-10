"use client";

import { useState } from "react";

const SKETCH =
  "border-2 border-[#1a1a2e] rounded-[14px_18px_12px_22px/18px_12px_20px_14px] shadow-[4px_4px_0_0_#1a1a2e]";
const SKETCH_SOFT =
  "border-2 border-[#1a1a2e] rounded-[18px_14px_22px_12px/14px_20px_12px_18px]";

export default function VerifyEmail() {
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleResend = () => {
    if (cooldown > 0) return;
    setResent(true);
    setCooldown(30);
    const id = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(id);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

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

      <div
        className={`${SKETCH} relative w-full max-w-lg bg-white p-8 md:p-12 text-center`}
      >
        {/* sticky tag */}
        <div
          className={`${SKETCH_SOFT} absolute -top-5 -left-5 -rotate-6 bg-emerald-200 px-3 py-1 text-xs font-bold`}
        >
          ✉️ check your inbox
        </div>

        {/* envelope illustration */}
        <div className="mx-auto mb-6 w-fit">
          <svg width="140" height="110" viewBox="0 0 140 110" fill="none">
            {/* envelope body */}
            <rect
              x="14"
              y="26"
              width="112"
              height="74"
              rx="6"
              fill="#fde68a"
              stroke="#1a1a2e"
              strokeWidth="2.5"
            />
            {/* flap */}
            <path
              d="M14 32 L70 70 L126 32"
              stroke="#1a1a2e"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* check badge */}
            <g transform="translate(92 8)">
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="#a78bfa"
                stroke="#1a1a2e"
                strokeWidth="2.5"
              />
              <path
                d="M11 21 l 6 6 l 12 -12"
                stroke="#1a1a2e"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </g>
            {/* sparkles */}
            <path
              d="M6 10 l 4 4 M10 10 l -4 4"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M130 90 l 4 4 M134 90 l -4 4"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1 className="font-[Caveat,ui-sans-serif] text-5xl font-bold leading-none">
          We&apos;ve sent you a link!
        </h1>
        <p className="mt-4 text-[#1a1a2e]/70">
          Tap the verification link in the email we just sent to{" "}
          <span className="font-semibold text-[#1a1a2e] underline decoration-wavy decoration-purple-500 underline-offset-4">
            your inbox
          </span>{" "}
          to activate your account and start scribbling.
        </p>

        {/* steps */}
        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          {[
            { n: "1", t: "Open your email", c: "bg-amber-100", r: -2 },
            { n: "2", t: "Click the link", c: "bg-rose-100", r: 1 },
            { n: "3", t: "Start drawing", c: "bg-emerald-100", r: -1 },
          ].map((s) => (
            <div
              key={s.n}
              className={`${s.c} border-2 border-[#1a1a2e] rounded-[12px_16px_10px_18px/14px_10px_18px_12px] px-3 py-2 text-sm font-semibold`}
              style={{ transform: `rotate(${s.r}deg)` }}
            >
              <span className="font-[Caveat,ui-sans-serif] text-xl mr-1.5">
                {s.n}.
              </span>
              {s.t}
            </div>
          ))}
        </div>

        {/* resend */}
        <div className="mt-8 border-t-2 border-dashed border-[#1a1a2e]/20 pt-6">
          <p className="text-sm text-[#1a1a2e]/70">
            Didn&apos;t get the email? Check spam, or
          </p>
          <button
            onClick={handleResend}
            disabled={cooldown > 0}
            className={`${SKETCH} mt-3 bg-purple-600 px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0`}
          >
            {cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend verification email"}
          </button>
          {resent && cooldown > 0 && (
            <p className="mt-3 font-[Caveat,ui-sans-serif] text-lg text-emerald-700">
              ✓ sent again — check your inbox!
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
