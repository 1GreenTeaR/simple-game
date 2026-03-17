import "./Toolbar.css";
import { Button } from "../../ui/button/Button";

type Tool = "brush" | "eraser";

type Props = {
  activeTool: Tool;
  onSelectTool: (tool: Tool) => void;
};

export default function Toolbar({ activeTool, onSelectTool }: Props) {
  return (
    <div className="toolbar">
      <Button
        className="tools"
        color={activeTool === "brush" ? "secondary" : "primary"}
        size="m"
        padding="none"
        onClick={() => onSelectTool("brush")}
      >
        🖌️
      </Button>
      <Button
        className="tools"
        color={activeTool === "eraser" ? "secondary" : "primary"}
        size="m"
        padding="none"
        onClick={() => onSelectTool("eraser")}
      >
        🧽
      </Button>
    </div>
  );
}
