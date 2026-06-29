import { useRef, useCallback, useEffect } from "react";
import { Shape, Tool } from "@/src/types/shapes";
import { SceneStore } from "@/src/scene/SceneStore";
import { Camera } from "@/src/scene/Camera";
import { toolRegistry } from "@/src/tools";
import { ToolContext } from "@/src/tools/types";

export function useToolHandler(
  ctxRef: React.RefObject<CanvasRenderingContext2D | null>,
  sceneRef: React.RefObject<SceneStore>,
  cameraRef: React.RefObject<Camera>,
  screenToWorld: (x: number, y: number) => { x: number; y: number },
  activeTool: Tool,
  scheduleRender: () => void,
  sendShape: (shape: Shape) => void,
) {
  const activeToolRef = useRef<Tool>(activeTool);

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  const buildCtx = useCallback(
    (): ToolContext => ({
      scene: sceneRef.current,
      camera: cameraRef.current,
      screenToWorld,
      scheduleRender,
      send: sendShape,
    }),
    [sceneRef, cameraRef, screenToWorld, scheduleRender, sendShape],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const point = screenToWorld(e.clientX, e.clientY);
      toolRegistry[activeToolRef.current].onPointerDown(point, e, buildCtx());
    },
    [screenToWorld, buildCtx],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const point = screenToWorld(e.clientX, e.clientY);
      toolRegistry[activeToolRef.current].onPointerMove(point, e, buildCtx());
    },
    [screenToWorld, buildCtx],
  );

  const onMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const point = screenToWorld(e.clientX, e.clientY);
      toolRegistry[activeToolRef.current].onPointerUp(point, e, buildCtx());
    },
    [screenToWorld, buildCtx],
  );

  const getDraft = useCallback(() => {
    return toolRegistry[activeToolRef.current].getDraft();
  }, []);

  return { onMouseDown, onMouseMove, onMouseUp, getDraft };
}
