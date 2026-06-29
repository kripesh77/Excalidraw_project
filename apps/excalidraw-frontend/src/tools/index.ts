import { Tool } from "@/src/types/shapes";
import { ToolHandler } from "./types";
import { panTool } from "./panTool";
import { rectTool } from "./rectTool";
import { ellipseTool } from "./ellipseTool";
import { lineTool } from "./lineTool";
import { freeTool } from "./freeTool";
import { selectTool } from "./selectTool";

export const toolRegistry: Record<Tool, ToolHandler> = {
  pan: panTool,
  rect: rectTool,
  ellipse: ellipseTool,
  line: lineTool,
  free: freeTool,
  select: selectTool,
};
