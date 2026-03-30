import { useState } from "react";
import "./App.css";
import { Canvas } from "./components/canvas/Canvas";
import Toolbar from "./components/toolbar/Toolbar";
import { Button } from "./ui/button/Button";

type Tool = "brush" | "eraser";

function App() {
  const [tool, setTool] = useState<Tool>("brush");
  const [showCanvas, setShowCanvas] = useState(true);
  const [brushSize, setBrushSize] = useState(1);

  return (
    <>
      <Toolbar activeTool={tool} onSelectTool={setTool} />
      <div className="fold-toggle">
        <Button
          color={showCanvas ? "primary" : "secondary"}
          size="m"
          padding="full"
          onClick={() => setShowCanvas((prev) => !prev)}
        >
          {showCanvas ? "Fold Canvas" : "Unfold Canvas"}
        </Button>
      </div>
      <div className="tool-size-container">
        <div className="slider-nameplate">Size</div>
        <div className="tool-size-slider">
          <input
            type="range"
            min="1"
            max="100"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
        </div>
      </div>

      <Canvas tool={tool} collapsed={!showCanvas} brushSize={brushSize} />
    </>
  );
}

export default App;
