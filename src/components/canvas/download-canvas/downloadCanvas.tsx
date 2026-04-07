let isDownloading = false;

export function downloadCanvas() {
  if (isDownloading) return;
  isDownloading = true;

  const canvas = document.querySelector("canvas");
  if (!canvas) {
    isDownloading = false;
    return;
  }

  const canvasData = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = canvasData;
  link.download = "canvas.png";
  link.click();

  // Release the lock on the next frame to prevent rapid duplicate downloads.
  requestAnimationFrame(() => {
    isDownloading = false;
  });
}
