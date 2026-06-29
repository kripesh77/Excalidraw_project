import { ToolHandler, Point } from "./types";
import { FreeShape } from "@/src/types/shapes";
import { simplifyPoints } from "@/src/utils/simplify";

let points: Point[] = [];
let draft: FreeShape | null = null;
let drawing = false;

export const freeTool: ToolHandler = {
  getDraft: () => draft,

  onPointerDown(point) {
    drawing = true;
    points = [point];
    draft = { id: "", type: "free", points };
  },

  onPointerMove(point, e, ctx) {
    if (!drawing) return;
    points.push(point);
    draft = { id: "", type: "free", points: [...points] };
    ctx.scheduleRender();
  },

  onPointerUp(point, e, ctx) {
    if (!drawing) return;

    const simplifiedPoints = simplifyPoints(points, 2);
    const shape = {
      id: crypto.randomUUID(),
      type: "free" as const,
      points: simplifiedPoints,
    };
    ctx.scene.addShape(shape);
    ctx.send(shape);
    drawing = false;
    points = [];
    draft = null;
    ctx.scheduleRender();
  },

  onDeactivate() {
    drawing = false;
    points = [];
    draft = null;
  },
};
