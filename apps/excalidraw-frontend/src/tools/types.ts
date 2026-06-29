import { Shape, Tool } from "@/src/types/shapes";
import { SceneStore } from "@/src/scene/SceneStore";
import { Camera } from "@/src/scene/Camera";

export type Point = { x: number; y: number };

export type ToolContext = {
  scene: SceneStore;
  camera: Camera;
  screenToWorld: (x: number, y: number) => Point;
  scheduleRender: () => void;
  send: (shape: Shape) => void;
};

export type ToolHandler = {
  onPointerDown: (point: Point, e: React.MouseEvent, ctx: ToolContext) => void;
  onPointerMove: (point: Point, e: React.MouseEvent, ctx: ToolContext) => void;
  onPointerUp: (point: Point, e: React.MouseEvent, ctx: ToolContext) => void;
  onDeactivate?: (ctx: ToolContext) => void;
  getDraft: () => Shape | null;
  getSelectionRect?: () => SelectionRect | null;
};

export type SelectionRect = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};
