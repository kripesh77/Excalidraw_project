export default function CanvasPreview() {
  return (
    <div className="sketch relative aspect-[4/3] w-full bg-white p-4 rotate-[1.5deg]">
      <div className="absolute -top-3 left-6 flex gap-2">
        <span className="h-3 w-3 rounded-full bg-pink-400" />
        <span className="h-3 w-3 rounded-full bg-amber-300" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
      </div>
      <svg viewBox="0 0 400 300" className="h-full w-full">
        <path d="M40 60 Q 42 58 130 62 T 220 60 Q 222 100 218 130 T 40 132 Q 38 100 40 60Z" fill="rgba(251,191,36,0.3)" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
        <text x="60" y="100" fontFamily="Caveat" fontSize="22" fill="#1a1a2e">Idea ✨</text>
        <path d="M225 95 Q 270 95 305 95" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M295 88 L 308 95 L 295 102" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="345" cy="95" rx="42" ry="38" fill="rgba(96,165,250,0.35)" stroke="#1a1a2e" strokeWidth="2" />
        <text x="320" y="100" fontFamily="Caveat" fontSize="18" fill="#1a1a2e">Ship it</text>
        <path d="M50 200 Q 80 180 110 200 T 170 200 T 230 200 T 290 200 T 350 200" stroke="#f472b6" strokeWidth="3" fill="none" strokeLinecap="round" />
        <g transform="translate(60 220) rotate(-4)">
          <rect width="120" height="60" fill="#fbbf24" stroke="#1a1a2e" strokeWidth="2" />
          <text x="14" y="28" fontFamily="Caveat" fontSize="14" fill="#1a1a2e">todo: launch</text>
          <text x="14" y="48" fontFamily="Caveat" fontSize="14" fill="#1a1a2e">on Friday!</text>
        </g>
        <g transform="translate(280 230)">
          <path d="M0 0 L 0 18 L 5 13 L 9 22 L 12 21 L 8 12 L 14 12 Z" fill="#9333ea" stroke="#1a1a2e" strokeWidth="1.5" />
          <rect x="14" y="20" width="50" height="16" rx="3" fill="#9333ea" />
          <text x="20" y="32" fontSize="10" fill="white" fontFamily="Inter">Maya</text>
        </g>
      </svg>
    </div>
  );
}