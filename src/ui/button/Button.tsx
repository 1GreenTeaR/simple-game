import { type ReactNode, useRef } from "react";
import "./Button.css";

type Props = {
  children?: ReactNode;
  onClick?: () => void;
  color?:
    | "primary"
    | "secondary"
    | "regular"
    | "regular-elevated"
    | "regular-transparent";
  size?: "s" | "m" | "l" | "xl";
  disabled?: boolean;
  padding?: "full" | "none";
  className?: string;
};

export function Button({
  color = "primary",
  onClick,
  size = "l",
  children,
  disabled = false,
  padding = "full",
  className,
}: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`button-wrapper ${className}`} ref={wrapperRef}>
      <button
        ref={buttonRef}
        onClick={onClick}
        color={color}
        className={`button button-color-${color} button-size-${size} ${
          disabled ? "button-disabled" : ""
        } button-padding-${padding}`}
      >
        <div className="button-content">{children}</div>
      </button>
    </div>
  );
}
