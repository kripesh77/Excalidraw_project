import { ToolHandler } from "./types";
import { hitTest } from "@/src/utils/hitTest";

export type TextEditSession = {
  screenX: number;
  screenY: number;
  worldX: number;
  worldY: number;
  initialValue: string;
  editingId: string | null;
  zoom: number;
};

export const textTool: ToolHandler = {
  getDraft: () => null,

  onPointerDown(point, e, ctx) {
    const hit = hitTest(point, ctx.scene.getShapes());

    if (hit && hit.type === "text") {
      const screenX = hit.x * ctx.camera.zoom + ctx.camera.offsetX;
      const screenY = hit.y * ctx.camera.zoom + ctx.camera.offsetY;

      ctx.openTextEditor({
        screenX,
        screenY,
        worldX: hit.x,
        worldY: hit.y,
        initialValue: hit.text,
        editingId: hit.id,
        zoom: ctx.camera.zoom,
      });
      return;
    }

    const screenX = point.x * ctx.camera.zoom + ctx.camera.offsetX;
    const screenY = point.y * ctx.camera.zoom + ctx.camera.offsetY;

    ctx.openTextEditor({
      screenX,
      screenY,
      worldX: point.x,
      worldY: point.y,
      initialValue: "",
      editingId: null,
      zoom: ctx.camera.zoom,
    });
  },

  onPointerMove() {},
  onPointerUp() {},

  onDeactivate() {},
};
