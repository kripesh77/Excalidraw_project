import { ToolHandler, ToolContext, Point } from "./types";

let lastPos: Point | null = null;

export const panTool: ToolHandler = {
  getDraft: () => null,

  onPointerDown(point, e, ctx) {
    lastPos = { x: e.clientX, y: e.clientY };
  },

  onPointerMove(point, e, ctx) {
    if (!lastPos) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    ctx.camera.offsetX += dx;
    ctx.camera.offsetY += dy;
    lastPos = { x: e.clientX, y: e.clientY };
    ctx.scheduleRender();
  },

  onPointerUp(point, e, ctx) {
    lastPos = null;
  },

  onDeactivate(ctx) {
    lastPos = null;
  },
};
