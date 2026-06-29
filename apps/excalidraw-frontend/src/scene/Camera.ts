export type Camera = {
  zoom: number;
  offsetX: number;
  offsetY: number;
};

export const DEFAULT_CAMERA: Camera = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
};

export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: Camera,
): { x: number; y: number } {
  return {
    x: (screenX - camera.offsetX) / camera.zoom,
    y: (screenY - camera.offsetY) / camera.zoom,
  };
}

export function worldToScreen(
  worldX: number,
  worldY: number,
  camera: Camera,
): { x: number; y: number } {
  return {
    x: worldX * camera.zoom + camera.offsetX,
    y: worldY * camera.zoom + camera.offsetY,
  };
}
