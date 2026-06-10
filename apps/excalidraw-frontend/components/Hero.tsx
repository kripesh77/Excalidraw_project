import Link from "next/link";
import CanvasPreview from "./CanvasPreview";

export default function Hero() {
  return (
    <section className="relative px-6 pt-10 pb-20 md:px-10 md:pt-16">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <h1 className="mt-6 text-5xl leading-[1.05] font-bold md:text-7xl">
            Whiteboards that{" "}
            <span className="relative inline-block">
              feel
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 8 Q 50 2 100 7 T 198 6"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            hand-drawn.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-slate-600">
            ProbabliDraw is a delightfully simple virtual whiteboard. Sketch
            diagrams, wireframe ideas, and collaborate in real-time — all with
            that warm, hand-drawn charm.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="sketch bg-purple-600 px-6 py-3 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 hover:rotate-[-1deg]"
            >
              Start drawing — it's free
            </Link>
            <a
              href="https://github.com/kripesh77/excalidraw_project"
              target="blank"
              className="sketch bg-white px-6 py-3 text-base font-semibold transition-transform hover:-translate-y-0.5 hover:rotate-[1deg]"
            >
              ⭐ Star on GitHub
            </a>
          </div>
          <p className="mt-5 text-sm text-slate-600">
            No account needed. Open-source. End-to-end encrypted rooms.
          </p>
        </div>
        <CanvasPreview />
      </div>
    </section>
  );
}
