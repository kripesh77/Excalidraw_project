"use client";

import {
  Hand,
  MousePointer2,
  Square,
  Circle,
  Slash,
  Pencil,
  Type,
} from "lucide-react";
import { Tool } from "@/src/types/shapes";

const TOOLS: {
  id: Tool;
  label: string;
  icon: typeof Hand;
  shortcut: string;
}[] = [
  { id: "pan", label: "Pan", icon: Hand, shortcut: "H" },
  { id: "select", label: "Select", icon: MousePointer2, shortcut: "V" },
  { id: "rect", label: "Rectangle", icon: Square, shortcut: "R" },
  { id: "ellipse", label: "Ellipse", icon: Circle, shortcut: "O" },
  { id: "line", label: "Line", icon: Slash, shortcut: "L" },
  { id: "free", label: "Draw", icon: Pencil, shortcut: "P" },
  { id: "text", label: "Text", icon: Type, shortcut: "T" },
];

export function Toolbar({
  activeTool,
  onSelect,
}: {
  activeTool: Tool;
  onSelect: (tool: Tool) => void;
}) {
  return (
    <div className="absolute left-1/2 top-5 -translate-x-1/2 z-10 flex items-center gap-0.5 bg-white border border-black/10 rounded-xl px-1.5 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08)]">
      {TOOLS.map((t, i) => {
        const Icon = t.icon;
        const isActive = activeTool === t.id;
        return (
          <div key={t.id} className="flex items-center">
            {i === 2 && <div className="w-px h-6 bg-black/8 mx-1" />}
            <button
              type="button"
              title={`${t.label} (${t.shortcut})`}
              onClick={() => onSelect(t.id)}
              aria-pressed={isActive}
              className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-100 cursor-pointer
                ${
                  isActive
                    ? "bg-violet-100 text-violet-700"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                }
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400`}
            >
              <Icon size={18} strokeWidth={2} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
