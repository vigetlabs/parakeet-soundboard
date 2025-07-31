import * as React from "react";
import { unstable_PasswordToggleField as PasswordToggleField } from "radix-ui";
import {
  MagnifyingGlassIcon,
  MixerVerticalIcon,
  EyeClosedIcon,
  EyeOpenIcon,
} from "@radix-ui/react-icons";
import "./input.css";
import { TagPicker } from "./tagPicker";

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  email?: boolean;
  icon?: boolean;
  filter?: boolean;
  filterOptions?: string[];
  filterDisabled?: boolean;
  setFilterOptions?: React.Dispatch<React.SetStateAction<string[]>>;
}

const TextInput = ({
  className = "",
  email = false,
  icon = false,
  filter = false,
  filterOptions,
  filterDisabled,
  setFilterOptions,
  ...props
}: TextInputProps) => {
  const classes = `textInputWrapper ${className}`.trim();

  return (
    <div className={classes}>
      {icon && <MagnifyingGlassIcon className="textInputIcon" />}
      <input type={email ? "email" : "text"} className="textInput" {...props} />
      {filter && (
        <TagPicker
          selectedTags={filterOptions ?? []}
          setSelectedTags={setFilterOptions ?? (() => {})}
          disabled={filterDisabled}
        >
          <MixerVerticalIcon className="filterInputIcon" />
        </TagPicker>
      )}
    </div>
  );
};

const PasswordInput = ({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof PasswordToggleField.Input>) => {
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
