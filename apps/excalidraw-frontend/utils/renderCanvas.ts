import { Shape } from "@/hooks/useExcaliCanvas";

type Camera = {
  zoom: number;
  offsetX: number;
  offsetY: number;
};

function jitter(n: number, amount = 1.5) {
  return n + (Math.random() - 0.5) * amount;
}

function roughLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();

    ctx.moveTo(jitter(x1), jitter(y1));

    const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * 4;
    const my = (y1 + y2) / 2 + (Math.random() - 0.5) * 4;

    ctx.quadraticCurveTo(mx, my, jitter(x2), jitter(y2));

    ctx.stroke();
  }
}

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

  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#e5e7eb";

  const draw = (shape: Shape) => {
    ctx.beginPath();

    if (shape.type === "rect") {
      const x = shape.startX;
      const y = shape.startY;
      const w = shape.endX - shape.startX;
      const h = shape.endY - shape.startY;

      roughLine(ctx, x, y, x + w, y);
      roughLine(ctx, x + w, y, x + w, y + h);
      roughLine(ctx, x + w, y + h, x, y + h);
      roughLine(ctx, x, y + h, x, y);
    }

    if (shape.type === "ellipse") {
      for (let pass = 0; pass < 2; pass++) {
        ctx.beginPath();

        for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.15) {
          const rx = shape.radiusX + (Math.random() - 0.5) * 2;

          const ry = shape.radiusY + (Math.random() - 0.5) * 2;

          const x = shape.centerX + Math.cos(a) * rx;

          const y = shape.centerY + Math.sin(a) * ry;

          if (a === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }
    }

    if (shape.type === "line") {
      roughLine(ctx, shape.startX, shape.startY, shape.endX, shape.endY);
    }
  };

  shapes.forEach(draw);
  if (draft) draw(draft);

  ctx.restore();
}
