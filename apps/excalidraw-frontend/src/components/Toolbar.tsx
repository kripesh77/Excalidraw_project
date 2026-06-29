"use client";

import { Tool } from "@/src/types/shapes";

const TOOLS: { id: Tool; label: string; icon: string }[] = [
  { id: "pan", label: "Pan", icon: "✋" },
  { id: "select", label: "Select", icon: "▲" },
  { id: "rect", label: "Rectangle", icon: "▭" },
  { id: "ellipse", label: "Ellipse", icon: "○" },
  { id: "line", label: "Line", icon: "╱" },
  { id: "free", label: "Freehand", icon: "✏️" },
];

export function Toolbar({
  activeTool,
  onSelect,
}: {
  activeTool: Tool;
  onSelect: (tool: Tool) => void;
}) {
  return (
    <div className="absolute left-1/2 top-4 -translate-x-1/2 z-10 flex gap-1 items-center bg-white border border-[#1a1a2e] rounded-md px-2 py-1.5">
      {TOOLS.map((t, i) => (
        <>
          {/* Divider before select and before text */}
          {(i === 1 || i === 6) && (
            <div className="w-px h-6 bg-[#1a1a2e]/20 mx-1" />
          )}
          <button
            key={t.id}
            title={t.label}
            onClick={() => onSelect(t.id)}
            className={`w-9 h-9 rounded-[10px_12px_8px_14px/12px_8px_12px_10px] text-lg transition-all cursor-pointer
              ${
                activeTool === t.id
                  ? "bg-[#E0DFFF] text-black"
                  : "text-[#1a1a2e] hover:bg-[#E0DFFF]"
              }`}
          >
            {t.icon}
          </button>
        </>
      ))}
    </div>
  );
}
