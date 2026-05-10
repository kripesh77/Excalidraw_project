"use client";

import { useEffect, useRef, useState } from "react";
import ExcaliSelector from "./ExcaliSelector";

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

interface Iconfig {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  isShiftPressed: boolean;
  clicked: boolean;
}

export type ISelected = "rect" | "ellipse" | "line";
export interface IconProps {
  selected?: boolean;
  onSelect: (selected: ISelected) => void;
}

export default function ExcaliCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedTool, setSelectedTool] = useState<ISelected>("rect");
  const existingShapes = useRef<Shape[]>([]);

  function handleSelected(sel: ISelected) {
    setSelectedTool(() => sel);
  }

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;

      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    if (!canvasRef.current) return;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = 2;

    const config: Iconfig = {
      startX: -1,
      startY: -1,
      endX: -1,
      endY: -1,
      // ellipse related fields
      centerX: -1,
      centerY: -1,
      radiusX: -1,
      radiusY: -1,
      isShiftPressed: false,
      clicked: false,
    };

    function handleMouseDown(e: MouseEvent) {
      config.clicked = true;
      config.startX = e.clientX;
      config.startY = e.clientY;
    }

    function handleMouseUp(e: MouseEvent) {
      config.clicked = false;
      config.endX = e.clientX;
      config.endY = e.clientY;

      switch (selectedTool) {
        case "rect":
          const rect = {
            type: "rect" as const,
            startX: config.startX,
            startY: config.startY,
            endX: config.endX,
            endY: config.endY,
          };

          existingShapes.current.push(rect);
          break;

        case "ellipse":
          const ellipse = {
            type: "ellipse" as const,
            centerX: config.centerX,
            centerY: config.centerY,
            radiusX: config.radiusX,
            radiusY: config.radiusY,
          };

          existingShapes.current.push(ellipse);
          break;

        case "line":
          const line = {
            type: "line" as const,
            startX: config.startX,
            startY: config.startY,
            endX: config.endX,
            endY: config.endY,
          };

          existingShapes.current.push(line);
          break;
      }
    }

    function handleMouseMove(e: MouseEvent) {
      if (!config.clicked || !ctx) return;
      if (selectedTool === "rect") {
        const width = e.clientX - config.startX;
        const height = e.clientY - config.startY;

        clearRect(ctx!, canvasRef.current!);

        ctx?.strokeRect(config.startX, config.startY, width, height);
      } else if (selectedTool === "ellipse") {
        const dx = e.clientX - config.startX;
        const dy = e.clientY - config.startY;

        let width = Math.abs(dx);
        let height = Math.abs(dy);

        if (config.isShiftPressed) {
          const size = Math.max(width, height);

          width = size;
          height = size;
        }

        const signX = dx < 0 ? -1 : 1;
        const signY = dy < 0 ? -1 : 1;

        const endX = config.startX + width * signX;
        const endY = config.startY + height * signY;

        config.radiusX = width / 2;
        config.radiusY = height / 2;

        config.centerX = (config.startX + endX) / 2;
        config.centerY = (config.startY + endY) / 2;

        clearRect(ctx, canvasRef.current!);

        ctx.beginPath();

        ctx.ellipse(
          config.centerX,
          config.centerY,
          config.radiusX,
          config.radiusY,
          0,
          0,
          2 * Math.PI,
        );

        ctx.stroke();
      } else if (selectedTool === "line") {
        clearRect(ctx!, canvasRef.current!);
        ctx.beginPath();

        ctx.moveTo(config.startX, config.startY);

        ctx.lineTo(e.clientX, e.clientY);

        ctx.stroke();
      }
    }

    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.code.startsWith("Shift")) {
        config.isShiftPressed = true;
      }
    }

    function handleKeyUp(e: globalThis.KeyboardEvent) {
      if (e.code.startsWith("Shift")) {
        config.isShiftPressed = false;
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    window.addEventListener("keyup", handleKeyUp);

    canvasRef.current.addEventListener("mousedown", handleMouseDown);

    canvasRef.current.addEventListener("mouseup", handleMouseUp);

    canvasRef.current.addEventListener("mousemove", handleMouseMove);

    function clearRect(
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
    ) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      existingShapes.current.forEach((shape) => {
        ctx.beginPath();
        if (shape.type === "rect") {
          const width = shape.endX - shape.startX;
          const height = shape.endY - shape.startY;
          ctx.strokeRect(shape.startX, shape.startY, width, height);
        } else if (shape.type === "ellipse") {
          ctx.ellipse(
            shape.centerX,
            shape.centerY,
            shape.radiusX,
            shape.radiusY,
            0,
            0,
            2 * Math.PI,
          );

          ctx.stroke();
        } else if (shape.type === "line") {
          ctx.lineWidth = 2;
          ctx.moveTo(shape.startX, shape.startY);

          ctx.lineTo(shape.endX, shape.endY);

          ctx.stroke();
        }
      });
    }

    clearRect(ctx!, canvasRef.current);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (!canvasRef.current) return;
      canvasRef.current.removeEventListener("mousedown", handleMouseDown);

      canvasRef.current.removeEventListener("mouseup", handleMouseUp);

      canvasRef.current.removeEventListener("mousemove", handleMouseMove);

      window.removeEventListener("keydown", handleKeyDown);

      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedTool]);

  return (
    <>
      <ExcaliSelector
        selectedTool={selectedTool}
        handleSelected={handleSelected}
      />
      <div className="h-screen overflow-hidden">
        <canvas ref={canvasRef} className="block" />
      </div>
    </>
  );
}
