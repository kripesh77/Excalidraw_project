export type Camera = {
  zoom: number;
  offsetX: number;
  offsetY: number;
};

export function screenToWorld(x: number, y: number, camera: Camera) {
  return {
    x: (x - camera.offsetX) / camera.zoom,
    y: (y - camera.offsetY) / camera.zoom,
  };
}

export function zoomAtPoint(
  camera: Camera,
  mouseX: number,
  mouseY: number,
  deltaY: number,
) {
  const oldZoom = camera.zoom;
  const targetZoom = deltaY < 0 ? oldZoom * 1.1 : oldZoom / 1.1;

  const newZoom = Math.max(0.25, Math.min(4, targetZoom));
  if (newZoom === oldZoom) return;

  camera.offsetX = mouseX - ((mouseX - camera.offsetX) * newZoom) / oldZoom;

  camera.offsetY = mouseY - ((mouseY - camera.offsetY) * newZoom) / oldZoom;

  camera.zoom = newZoom;
}
