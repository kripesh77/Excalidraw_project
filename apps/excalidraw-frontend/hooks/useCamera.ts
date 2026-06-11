"use client";

import { useRef } from "react";

export function useCamera() {
  const cameraRef = useRef({
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  });

  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 4;

  const screenToWorld = (x: number, y: number) => {
    const c = cameraRef.current;

    return {
      x: (x - c.offsetX) / c.zoom,
      y: (y - c.offsetY) / c.zoom,
    };
  };

  const worldToScreen = (x: number, y: number) => {
    const c = cameraRef.current;

    return {
      x: x * c.zoom + c.offsetX,
      y: y * c.zoom + c.offsetY,
    };
  };

  const applyZoom = (mouseX: number, mouseY: number, deltaY: number) => {
    const c = cameraRef.current;

    const oldZoom = c.zoom;
    const next = deltaY < 0 ? oldZoom * 1.1 : oldZoom / 1.1;

    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, next));

    if (newZoom === oldZoom) return;

    c.offsetX = mouseX - ((mouseX - c.offsetX) * newZoom) / oldZoom;

    c.offsetY = mouseY - ((mouseY - c.offsetY) * newZoom) / oldZoom;

    c.zoom = newZoom;
  };

  const panBy = (dx: number, dy: number) => {
    const c = cameraRef.current;

    c.offsetX += dx;
    c.offsetY += dy;
  };

  return {
    cameraRef,
    screenToWorld,
    worldToScreen,
    applyZoom,
    panBy,
  };
}
