import { useCallback, useRef } from "react";
import { SceneStore } from "@/src/scene/SceneStore";
import { Camera } from "@/src/scene/Camera";
import { renderCanvas } from "@/src/utils/renderCanvas";
import { toolRegistry } from "@/src/tools";
import { Tool } from "@/src/types/shapes";
import { selectTool } from "@/src/tools/selectTool";

export function useRenderScheduler(
  ctxRef: React.RefObject<CanvasRenderingContext2D | null>,
  sceneRef: React.RefObject<SceneStore>,
  cameraRef: React.RefObject<Camera>,
  activeToolRef: React.RefObject<Tool>,
) {
  const rafRef = useRef<number | null>(null);

  const scheduleRender = useCallback(() => {
    if (rafRef.current !== null) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const ctx = ctxRef.current;
      if (!ctx) return;
      const draft = toolRegistry[activeToolRef.current].getDraft();
      const selectionRect = selectTool.getSelectionRect?.() ?? null;
      renderCanvas(
        ctx,
        sceneRef.current,
        cameraRef.current,
        draft,
        selectionRect,
      );
    });
  }, [ctxRef, sceneRef, cameraRef, activeToolRef]);

  return scheduleRender;
}
