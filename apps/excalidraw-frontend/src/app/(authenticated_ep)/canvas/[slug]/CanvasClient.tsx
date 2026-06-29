"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useCanvasSetup } from "@/src/hooks/useCanvasSetup";
import { useCamera } from "@/src/hooks/useCamera";
import { useToolHandler } from "@/src/hooks/useToolHandler";
import { useRenderScheduler } from "@/src/hooks/useRenderScheduler";
import { useShapeSync } from "@/src/hooks/useShapeSync";
import { SceneStore } from "@/src/scene/SceneStore";
import { Toolbar } from "@/src/components/Toolbar";
import { Shape, Tool } from "@/src/types/shapes";
import { toolRegistry } from "@/src/tools";
import { renderCanvas } from "@/src/utils/renderCanvas";

export default function CanvasClient({
  slug,
  shapes,
}: {
  slug: string;
  shapes: Shape[];
}) {
  const sceneRef = useRef(new SceneStore(shapes));

  const [tool, setToolState] = useState<Tool>("rect");
  const toolRef = useRef<Tool>("rect");

  const { cameraRef, screenToWorld, applyZoom } = useCamera();
  const { canvasRef, ctxRef } = useCanvasSetup(sceneRef, cameraRef, toolRef);

  const scheduleRender = useRenderScheduler(
    ctxRef,
    sceneRef,
    cameraRef,
    toolRef,
  );

  const { sendShape, deleteSelectedShapes } = useShapeSync(
    slug,
    sceneRef,
    scheduleRender,
  );

  const { onMouseDown, onMouseMove, onMouseUp } = useToolHandler(
    ctxRef,
    sceneRef,
    cameraRef,
    screenToWorld,
    tool,
    scheduleRender,
    sendShape,
  );

  useEffect(() => {
    scheduleRender();
  }, [scheduleRender]);

  const setTool = useCallback(
    (next: Tool) => {
      const ctx = {
        scene: sceneRef.current,
        camera: cameraRef.current,
        screenToWorld,
        scheduleRender,
        send: sendShape,
      };
      toolRegistry[toolRef.current].onDeactivate?.(ctx);
      toolRef.current = next;
      setToolState(next);
      scheduleRender();
    },
    [cameraRef, screenToWorld, scheduleRender, sendShape],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (document.activeElement?.tagName === "INPUT") return;
      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelectedShapes([...sceneRef.current.getSelectedIds()]);
        sceneRef.current.deleteSelected();
        scheduleRender();
      }
      if (e.key === "Escape") {
        sceneRef.current.clearSelection();
        scheduleRender();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [scheduleRender, deleteSelectedShapes]);

  function handleWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    e.preventDefault();
    applyZoom(e.clientX, e.clientY, e.deltaY);
    scheduleRender();
  }

  const cursor =
    tool === "pan"
      ? "cursor-grab"
      : tool === "select"
        ? "cursor-default"
        : tool === "free"
          ? "cursor-cell"
          : "cursor-crosshair";

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Toolbar activeTool={tool} onSelect={setTool} />
      <canvas
        ref={canvasRef}
        className={`block w-screen h-screen ${cursor}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={handleWheel}
      />
    </div>
  );
}
