import * as React from "react";
import { unstable_PasswordToggleField as PasswordToggleField } from "radix-ui";
import {
  MagnifyingGlassIcon,
  EyeClosedIcon,
  EyeOpenIcon,
} from "@radix-ui/react-icons";
import "./input.css";

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  email?: boolean;
  icon?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  className = "",
  email = false,
  icon = false,
  ...props
}) => {
  const classes = `textInputWrapper ${className}`.trim();

  return (
    <div className={classes}>
      {icon && <MagnifyingGlassIcon className="textInputIcon" />}
      <input type={email ? "email" : "text"} className="textInput" {...props} />
    </div>
  );
};

const PasswordInput: React.FC<
  React.ComponentPropsWithoutRef<typeof PasswordToggleField.Input>
> = ({ className = "", ...props }) => {
  const classes = `passwordRoot ${className}`.trim();

  return (
    <PasswordToggleField.Root>
      <div className={classes}>
        <PasswordToggleField.Input className="passwordInput" {...props} />
        <PasswordToggleField.Toggle className="passwordEyeToggle">
          <PasswordToggleField.Icon
            visible={<EyeOpenIcon />}
            hidden={<EyeClosedIcon />}
          />
        </PasswordToggleField.Toggle>
      </div>
    </PasswordToggleField.Root>
  );
};

export { TextInput, PasswordInput };
