
  export function drawOverlay(ctx: CanvasRenderingContext2D,
     video: HTMLVideoElement, 
     result: any) {
    // Draw the detected box and label on top of the live camera feed.
    ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);
    if (!result.detected || !result.box) {
      return;
    }

    const { x1, y1, x2, y2 } = result.box;
    const isValid = result.verified;
    ctx.strokeStyle = isValid ? "#16a34a" : "#f59e0b";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    ctx.setLineDash([]);

    const label = `${result.container_number} (${Math.round((result.confidence ?? 0) * 100)}%)`;
    ctx.fillStyle = isValid ? "#16a34a" : "#f59e0b";
    ctx.font = "600 14px Inter, sans-serif";
    ctx.fillText(label, x1, y1 > 20 ? y1 - 6 : y1 + 16);
  }

  