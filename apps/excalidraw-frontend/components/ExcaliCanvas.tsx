"use client";

import { useState } from "react";
import ExcaliSelector from "./ExcaliSelector";
import { useExcaliCanvas } from "@/hooks/useExcaliCanvas";

export default function ExcaliCanvas({
  initialMessages = [],
}: {
  initialMessages: string[];
}) {
  const [isGrabbing, setIsGrabbing] = useState(false);
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
          className={
            tool === "pan"
              ? isGrabbing
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-crosshair"
          }
          onMouseDown={(e) => {
            setIsGrabbing(true);
            onMouseDown(e);
          }}
          onMouseMove={onMouseMove}
          onMouseUp={(e) => {
            setIsGrabbing(false);
            onMouseUp(e);
          }}
          onMouseLeave={(e) => {
            setIsGrabbing(false);
            onMouseUp(e);
          }}
          onWheel={onWheel}
        />
      </div>
    </>
  );
}
