export default function Templates() {
  const tpl = [
    { name: "Flowchart", color: "bg-blue-200", icon: "🔀" },
    { name: "Mind map", color: "bg-pink-200", icon: "🧠" },
    { name: "Retrospective", color: "bg-amber-200", icon: "🔁" },
    { name: "Wireframe", color: "bg-emerald-200", icon: "📱" },
  ];
  return (
    <section id="templates" className="px-6 py-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-bold md:text-5xl">Start from a template.</h2>
            <p className="mt-3 text-lg text-slate-600">Skip the blank canvas. Pick a starting point and ride.</p>
          </div>
          <a href="#" className="text-sm font-semibold underline-offset-4 hover:underline">Browse all 60+ →</a>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tpl.map((t, i) => (
            <a key={t.name} href="#" className="sketch group block aspect-[4/3] overflow-hidden bg-white p-4 transition-transform hover:-translate-y-1" style={{ transform: `rotate(${(i - 1.5) * 0.7}deg)` }}>
              <div className={`sketch-soft ${t.color} flex h-full w-full items-center justify-center text-5xl`}>{t.icon}</div>
              <p className="mt-3 text-center font-[Caveat,ui-sans-serif] text-xl font-bold">{t.name}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}