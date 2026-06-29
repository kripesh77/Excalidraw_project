import { ToolHandler, Point } from "./types";
import { EllipseShape } from "@/src/types/shapes";

let start: Point | null = null;
let draft: EllipseShape | null = null;

function toEllipse(start: Point, end: Point, constrain: boolean): EllipseShape {
  const radiusX = Math.abs(end.x - start.x) / 2;
  const radiusY = Math.abs(end.y - start.y) / 2;
  const radius = Math.min(radiusX, radiusY);

  return {
    id: "",
    type: "ellipse",
    centerX: (start.x + end.x) / 2,
    centerY: (start.y + end.y) / 2,
    radiusX: constrain ? radius : radiusX,
    radiusY: constrain ? radius : radiusY,
  };
}

export const ellipseTool: ToolHandler = {
  getDraft: () => draft,

  onPointerDown(point) {
    start = point;
  },

  onPointerMove(point, e, ctx) {
    if (!start) return;
    draft = toEllipse(start, point, e.ctrlKey);
    ctx.scheduleRender();
  },

  onPointerUp(point, e, ctx) {
    if (!start) return;
    const shape = {
      ...toEllipse(start, point, e.ctrlKey),
      id: crypto.randomUUID(),
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
