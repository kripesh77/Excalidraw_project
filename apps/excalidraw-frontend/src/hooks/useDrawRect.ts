import { useRef, useCallback } from "react";
import { SceneStore } from "@/src/scene/SceneStore";
import { RectShape } from "@/src/types/shapes";
import { Camera } from "@/src/scene/Camera";

type Point = { x: number; y: number };

function drawRect(ctx: CanvasRenderingContext2D, shape: RectShape) {
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 2;
  ctx.strokeRect(
    shape.startX,
    shape.startY,
    shape.endX - shape.startX,
    shape.endY - shape.startY,
  );
}

export function renderScene(
  ctx: CanvasRenderingContext2D,
  scene: SceneStore,
  camera: Camera,
  draft: RectShape | null,
) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);

  ctx.save();
  ctx.setTransform(
    camera.zoom,
    0,
    0,
    camera.zoom,
    camera.offsetX,
    camera.offsetY,
  );

  for (const shape of scene.getShapes()) {
    drawRect(ctx, shape as RectShape);
  }

  if (draft) {
    drawRect(ctx, draft);
  }

  ctx.restore();
}

export function useDrawRect(
  ctxRef: React.RefObject<CanvasRenderingContext2D | null>,
  sceneRef: React.RefObject<SceneStore>,
  screenToWorld: (x: number, y: number) => Point,
  cameraRef: React.RefObject<Camera>,
) {
  const startRef = useRef<Point | null>(null);
  const draftRef = useRef<RectShape | null>(null);

  const redraw = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    renderScene(ctx, sceneRef.current, cameraRef.current, draftRef.current);
  }, [ctxRef, sceneRef, cameraRef]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      startRef.current = screenToWorld(e.clientX, e.clientY);
    },
    [screenToWorld],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!startRef.current) return;
      const worldPos = screenToWorld(e.clientX, e.clientY);

      draftRef.current = {
        id: "",
        type: "rect",
        startX: startRef.current.x,
        startY: startRef.current.y,
        endX: worldPos.x,
        endY: worldPos.y,
      };

      redraw();
    },
    [screenToWorld, redraw],
  );

  const onMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!startRef.current) return;
      const worldPos = screenToWorld(e.clientX, e.clientY);

      sceneRef.current.addShape({
        id: crypto.randomUUID(),
        type: "rect",
        startX: startRef.current.x,
        startY: startRef.current.y,
        endX: worldPos.x,
        endY: worldPos.y,
      });

      draftRef.current = null;
      startRef.current = null;
      redraw();
    },
    [screenToWorld, sceneRef, redraw],
  );

  return { onMouseDown, onMouseMove, onMouseUp, redraw };
}
