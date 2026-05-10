export default function Features() {
  const items = [
    { icon: "✏️", title: "Hand-drawn feel", body: "Every shape, line, and arrow looks like you sketched it yourself. Charming, not sterile.", color: "bg-amber-200" },
    { icon: "👥", title: "Real-time collab", body: "Live cursors, shared rooms, and zero setup. Just send a link and start drawing together.", color: "bg-pink-300" },
    { icon: "🔒", title: "End-to-end encrypted", body: "Your boards stay yours. Encrypted rooms mean even we can't peek at your ideas.", color: "bg-blue-300" },
    { icon: "📦", title: "Export anywhere", body: "PNG, SVG, or copy-paste straight into Figma, Notion, or your favorite doc.", color: "bg-emerald-300" },
    { icon: "🧩", title: "Libraries & templates", body: "Pre-made shapes for flowcharts, wireframes, system diagrams, and retros.", color: "bg-amber-200" },
    { icon: "💻", title: "Open source", body: "MIT-licensed. Self-host it, fork it, or contribute on GitHub.", color: "bg-pink-300" },
  ];
  return (
    <section id="features" className="px-6 py-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold md:text-5xl">
            Everything you need to{" "}
            <span className="relative inline-block">
              think visually
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M2 8 Q 50 2 100 7 T 198 6" fill="none" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            .
          </h2>
          <p className="mt-4 text-lg text-slate-600">A focused toolset for sketching, diagramming, and brainstorming. No bloat, no learning curve.</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <div key={it.title} className="sketch bg-white p-6 transition-transform hover:-translate-y-1" style={{ transform: `rotate(${i % 2 ? 0.6 : -0.6}deg)` }}>
              <div className={`sketch-soft ${it.color} mb-4 flex h-12 w-12 items-center justify-center text-2xl`}>{it.icon}</div>
              <h3 className="text-2xl font-bold">{it.title}</h3>
              <p className="mt-2 text-slate-600">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}