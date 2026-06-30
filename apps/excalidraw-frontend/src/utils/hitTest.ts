import {
  Shape,
  RectShape,
  EllipseShape,
  LineShape,
  FreeShape,
  TextShape,
} from "@/src/types/shapes";

type Point = { x: number; y: number };

const PADDING = 6;

function hitRect(p: Point, s: RectShape): boolean {
  const minX = Math.min(s.startX, s.endX);
  const maxX = Math.max(s.startX, s.endX);
  const minY = Math.min(s.startY, s.endY);
  const maxY = Math.max(s.startY, s.endY);
  return p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY;
}

function hitEllipse(p: Point, s: EllipseShape): boolean {
  const dx = p.x - s.centerX;
  const dy = p.y - s.centerY;
  if (s.radiusX === 0 || s.radiusY === 0) return false;
  return (
    (dx * dx) / (s.radiusX * s.radiusX) + (dy * dy) / (s.radiusY * s.radiusY) <=
    1
  );
}

function pointToSegmentDist(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(
    0,
    Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq),
  );
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function hitLine(p: Point, s: LineShape): boolean {
  return (
    pointToSegmentDist(
      p,
      { x: s.startX, y: s.startY },
      { x: s.endX, y: s.endY },
    ) <= PADDING
  );
}

function hitFree(p: Point, s: FreeShape): boolean {
  for (let i = 0; i < s.points.length - 1; i++) {
    if (pointToSegmentDist(p, s.points[i]!, s.points[i + 1]!) <= PADDING)
      return true;
  }
  return false;
}

export function hitTest(point: Point, shapes: Shape[]): Shape | null {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const s = shapes[i]!;
    const hit =
      s.type === "rect"
        ? hitRect(point, s)
        : s.type === "ellipse"
          ? hitEllipse(point, s)
          : s.type === "line"
            ? hitLine(point, s)
            : s.type === "free"
              ? hitFree(point, s)
              : s.type === "text"
                ? hitText(point, s)
                : false;
    if (hit) return s;
  }
  return null;
}

function hitText(p: Point, s: TextShape): boolean {
  const charWidth = s.fontSize * 0.6; // rough estimate
  const lineHeight = s.fontSize * 1.4;
  const lines = s.text.split("\n");
  const width = Math.max(...lines.map((l) => l.length)) * charWidth;
  const height = lines.length * lineHeight;

  return p.x >= s.x && p.x <= s.x + width && p.y >= s.y && p.y <= s.y + height;
}
