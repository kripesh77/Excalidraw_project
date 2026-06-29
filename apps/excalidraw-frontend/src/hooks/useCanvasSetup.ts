import { RefObject, useEffect, useRef } from "react";
import { useRenderScheduler } from "./useRenderScheduler";
import { SceneStore } from "../scene/SceneStore";
import { Camera } from "../scene/Camera";
import { Tool } from "../types/shapes";

export function useCanvasSetup(
  sceneRef: RefObject<SceneStore>,
  cameraRef: RefObject<Camera>,
  toolRef: RefObject<Tool>,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const scheduleRender = useRenderScheduler(
    ctxRef,
    sceneRef,
    cameraRef,
    toolRef,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctxRef.current = ctx;

    function syncSize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      scheduleRender();
    }

    syncSize();
    window.addEventListener("resize", syncSize);
    return () => window.removeEventListener("resize", syncSize);
  }, [scheduleRender]);

  return { canvasRef, ctxRef };
}
