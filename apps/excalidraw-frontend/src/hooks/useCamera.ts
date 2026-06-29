import { useRef, useCallback } from "react";
import { Camera, DEFAULT_CAMERA, screenToWorld } from "@/src/scene/Camera";

export function useCamera() {
  const cameraRef = useRef<Camera>({ ...DEFAULT_CAMERA });

  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  const startPan = useCallback((e: React.MouseEvent) => {
    panStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const updatePan = useCallback((e: React.MouseEvent): boolean => {
    if (!panStartRef.current) return false;

    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;

    cameraRef.current.offsetX += dx;
    cameraRef.current.offsetY += dy;

    panStartRef.current = { x: e.clientX, y: e.clientY };
    return true;
  }, []);

  const endPan = useCallback(() => {
    panStartRef.current = null;
  }, []);

  const applyZoom = useCallback(
    (screenX: number, screenY: number, deltaY: number) => {
      const camera = cameraRef.current;

      const zoomFactor = deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(camera.zoom * zoomFactor, 0.1), 10);

      const worldPos = screenToWorld(screenX, screenY, camera);
      camera.offsetX = screenX - worldPos.x * newZoom;
      camera.offsetY = screenY - worldPos.y * newZoom;
      camera.zoom = newZoom;
    },
    [],
  );

  const getScreenToWorld = useCallback(
    (screenX: number, screenY: number) =>
      screenToWorld(screenX, screenY, cameraRef.current),
    [],
  );

  return {
    cameraRef,
    startPan,
    updatePan,
    endPan,
    applyZoom,
    screenToWorld: getScreenToWorld,
  };
}
