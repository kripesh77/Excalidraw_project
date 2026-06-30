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
}
