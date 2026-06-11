"use client";

import { useEffect, useRef } from "react";
import { useCamera } from "./useCamera";
import { useRenderScheduler } from "./useRenderScheduler";

export function useExcalidrawEngine({
  canvasRef,
  ctxRef,
  shapesRef,
  draftRef,
  tool,
  setCursor,
  sendData,
  params,
  scheduleRenderRef,
}: any) {
  const isDrawing = useRef(false);
  const isPanning = useRef(false);

  const start = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const shift = useRef(false);

  const { cameraRef, screenToWorld, applyZoom, panBy } = useCamera();

  const render = useRef(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    ctx.translate(cameraRef.current.offsetX, cameraRef.current.offsetY);
    ctx.scale(cameraRef.current.zoom, cameraRef.current.zoom);

    const draw = (shape: any) => {
      ctx.beginPath();

      if (shape.type === "rect") {
        ctx.strokeRect(
          shape.startX,
          shape.startY,
          shape.endX - shape.startX,
          shape.endY - shape.startY,
        );
      }

      if (shape.type === "ellipse") {
        ctx.ellipse(
          shape.centerX,
          shape.centerY,
          shape.radiusX,
          shape.radiusY,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }

      if (shape.type === "line") {
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();
      }
    };

    shapesRef.current.forEach(draw);

    if (draftRef.current) draw(draftRef.current);

    ctx.restore();
  });

  const scheduleRender = useRenderScheduler(render.current);

  // expose scheduler
  scheduleRenderRef.current = scheduleRender;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        shift.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        shift.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "pan") {
      isPanning.current = true;

      panStart.current = {
        x: e.clientX,
        y: e.clientY,
      };

      setCursor?.("grabbing");
      return;
    }

    isDrawing.current = true;

    const p = screenToWorld(e.clientX, e.clientY);

    start.current = p;
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning.current) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;

      panBy(dx, dy);

      panStart.current = { x: e.clientX, y: e.clientY };

      scheduleRender();
      return;
    }

    if (!isDrawing.current) return;

    const p = screenToWorld(e.clientX, e.clientY);

    const x = p.x;
    const y = p.y;

    const sx = start.current.x;
    const sy = start.current.y;

    if (tool === "rect") {
      draftRef.current = {
        type: "rect",
        startX: sx,
        startY: sy,
        endX: x,
        endY: y,
      };
    }

    if (tool === "line") {
      draftRef.current = {
        type: "line",
        startX: sx,
        startY: sy,
        endX: x,
        endY: y,
      };
    }

    if (tool === "ellipse") {
      let w = Math.abs(x - sx);
      let h = Math.abs(y - sy);

      if (shift.current) {
        const size = Math.max(w, h);
        w = h = size;
      }

      const dx = x - sx;
      const dy = y - sy;

      const endX = sx + w * (dx < 0 ? -1 : 1);
      const endY = sy + h * (dy < 0 ? -1 : 1);

      draftRef.current = {
        type: "ellipse",
        centerX: (sx + endX) / 2,
        centerY: (sy + endY) / 2,
        radiusX: w / 2,
        radiusY: h / 2,
      };
    }

    scheduleRender();
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning.current) {
      isPanning.current = false;
      setCursor?.("grab");
      return;
    }

    if (!draftRef.current) {
      isDrawing.current = false;
      return;
    }

    shapesRef.current.push(draftRef.current);

    sendData({
      type: "chat",
      slug: params.slug,
      message: draftRef.current,
    });

    draftRef.current = null;
    isDrawing.current = false;

    scheduleRender();
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    applyZoom(e.clientX, e.clientY, e.deltaY);

    scheduleRender();
  };

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
    cameraRef,
    scheduleRender,
  };
}
