import { useState } from "react";
import "./App.css";
import { Canvas } from "./components/canvas/Canvas";
import Toolbar from "./components/toolbar/Toolbar";

type Tool = "brush" | "eraser";

function App() {
  const [tool, setTool] = useState<Tool>("brush");

  return (
    <>
      <Toolbar activeTool={tool} onSelectTool={setTool} />
      <Canvas tool={tool} />
    </>
  );
}

export default App;
