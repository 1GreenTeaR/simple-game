export function downloadCanvas(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;

  try {
    const canvasData = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = canvasData;
    link.download = `Canvas-${Date.now()}.png`;
    link.click();
  } catch (error) {
    console.error("Failed to download canvas image:", error);
  }
}
