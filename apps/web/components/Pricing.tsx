export default function Pricing() {
  const tiers = [
    { name: "Free", price: "$0", tagline: "For solo sketchers", features: ["Unlimited boards", "Local-first storage", "Export to PNG / SVG", "Community support"], cta: "Start drawing", highlight: false },
    { name: "Team", price: "$8", tagline: "per editor / month", features: ["Everything in Free", "Real-time collaboration", "Shared workspaces", "Version history (90d)", "Priority support"], cta: "Try Team free", highlight: true },
    { name: "Self-host", price: "Free", tagline: "MIT licensed", features: ["Full source code", "Run on your infra", "Bring your own auth", "No telemetry"], cta: "Read the docs", highlight: false },
  ];
  return (
    <section id="pricing" className="px-6 py-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-4xl font-bold md:text-5xl">Simple, honest pricing.</h2>
          <p className="mt-3 text-lg text-slate-600">Free forever for individuals. Pay when your team grows.</p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <div key={t.name} className={`sketch p-7 ${t.highlight ? "bg-amber-100" : "bg-white"}`} style={{ transform: `rotate(${(i - 1) * 0.5}deg)` }}>
              {t.highlight && (
                <span className="sketch-soft mb-4 inline-block bg-purple-600 px-3 py-1 text-xs font-semibold text-white">Most popular</span>
              )}
              <h3 className="text-3xl font-bold">{t.name}</h3>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-5xl font-bold">{t.price}</span>
                <span className="text-sm text-slate-600">{t.tagline}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-purple-600">✓</span>{f}
                  </li>
                ))}
              </ul>
              <a href="#" className={`sketch mt-7 block text-center px-5 py-3 font-semibold transition-transform hover:-translate-y-0.5 ${t.highlight ? "bg-purple-600 text-white" : "bg-white"}`}>{t.cta}</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}