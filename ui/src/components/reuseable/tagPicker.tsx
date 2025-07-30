import * as React from "react";
import { Popover, Toggle } from "radix-ui";
import "./tagPicker.css";
import { Cross2Icon } from "@radix-ui/react-icons";
import { tempTags } from "../../util/tempData";

export interface TagPickerProps
  extends React.ComponentPropsWithoutRef<typeof Popover.Content> {
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  disabled?: boolean;
}

const TagPicker = ({
  selectedTags,
  setSelectedTags,
  disabled = false,
  className = "",
  style,
  children,
  ...props
}: TagPickerProps) => {
  const classes = `tagPicker ${className}`.trim();

  function handleTagClick(tag: string, pressed: boolean) {
    if (pressed) {
      setSelectedTags((prev) => [...prev, tag]);
    } else {
      setSelectedTags((prev) => [
        ...prev.slice(0, prev.indexOf(tag)),
        ...prev.slice(prev.indexOf(tag) + 1),
      ]);
    }
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="tagPickerButton"
          disabled={disabled}
          style={style}
        >
          {children}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={4}
          collisionPadding={16}
          className={classes}
          {...props}
        >
          <h1>Tags</h1>
          <div className="tagContainer">
            {tempTags.map((tag) => (
              <Toggle.Root
                key={tag.name}
                className="tagToggle"
                pressed={selectedTags.includes(tag.name)}
                onPressedChange={(pressed) => handleTagClick(tag.name, pressed)}
              >
                {tag.name}
              </Toggle.Root>
            ))}
          </div>
          <div className="tagPickerClearContainer">
            <button
              className="tagPickerClearButton"
              onClick={() => setSelectedTags([])}
            >
              Clear All
            </button>
          </div>
          <Popover.Close className="tagPickerClose" aria-label="Close">
            <Cross2Icon className="tagPickerCloseIcon" />
          </Popover.Close>
          <Popover.Arrow className="tagPickerArrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export { TagPicker };
