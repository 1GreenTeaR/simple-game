import { useCallback, useEffect, useRef } from "react";
import "./Canvas.css";

type Tool = "brush" | "eraser";

type Props = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  undoRef?: React.RefObject<(() => void) | null>;
  tool: Tool;
  collapsed: boolean;
  brushSize: number;
  brushColor: string;
};

// Canvas max display size in CSS pixels (actual size is set in CSS).
const CANVAS_DISPLAY_SIZE = 600;
//canvas size in real pixels
const CANVAS_REAL_WIDTH = 200;
const CANVAS_REAL_HEIGHT = 200;
// const CANVAS_SCALE = CANVAS_WIDTH / CANVAS_REAL_WIDTH;

export function Canvas({
  canvasRef,
  undoRef,
  tool,
  collapsed,
  brushSize: toolSize,
  brushColor,
}: Props) {
  // Draw state is kept in refs so mouse events don't cause re-renders.
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Undo history: snapshots of the REAL (200×200) buffer.
  const historyRef = useRef<ImageData[]>([]);

  /**
   * Draw a "raw pixel" line by stamping square blocks along a Bresenham line.
   * This avoids `stroke()` which anti-aliases and looks blurry for pixel art.
   */
  const drawPixelLine = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      from: { x: number; y: number },
      to: { x: number; y: number },
    ) => {
      const size = toolSize;
      const half = Math.floor(size / 2);

      let x0 = Math.round(from.x);
      let y0 = Math.round(from.y);
      const x1 = Math.round(to.x);
      const y1 = Math.round(to.y);

      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;

      // Eraser is just painting with the background color.
      ctx.fillStyle = tool === "brush" ? brushColor : "#FFFFFF";

      while (true) {
        ctx.fillRect(x0 - half, y0 - half, size, size);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          x0 += sx;
        }
        if (e2 < dx) {
          err += dx;
          y0 += sy;
        }
      }
    },
    [tool, toolSize, brushColor],
  );

  // Push the current buffer into undo history.
  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current.push(imageData);
  }, [canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Real buffer size (what we actually draw into).
    canvas.width = CANVAS_REAL_WIDTH;
    canvas.height = CANVAS_REAL_HEIGHT;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ensure the browser never interpolates pixels.
    ctx.imageSmoothingEnabled = false;

    // Initial clear to white and seed undo history with the blank state.
    ctx.clearRect(0, 0, CANVAS_REAL_WIDTH, CANVAS_REAL_HEIGHT);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, CANVAS_REAL_WIDTH, CANVAS_REAL_HEIGHT);

    historyRef.current = [];
    saveSnapshot();
  }, [saveSnapshot, canvasRef]);

  // Convert screen position (CSS pixels) into REAL buffer coordinates (200×200).
  const getCanvasPointFromClient = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * CANVAS_REAL_WIDTH,
      y: ((clientY - rect.top) / rect.height) * CANVAS_REAL_HEIGHT,
    };
  };

  const getCanvasPoint = (event: React.MouseEvent<HTMLCanvasElement>) =>
    getCanvasPointFromClient(event.clientX, event.clientY);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    startDrawingAt(event.clientX, event.clientY);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    continueDrawingAt(event.clientX, event.clientY);
  };

  const endDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const handleMouseUp = () => {
    // Snapshot after each completed stroke so undo removes whole strokes.
    if (isDrawingRef.current) {
      saveSnapshot();
    }
    endDrawing();
  };

  const startDrawingAt = (clientX: number, clientY: number) => {
    const point = getCanvasPointFromClient(clientX, clientY);
    if (!point) return;
    isDrawingRef.current = true;
    lastPointRef.current = point;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    drawPixelLine(ctx, point, point);
  };

  const continueDrawingAt = (clientX: number, clientY: number) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const point = getCanvasPointFromClient(clientX, clientY);
    const lastPoint = lastPointRef.current;
    if (!point || !lastPoint) {
      lastPointRef.current = point;
      return;
    }

    ctx.imageSmoothingEnabled = false;
    drawPixelLine(ctx, lastPoint, point);
    lastPointRef.current = point;
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const touch = event.touches[0];
    if (!touch) return;
    startDrawingAt(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const touch = event.touches[0];
    if (!touch) return;
    continueDrawingAt(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    if (isDrawingRef.current) {
      saveSnapshot();
    }
    endDrawing();
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLCanvasElement>) => {
    // If the mouse leaves while drawing, "finish" at the edge so the last
    // segment doesn't get cut off, then snapshot as a completed stroke.
    if (!isDrawingRef.current) {
      endDrawing();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      endDrawing();
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      endDrawing();
      return;
    }

    const point = getCanvasPoint(event);
    const lastPoint = lastPointRef.current;
    if (
      point &&
      lastPoint &&
      (lastPoint.x !== point.x || lastPoint.y !== point.y)
    ) {
      ctx.imageSmoothingEnabled = false;
      drawPixelLine(ctx, lastPoint, point);
      lastPointRef.current = point;
    }

    saveSnapshot();
    endDrawing();
  };

  const handleUndo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const history = historyRef.current;
    if (history.length <= 1) return;

    history.pop();
    const previous = history[history.length - 1];
    ctx.putImageData(previous, 0, 0);
  }, [canvasRef]);

  useEffect(() => {
    if (!undoRef) return;
    undoRef.current = handleUndo;
    return () => {
      undoRef.current = null;
    };
  }, [handleUndo, undoRef]);

  useEffect(() => {
    // Ctrl/Cmd+Z to undo (canvas-only; prevents the browser default binding).
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "z" || event.key === "Z")
      ) {
        event.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleUndo]);

  return (
    <div
      className={`canvas-container ${collapsed ? "is-collapsed" : ""}`}
      style={
        {
          "--canvas-display-size": `${CANVAS_DISPLAY_SIZE}px`,
        } as React.CSSProperties
      }
    >
      <canvas
        ref={canvasRef}
        className="canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      />
    </div>
  );
}
