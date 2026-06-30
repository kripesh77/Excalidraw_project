import { ToolHandler, Point } from "./types";
import { hitTest } from "@/src/utils/hitTest";
import { Shape } from "@/src/types/shapes";

type SelectionRect = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

let dragStart: Point | null = null;
let selectionRect: SelectionRect | null = null;

function overlaps(shape: Shape, rect: SelectionRect): boolean {
  const rMinX = Math.min(rect.startX, rect.endX);
  const rMaxX = Math.max(rect.startX, rect.endX);
  const rMinY = Math.min(rect.startY, rect.endY);
  const rMaxY = Math.max(rect.startY, rect.endY);

  let sMinX: number, sMaxX: number, sMinY: number, sMaxY: number;

  if (shape.type === "rect" || shape.type === "line") {
    sMinX = Math.min(shape.startX, shape.endX);
    sMaxX = Math.max(shape.startX, shape.endX);
    sMinY = Math.min(shape.startY, shape.endY);
    sMaxY = Math.max(shape.startY, shape.endY);
  } else if (shape.type === "ellipse") {
    sMinX = shape.centerX - shape.radiusX;
    sMaxX = shape.centerX + shape.radiusX;
    sMinY = shape.centerY - shape.radiusY;
    sMaxY = shape.centerY + shape.radiusY;
  } else if (shape.type === "text") {
    const charWidth = shape.fontSize * 0.6;
    const lineHeight = shape.fontSize * 1.4;
    const lines = shape.text.split("\n");
    const width = Math.max(...lines.map((l) => l.length)) * charWidth;
    const height = lines.length * lineHeight;
    sMinX = shape.x;
    sMaxX = shape.x + width;
    sMinY = shape.y;
    sMaxY = shape.y + height;
  } else {
    const xs = shape.points.map((p) => p.x);
    const ys = shape.points.map((p) => p.y);
    sMinX = Math.min(...xs);
    sMaxX = Math.max(...xs);
    sMinY = Math.min(...ys);
    sMaxY = Math.max(...ys);
  }

  return sMaxX >= rMinX && sMinX <= rMaxX && sMaxY >= rMinY && sMinY <= rMaxY;
}

export const selectTool: ToolHandler = {
  getDraft: () => null,

  getSelectionRect: () => selectionRect,

  onPointerDown(point, e, ctx) {
    const hit = hitTest(point, ctx.scene.getShapes());

    if (hit) {
      if (e.shiftKey) {
        const current = ctx.scene.getSelectedIds();
        if (current.has(hit.id)) {
          const next = [...current].filter((id) => id !== hit.id);
          ctx.scene.setSelectedIds(next);
        } else {
          ctx.scene.setSelectedIds([...current, hit.id]);
        }
      } else {
        ctx.scene.setSelectedIds([hit.id]);
      }
      dragStart = null;
    } else {
      if (!e.shiftKey) ctx.scene.clearSelection();
      dragStart = point;
      selectionRect = {
        startX: point.x,
        startY: point.y,
        endX: point.x,
        endY: point.y,
      };
    }

    ctx.scheduleRender();
  },

  onPointerMove(point, e, ctx) {
    if (!dragStart) return;

    selectionRect = {
      startX: dragStart.x,
      startY: dragStart.y,
      endX: point.x,
      endY: point.y,
    };

    const hits = ctx.scene
      .getShapes()
      .filter((s) => overlaps(s, selectionRect!));

    if (e.shiftKey) {
      const current = [...ctx.scene.getSelectedIds()];
      const newIds = hits
        .map((s) => s.id)
        .filter((id) => !current.includes(id));
      ctx.scene.setSelectedIds([...current, ...newIds]);
    } else {
      ctx.scene.setSelectedIds(hits.map((s) => s.id));
    }

    ctx.scheduleRender();
  },

  onPointerUp(point, e, ctx) {
    if (!dragStart || !selectionRect) return;

    const hits = ctx.scene
      .getShapes()
      .filter((s) => overlaps(s, selectionRect!));

    if (hits.length > 0) {
      if (e.shiftKey) {
        const current = [...ctx.scene.getSelectedIds()];
        const newIds = hits
          .map((s) => s.id)
          .filter((id) => !current.includes(id));
        ctx.scene.setSelectedIds([...current, ...newIds]);
      } else {
        ctx.scene.setSelectedIds(hits.map((s) => s.id));
      }
    }

    dragStart = null;
    selectionRect = null;
    ctx.scheduleRender();
  },

  onDeactivate(ctx) {
    dragStart = null;
    selectionRect = null;
    ctx.scene.clearSelection();
    ctx.scheduleRender();
  },
};
