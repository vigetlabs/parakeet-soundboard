import * as React from "react";
import "./button.css";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isPlaying?: boolean;
  label?: string;
  color?: string;
  emoji?: string;
}

const SoundButton: React.FC<ButtonProps> = ({
  isPlaying,
  label,
  color,
  emoji,
  className = "",
  ...props
}) => {
  const classes = `soundButton ${className}`.trim();

  return (
    <div className="soundButtonWrapper">
      <button
        className={classes}
        style={{
          backgroundColor: color,
          borderColor: isPlaying ? "dodgerblue" : undefined,
        }}
        {...props}
      >
        <div className="buttonEmoji">{emoji ?? ""}</div>
      </button>
      <label className="soundButtonLabel">{label}</label>
    </div>
  );
};

export { SoundButton };
