import * as React from "react";
import "./button.css";
import { GearIcon } from "@radix-ui/react-icons";
import { IconProps } from "@radix-ui/react-icons/dist/types";

export interface SoundButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isPlaying?: boolean;
  label?: string;
  color?: string;
  emoji?: string;
}

const SoundButton: React.FC<SoundButtonProps> = ({
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
        name={label}
        style={{
          backgroundColor: color,
          borderColor: isPlaying ? "dodgerblue" : undefined,
        }}
        {...props}
      >
        <div className="visually-hidden">Play sound: {label}</div>
        <div aria-hidden className="buttonEmoji">
          {emoji ?? ""}
        </div>
      </button>
      <div aria-hidden className="soundButtonLabel">
        {label}
      </div>
    </div>
  );
};

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: "gear";
}

const InnerIconButton: React.FC<IconButtonProps> = ({
  className = "",
  icon,
  ...props
}) => {
  const classes = `iconButton ${className}`.trim();

  return (
    <button className={classes} {...props}>
      {chooseIcon(icon, {
        className: "innerIcon",
      })}
    </button>
  );
};

const IconButton: React.FC<IconButtonProps> = ({
  className,
  icon,
  ...props
}) => {
  // It's seperated in case I want to add tooltips later
  return <InnerIconButton icon={icon} className={className} {...props} />;
};
IconButton.displayName = "IconButton";

function chooseIcon(icon: string, props?: IconProps) {
  switch (icon) {
    case "gear":
      return <GearIcon {...props} />;
    default:
      console.error("Invalid icon provided");
      return;
  }
}

export { SoundButton, IconButton };
