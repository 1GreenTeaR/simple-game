import "./Toolbar.css";
import { Button } from "./ui/button/Button";
export default function Toolbar() {
  return (
    <div className="toolbar">
      <Button className="tool" color="primary" size="m" padding="none">
        🖌️
      </Button>
      <Button className="tool" color="primary" size="m" padding="none">
        🧽
      </Button>
    </div>
  );
}
