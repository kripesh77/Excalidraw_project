"use client";
import { ButtonIcon } from "./ButtonIcon";
import { CircleIcon } from "./CircleIcon";
import { LineIcon } from "./LineIcon";
import { RectIcon } from "./RectIcon";
import { HandIcon } from "./HandIcon";
import { Tool } from "@/hooks/useExcaliCanvas";

export default function ExcaliSelector({
  selectedTool,
  handleSelected,
}: {
  selectedTool: Tool;
  handleSelected: (sel: Tool) => void;
}) {
  return (
    <div className="fixed left-1/2 top-10 -translate-1/2">
      <div className="flex gap-2 bg-[#ffffff] shadow rounded-sm items-center justify-center">
        <ButtonIcon>
          <HandIcon
            selected={selectedTool === "pan"}
            onSelect={handleSelected}
          />
        </ButtonIcon>
        <ButtonIcon>
          <RectIcon
            selected={selectedTool === "rect"}
            onSelect={handleSelected}
          />
        </ButtonIcon>
        <ButtonIcon>
          <CircleIcon
            selected={selectedTool === "ellipse"}
            onSelect={handleSelected}
          />
        </ButtonIcon>
        <ButtonIcon>
          <LineIcon
            selected={selectedTool === "line"}
            onSelect={handleSelected}
          />
        </ButtonIcon>
      </div>
    </div>
  );
}
