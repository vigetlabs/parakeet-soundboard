import {
  EyeClosedIcon,
  EyeOpenIcon,
  MixerVerticalIcon,
} from "@radix-ui/react-icons";
import { unstable_PasswordToggleField as PasswordToggleField } from "radix-ui";
import * as React from "react";
import { TagPicker } from ".";
import { chooseIcon, type AvaliableIcons } from "../../util";
import type { Tag } from "../../util/types";
import "./input.css";

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  email?: boolean;
  leftIcon?: AvaliableIcons;
  rightIcon?: AvaliableIcons;
  rightIconAction?: () => void;
  iconSize?: number;
  filter?: boolean;
  filterOptions?: Tag[];
  setFilterOptions?: React.Dispatch<React.SetStateAction<Tag[]>>;
  filterDisabled?: boolean;
}

const TextInput = ({
  className = "",
  email = false,
  leftIcon,
  rightIcon,
  rightIconAction,
  iconSize = 16,
  filter = false,
  filterOptions,
  filterDisabled,
  setFilterOptions,
  ...props
}: TextInputProps) => {
  const classes = `textInputWrapper ${className}`.trim();

  return (
    <label className={classes}>
      {leftIcon &&
        chooseIcon(
          leftIcon,
          {
            className: "textInputIcon",
            "aria-hidden": true,
          },
          iconSize
        )}
      <input type={email ? "email" : "text"} className="textInput" {...props} />
      {filter && (
        <TagPicker
          selectedTags={filterOptions ?? []}
          setSelectedTags={setFilterOptions ?? (() => {})}
          disabled={filterDisabled}
          align="end"
          alignOffset={-30}
        >
          <div className="filterInputIconWrapper">
            <MixerVerticalIcon
              className={
                "filterInputIcon" +
                (filterOptions?.length ?? 0 > 0 ? " filterInputIconActive" : "")
              }
            />
          </div>
        </TagPicker>
      )}
      {rightIcon &&
        (rightIconAction ? (
          <button onClick={rightIconAction} className="textInputButton">
            {chooseIcon(
              rightIcon,
              {
                className: "textInputIcon",
                "aria-hidden": true,
              },
              iconSize
            )}
          </button>
        ) : (
          chooseIcon(
            rightIcon,
            {
              className: "textInputIcon",
              "aria-hidden": true,
            },
            iconSize
          )
        ))}
    </label>
  );
};

const PasswordInput = ({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof PasswordToggleField.Input>) => {
  const classes = `textInputWrapper passwordRoot ${className}`.trim();

  return (
    <PasswordToggleField.Root>
      <label className={classes}>
        <PasswordToggleField.Input
          className="textInput passwordInput"
          {...props}
        />
        <PasswordToggleField.Toggle className="passwordEyeToggle">
          <PasswordToggleField.Icon
            visible={<EyeOpenIcon />}
            hidden={<EyeClosedIcon />}
            className="passwordEyeToggleIcon"
          />
        </PasswordToggleField.Toggle>
      </label>
    </PasswordToggleField.Root>
  );
};

export { PasswordInput, TextInput };
