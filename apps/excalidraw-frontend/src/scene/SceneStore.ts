import { Shape } from "@/src/types/shapes";

export class SceneStore {
  private shapes: Shape[] = [];
  private selectedIds: Set<string> = new Set();

  constructor(shapes: Shape[]) {
    this.shapes = shapes;
  }

  getShapes() {
    return this.shapes;
  }
  setShapes(shapes: Shape[]) {
    this.shapes = shapes;
  }
  addShape(shape: Shape) {
    this.shapes.push(shape);
  }

  getSelectedIds() {
    return this.selectedIds;
  }

  setSelectedIds(ids: string[]) {
    this.selectedIds = new Set(ids);
  }

  clearSelection() {
    this.selectedIds = new Set();
  }

  deleteSelected(): Shape[] {
    const deleted = this.shapes.filter((s) => this.selectedIds.has(s.id));
    this.shapes = this.shapes.filter((s) => !this.selectedIds.has(s.id));
    this.selectedIds = new Set();
    return deleted;
  }

  updateShape(shape: Shape): void {
    this.shapes = this.shapes.map((s) => (s.id === shape.id ? shape : s));
  }

  deleteByIds(ids: string[]) {
    const set = new Set(ids);
    this.shapes = this.shapes.filter((s) => !set.has(s.id));
    ids.forEach((id) => this.selectedIds.delete(id));
  }

  translateShape(shape: Shape, dx: number, dy: number): Shape {
    switch (shape.type) {
      case "rect":
      case "line":
        return {
          ...shape,
          startX: shape.startX + dx,
          startY: shape.startY + dy,
          endX: shape.endX + dx,
          endY: shape.endY + dy,
        };
      case "ellipse":
        return {
          ...shape,
          centerX: shape.centerX + dx,
          centerY: shape.centerY + dy,
        };
      case "free":
        return {
          ...shape,
          points: shape.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
        };
      case "text":
        return {
          ...shape,
          x: shape.x + dx,
          y: shape.y + dy,
        };
    }
  }

  translateSelected(ids: Set<string>, dx: number, dy: number): Shape[] {
    const moved: Shape[] = [];
    this.shapes = this.shapes.map((s) => {
      if (!ids.has(s.id)) return s;
      const next = this.translateShape(s, dx, dy);
      moved.push(next);
      return next;
    });
    return moved;
  }
}
