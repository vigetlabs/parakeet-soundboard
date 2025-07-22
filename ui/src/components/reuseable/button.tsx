import * as React from "react";
import "./button.css";

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = "",
  children,
  ...props
}) => {
  const classes = `button ${className}`.trim();

  return (
    <div className="soundButtonWrapper">
      <button className={classes} {...props}>
        {children}
      </button>
    </div>
  );
};

export { Button };
