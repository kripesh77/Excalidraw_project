"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWs } from "@/context/wsContext";

import { renderCanvas } from "@/utils/renderCanvas";
import { zoomAtPoint } from "@/utils/camera";

export type Shape =
  | {
      type: "rect";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      type: "ellipse";
      centerX: number;
      centerY: number;
      radiusX: number;
      radiusY: number;
    }
  | {
      type: "line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    };

export type Tool = "rect" | "ellipse" | "line" | "pan";

type InteractionState = {
  drawing: boolean;
  startX: number;
  startY: number;
  shift: boolean;

  panning: boolean;
  panStartX: number;
  panStartY: number;
};

export type IconProps = { selected: boolean; onSelect: (sel: Tool) => void };

export function useExcaliCanvas(initialMessages: string[] = []) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const shapesRef = useRef<Shape[]>([]);
  const draftRef = useRef<Shape | null>(null);

  const cameraRef = useRef({
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  });

  const stateRef = useRef<InteractionState>({
    drawing: false,
    startX: 0,
    startY: 0,
    shift: false,

    panning: false,
    panStartX: 0,
    panStartY: 0,
  });

  const [tool, setTool] = useState<Tool>("pan");

  const rafRef = useRef<number | null>(null);
  const didLoadHistoryRef = useRef(false);

  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { joinRoom, leaveRoom, sendData, subscribe, connectionState } = useWs();

  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 4;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    if (!canvas || !ctx) return;

    renderCanvas(ctx, shapesRef.current, draftRef.current, cameraRef.current);
  }, []);

  const scheduleRender = useCallback(() => {
    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      render();
    });
  }, [render]);

  const screenToWorld = useCallback((x: number, y: number) => {
    const camera = cameraRef.current;

    return {
      x: (x - camera.offsetX) / camera.zoom,
      y: (y - camera.offsetY) / camera.zoom,
    };
  }, []);

  const pan = (dx: number, dy: number) => {
    cameraRef.current.offsetX += dx;
    cameraRef.current.offsetY += dy;
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "pan") {
      stateRef.current.panning = true;
      stateRef.current.panStartX = e.clientX;
      stateRef.current.panStartY = e.clientY;
      return;
    }

    const point = screenToWorld(e.clientX, e.clientY);

    stateRef.current.drawing = true;
    stateRef.current.startX = point.x;
    stateRef.current.startY = point.y;
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (stateRef.current.panning) {
      const dx = e.clientX - stateRef.current.panStartX;
      const dy = e.clientY - stateRef.current.panStartY;

      pan(dx, dy);

      stateRef.current.panStartX = e.clientX;
      stateRef.current.panStartY = e.clientY;

      scheduleRender();
      return;
    }

    if (!stateRef.current.drawing) return;

    const { startX, startY, shift } = stateRef.current;
    const { x, y } = screenToWorld(e.clientX, e.clientY);

    if (tool === "rect") {
      draftRef.current = {
        type: "rect",
        startX,
        startY,
        endX: x,
        endY: y,
      };
    }

    if (tool === "line") {
      draftRef.current = {
        type: "line",
        startX,
        startY,
        endX: x,
        endY: y,
      };
    }

    if (tool === "ellipse") {
      let w = Math.abs(x - startX);
      let h = Math.abs(y - startY);

      if (shift) {
        const size = Math.max(w, h);
        w = h = size;
      }

      const dx = x - startX;
      const dy = y - startY;

      const signX = dx < 0 ? -1 : 1;
      const signY = dy < 0 ? -1 : 1;

      const endX = startX + w * signX;
      const endY = startY + h * signY;

      draftRef.current = {
        type: "ellipse",
        centerX: (startX + endX) / 2,
        centerY: (startY + endY) / 2,
        radiusX: w / 2,
        radiusY: h / 2,
      };
    }

    scheduleRender();
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (stateRef.current.panning) {
      stateRef.current.panning = false;
      return;
    }

    if (!draftRef.current) {
      stateRef.current.drawing = false;
      return;
    }

    shapesRef.current.push(draftRef.current);

    sendData({
      type: "chat",
      slug: params.slug,
      message: draftRef.current,
    });

    draftRef.current = null;
    stateRef.current.drawing = false;

    scheduleRender();
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    zoomAtPoint(cameraRef.current, e.clientX, e.clientY, e.deltaY);

    scheduleRender();
  };

  // ---- history load ----
  useEffect(() => {
    if (didLoadHistoryRef.current) return;
    didLoadHistoryRef.current = true;

    const parsed = initialMessages
      .map((raw) => {
        try {
          return JSON.parse(raw) as Shape;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as Shape[];

    shapesRef.current.push(...parsed);
    scheduleRender();
  }, [initialMessages, scheduleRender]);

  // ---- websocket ----
  useEffect(() => {
    if (!params.slug || connectionState !== "connected") return;

    joinRoom(params.slug);

    const unsubscribe = subscribe((data) => {
      if (data.type !== "chat") return;
      if (data.slug !== params.slug) return;

      shapesRef.current.push(data.message as Shape);
      scheduleRender();
    });

    return () => {
      unsubscribe();
      leaveRoom(params.slug);
    };
  }, [params.slug, connectionState]);

  // ---- setup canvas ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctxRef.current = ctx;
    ctx.lineWidth = 2;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    };

    resize();
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, [render]);

  useEffect(() => {
    scheduleRender();
  }, [scheduleRender]);

  return {
    canvasRef,
    tool,
    setTool,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
  };
}
