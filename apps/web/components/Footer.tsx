import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t-2 border-[#1a1a2e]/80 px-6 py-10 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
        <Logo />
        <p className="text-sm text-slate-600">© 2026 Scribbly. Made with squiggly lines.</p>
        <div className="flex gap-5 text-sm">
          <a href="#" className="hover:text-purple-600">Twitter</a>
          <a href="#" className="hover:text-purple-600">GitHub</a>
          <a href="#" className="hover:text-purple-600">Discord</a>
        </div>
      </div>
    </footer>
  );
}