import { ToolHandler, Point } from "./types";
import { LineShape } from "@/src/types/shapes";

let start: Point | null = null;
let draft: LineShape | null = null;

export const lineTool: ToolHandler = {
  getDraft: () => draft,

  onPointerDown(point) {
    start = point;
  },

  onPointerMove(point, e, ctx) {
    if (!start) return;
    draft = {
      id: "",
      type: "line",
      startX: start.x,
      startY: start.y,
      endX: point.x,
      endY: point.y,
    };
    ctx.scheduleRender();
  },

  onPointerUp(point, e, ctx) {
    if (!start) return;
    const shape = { ...draft!, id: crypto.randomUUID() };
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
