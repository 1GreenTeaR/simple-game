import { useEffect, useRef, useState } from "react";
import "./App.css";
import { Canvas } from "./components/canvas/Canvas";
import Toolbar from "./components/toolbar/Toolbar";
import { Button } from "./ui/button/Button";
import { downloadCanvas } from "./components/canvas/download-canvas/downloadCanvas";

type Tool = "brush" | "eraser";

function App() {
  const [tool, setTool] = useState<Tool>("brush");
  const [showCanvas, setShowCanvas] = useState(true);
  const [toolSize, setToolSize] = useState(1);
  const [color, setColor] = useState("#000000");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const undoRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "b" || event.key === "B") {
        setTool("brush");
      } else if (event.key === "e" || event.key === "E") {
        setTool("eraser");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Toolbar activeTool={tool} onSelectTool={setTool} />
      <div className="functional-buttons">
        <Button
          className="fold-canvas"
          color={showCanvas ? "primary" : "secondary"}
          size="m"
          padding="none"
          onClick={() => setShowCanvas((prev) => !prev)}
        >
          {showCanvas ? "Fold Canvas" : "Unfold Canvas"}
        </Button>

        <Button
          size="m"
          padding="none"
          className="download-canvas"
          onClick={() => downloadCanvas(canvasRef.current)}
        >
          Download canvas
        </Button>
      </div>

      <div className="bottom-menu">
        <Button
          size="m"
          padding="none"
          className="undo-button"
          color="primary"
          onClick={() => undoRef.current?.()}
        >
          <span className="undo-icon" aria-hidden="true">
            ↩
          </span>
          <span className="sr-only">Undo</span>
        </Button>

        <div className="toolbox">
        <div className="slider">
          <div className="slider-nameplate">Size: {toolSize} px</div>
          <div className="tool-size-slider">
            <input
              type="range"
              min="1"
              max="100"
              value={toolSize}
              onChange={(e) => setToolSize(Number(e.target.value))}
            />
          </div>
        </div>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(String(e.target.value))}
        />
        </div>
      </div>

      <Canvas
        canvasRef={canvasRef}
        undoRef={undoRef}
        tool={tool}
        collapsed={!showCanvas}
        brushSize={toolSize}
        brushColor={color}
      />
    </>
  );
}

export default App;
