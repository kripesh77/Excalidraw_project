import {
  Shape,
  RectShape,
  EllipseShape,
  LineShape,
  FreeShape,
} from "@/src/types/shapes";
import { SceneStore } from "@/src/scene/SceneStore";
import { Camera } from "@/src/scene/Camera";
import { SelectionRect } from "@/src/tools/types";

function drawRect(ctx: CanvasRenderingContext2D, s: RectShape) {
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 2;
  ctx.strokeRect(s.startX, s.startY, s.endX - s.startX, s.endY - s.startY);
}

function drawEllipse(ctx: CanvasRenderingContext2D, s: EllipseShape) {
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(s.centerX, s.centerY, s.radiusX, s.radiusY, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawLine(ctx: CanvasRenderingContext2D, s: LineShape) {
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(s.startX, s.startY);
  ctx.lineTo(s.endX, s.endY);
  ctx.stroke();
}

function drawFree(ctx: CanvasRenderingContext2D, s: FreeShape) {
  if (s.points.length < 2) return;
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(s.points[0]!.x, s.points[0]!.y);
  for (let i = 1; i < s.points.length; i++) {
    ctx.lineTo(s.points[i]!.x, s.points[i]!.y);
  }
  ctx.stroke();
}

function drawSelectionBox(ctx: CanvasRenderingContext2D, s: Shape) {
  const PAD = 6;
  ctx.strokeStyle = "#6366f1";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 3]);

  let x: number, y: number, w: number, h: number;

  if (s.type === "rect" || s.type === "line") {
    const minX = Math.min(s.startX, s.endX);
    const minY = Math.min(s.startY, s.endY);
    x = minX - PAD;
    y = minY - PAD;
    w = Math.abs(s.endX - s.startX) + PAD * 2;
    h = Math.abs(s.endY - s.startY) + PAD * 2;
  } else if (s.type === "ellipse") {
    x = s.centerX - s.radiusX - PAD;
    y = s.centerY - s.radiusY - PAD;
    w = s.radiusX * 2 + PAD * 2;
    h = s.radiusY * 2 + PAD * 2;
  } else {
    const xs = s.points.map((p) => p.x);
    const ys = s.points.map((p) => p.y);
    x = Math.min(...xs) - PAD;
    y = Math.min(...ys) - PAD;
    w = Math.max(...xs) - Math.min(...xs) + PAD * 2;
    h = Math.max(...ys) - Math.min(...ys) + PAD * 2;
  }

  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);
}

function drawShape(ctx: CanvasRenderingContext2D, shape: Shape) {
  if (shape.type === "rect") drawRect(ctx, shape);
  if (shape.type === "ellipse") drawEllipse(ctx, shape);
  if (shape.type === "line") drawLine(ctx, shape);
  if (shape.type === "free") drawFree(ctx, shape);
}

export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  scene: SceneStore,
  camera: Camera,
  draft: Shape | null = null,
  selectionRect: SelectionRect | null = null,
) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);

  ctx.save();
  ctx.setTransform(
    camera.zoom,
    0,
    0,
    camera.zoom,
    camera.offsetX,
    camera.offsetY,
  );

  const selectedIds = scene.getSelectedIds();

  for (const shape of scene.getShapes()) {
    drawShape(ctx, shape);
    if (selectedIds.has(shape.id)) {
      drawSelectionBox(ctx, shape);
    }
  }

  if (draft) drawShape(ctx, draft);

  if (selectionRect) {
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.fillStyle = "rgba(99, 102, 241, 0.08)";
    const x = selectionRect.startX;
    const y = selectionRect.startY;
    const w = selectionRect.endX - selectionRect.startX;
    const h = selectionRect.endY - selectionRect.startY;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
  }

  ctx.restore();
}
