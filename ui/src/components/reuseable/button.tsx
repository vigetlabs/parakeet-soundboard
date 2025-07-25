import * as React from "react";
import "./button.css";
import { chooseIcon, type AvaliableIcons } from "../../util";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: AvaliableIcons;
}

const Button: React.FC<ButtonProps> = ({
  className = "",
  icon,
  children,
  ...props
}) => {
  const classes = `button ${className}`.trim();

  return (
    <button className={classes} {...props}>
      {icon && chooseIcon(icon, { className: "buttonIcon" })}
      {children}
    </button>
  );
};

export interface SoundButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  color: string;
  emoji: string;
  isPlaying?: boolean;
}

const SoundButton: React.FC<SoundButtonProps> = ({
  label,
  color,
  emoji,
  isPlaying,
  className = "",
  ...props
}) => {
  const classes = `soundButtonWrapper ${className}`.trim();

  return (
    <div className={classes}>
      <button
        className="soundButton"
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
  icon: AvaliableIcons;
  label?: string;
  selected?: boolean;
}

const InnerIconButton: React.FC<IconButtonProps> = ({
  className = "",
  icon,
  label,
  selected = false,
  ...props
}) => {
  const classes = `iconButton ${className} ${
    selected ? "iconButtonSelected" : ""
  }`.trim();

  return (
    <button className="iconButtonWrapper" {...props}>
      <div className={classes}>
        {chooseIcon(icon, {
          className: "innerIcon",
        })}
      </div>
      {/* TODO: Add tooltip if the name is too long */}
      {label && <div className="iconButtonLabel">{label}</div>}
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

export { Button, SoundButton, IconButton };
