import { GearIcon } from "@radix-ui/react-icons";
import { IconProps } from "@radix-ui/react-icons/dist/types";
import * as React from "react";
import "./button.css";

export interface SoundButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isPlaying?: boolean;
  label?: string;
  color?: string;
  emoji?: string;
}

const SoundButton = ({
  isPlaying,
  label,
  color,
  emoji,
  className = "",
  ...props
}: SoundButtonProps) => {
  const classes = `soundButton ${className}`.trim();

  return (
    <div className="soundButtonWrapper" title={label}>
      <button
        className={classes}
        name={label}
        style={{
          backgroundColor: color,
          borderColor: isPlaying ? "var(--primary-foreground)" : undefined,
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

const InnerIconButton = ({
  className = "",
  icon,
  ...props
}: IconButtonProps) => {
  const classes = `iconButton ${className}`.trim();

  return (
    <button className={classes} {...props}>
      {chooseIcon(icon, {
        className: "innerIcon",
      })}
    </button>
  );
};

const IconButton = ({ className, icon, ...props }: IconButtonProps) => {
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

export { IconButton, SoundButton };
