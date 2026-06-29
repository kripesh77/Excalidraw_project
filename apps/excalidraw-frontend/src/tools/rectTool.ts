import { ToolHandler, ToolContext, Point } from "./types";
import { RectShape } from "@/src/types/shapes";

let start: Point | null = null;
let draft: RectShape | null = null;

export const rectTool: ToolHandler = {
  getDraft: () => draft,

  onPointerDown(point) {
    start = point;
  },

  onPointerMove(point, e, ctx) {
    if (!start) return;
    draft = {
      id: "",
      type: "rect",
      startX: start.x,
      startY: start.y,
      endX: point.x,
      endY: point.y,
    };
    ctx.scheduleRender();
  },

  onPointerUp(point, e, ctx) {
    if (!start) return;
    const shape = {
      id: crypto.randomUUID(),
      type: "rect" as const,
      startX: start.x,
      startY: start.y,
      endX: point.x,
      endY: point.y,
    };
    ctx.scene.addShape(shape);
    ctx.send(shape);
    draft = null;
    start = null;
    ctx.scheduleRender();
  },

  onDeactivate() {
    start = null;
    draft = null;
  },
};
