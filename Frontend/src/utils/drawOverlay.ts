// src/utils/drawOverlay.ts
export function drawOverlay(ctx: CanvasRenderingContext2D, result: any) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (!result.detected || !result.box) return;

  const { x1, y1, x2, y2 } = result.box;
  ctx.strokeStyle = result.verified ? "limegreen" : "orange";
  ctx.lineWidth = 3;
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

  const label = `${result.container_number} (${Math.round((result.confidence ?? 0) * 100)}%)`;
  ctx.fillStyle = result.verified ? "limegreen" : "orange";
  ctx.font = "16px sans-serif";
  ctx.fillText(label, x1, y1 > 20 ? y1 - 6 : y1 + 16);
}
  