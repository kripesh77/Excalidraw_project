export type RectShape = {
  id: string;
  type: "rect";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export type EllipseShape = {
  id: string;
  type: "ellipse";
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
};

export type LineShape = {
  id: string;
  type: "line";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export type FreeShape = {
  id: string;
  type: "free";
  points: { x: number; y: number }[];
};

export type Shape = RectShape | EllipseShape | LineShape | FreeShape;
export type Tool = "pan" | "rect" | "ellipse" | "line" | "free" | "select";
