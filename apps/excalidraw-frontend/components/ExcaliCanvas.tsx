"use client";

import ExcaliSelector from "./ExcaliSelector";
import { useExcaliCanvas } from "@/hooks/useExcaliCanvas";

export default function ExcaliCanvas({
  initialMessages = [],
}: {
  initialMessages: string[];
}) {
  const {
    canvasRef,
    tool,
    setTool,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
  } = useExcaliCanvas(initialMessages);

  return (
    <>
      <ExcaliSelector selectedTool={tool} handleSelected={setTool} />

      <div className="h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className={tool === "pan" ? "cursor-grab" : "cursor-crosshair"}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
        />
      </div>
    </>
  );
}
