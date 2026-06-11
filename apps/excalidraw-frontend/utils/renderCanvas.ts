import { Shape } from "@/hooks/useExcaliCanvas";

type Camera = {
  zoom: number;
  offsetX: number;
  offsetY: number;
};

export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  shapes: Shape[],
  draft: Shape | null,
  camera: Camera,
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.save();
  ctx.translate(camera.offsetX, camera.offsetY);
  ctx.scale(camera.zoom, camera.zoom);

  const draw = (shape: Shape) => {
    ctx.beginPath();

    if (shape.type === "rect") {
      ctx.strokeRect(
        shape.startX,
        shape.startY,
        shape.endX - shape.startX,
        shape.endY - shape.startY,
      );
    }

    if (shape.type === "ellipse") {
      ctx.ellipse(
        shape.centerX,
        shape.centerY,
        shape.radiusX,
        shape.radiusY,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    if (shape.type === "line") {
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
      ctx.stroke();
    }
  };

  shapes.forEach(draw);
  if (draft) draw(draft);

  ctx.restore();
}
