"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ExcaliSelector from "./ExcaliSelector";
import { useParams, useRouter } from "next/navigation";
import { useWs } from "@/context/wsContext";

type Shape =
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

export type Tool = "rect" | "ellipse" | "line";

type InteractionState = {
  drawing: boolean;
  startX: number;
  startY: number;
  shift: boolean;
};

export type IconProps = {
  selected: boolean;
  onSelect: (sel: Tool) => void;
};

export default function ExcaliCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const shapesRef = useRef<Shape[]>([]);
  const draftRef = useRef<Shape | null>(null);

  const stateRef = useRef<InteractionState>({
    drawing: false,
    startX: 0,
    startY: 0,
    shift: false,
  });

  const rafRef = useRef<number | null>(null);

  const [tool, setTool] = useState<Tool>("rect");

  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { joinRoom, leaveRoom, sendChat, subscribe } = useWs();

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const draw = (shape: Shape) => {
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

    if (draftRef.current) {
      draw(draftRef.current);
    }
  }, []);

  const scheduleRender = useCallback(() => {
    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      render();
    });
  }, [render]);

  useEffect(() => {
    if (!params.slug) return;

    joinRoom(params.slug);
    const unsubscribe = subscribe((data) => {
      if (data?.type === "join_room_denied" && data.slug === params.slug) {
        leaveRoom(params.slug);
        router.replace("/dashboard");
        return;
      }
      if (data?.type !== "chat") return;
      if (data.slug !== params.slug) return;

      shapesRef.current.push(data.message as Shape);
      scheduleRender();
    });

    return () => {
      unsubscribe();
      leaveRoom(params.slug);
    };
  }, [joinRoom, leaveRoom, params.slug, router, scheduleRender, subscribe]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
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

    window.addEventListener("keydown", (e) => {
      if (e.code.startsWith("Shift")) {
        stateRef.current.shift = true;
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.code.startsWith("Shift")) {
        stateRef.current.shift = false;
      }
    });

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [render]);

  function onMouseDown(e: React.MouseEvent) {
    stateRef.current.drawing = true;

    stateRef.current.startX = e.clientX;
    stateRef.current.startY = e.clientY;
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!stateRef.current.drawing) return;

    const { startX, startY, shift } = stateRef.current;

    const x = e.clientX;
    const y = e.clientY;

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
  }

  function onMouseUp() {
    stateRef.current.drawing = false;

    if (!draftRef.current) return;

    shapesRef.current.push(draftRef.current);

    if (params.slug) {
      sendChat(params.slug, draftRef.current);
    }

    draftRef.current = null;

    scheduleRender();
  }

  useEffect(() => {
    scheduleRender();
  }, [scheduleRender]);

  return (
    <>
      <ExcaliSelector selectedTool={tool} handleSelected={setTool} />

      <div className="h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        />
      </div>
    </>
  );
}
