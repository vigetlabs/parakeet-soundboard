import * as React from "react";
import { Popover } from "radix-ui";
import "./emojiPicker.css";
import { Cross2Icon } from "@radix-ui/react-icons";
import Picker, { Categories } from "emoji-picker-react";

export interface EmojiPickerProps
  extends React.ComponentPropsWithoutRef<typeof Popover.Content> {
  setSelectedEmoji: React.Dispatch<React.SetStateAction<string>>;
}

const EmojiPicker = ({
  setSelectedEmoji,
  className = "",
  style,
  children,
  ...props
}: EmojiPickerProps) => {
  const classes = `emojiPicker ${className}`.trim();

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button type="button" className="emojiPickerButton" style={style}>
          {children}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={4}
          collisionPadding={16}
          onWheelCapture={(e) => e.stopPropagation() /* Allows scrolling */}
          {...props}
        >
          <Picker
            className={classes}
            categories={[
              { category: Categories.SMILEYS_PEOPLE, name: "Smileys & People" },
              { category: Categories.ANIMALS_NATURE, name: "Animals & Nature" },
              { category: Categories.FOOD_DRINK, name: "Food & Drink" },
              { category: Categories.TRAVEL_PLACES, name: "Travel & Places" },
              { category: Categories.ACTIVITIES, name: "Activities" },
              { category: Categories.OBJECTS, name: "Objects" },
              { category: Categories.SYMBOLS, name: "Symbols" },
              { category: Categories.FLAGS, name: "Flags" },
            ]}
            previewConfig={{
              showPreview: false,
            }}
            onEmojiClick={(emojiObject) => {
              setSelectedEmoji(emojiObject.emoji);
            }}
          />
          <Popover.Close className="emojiPickerClose" aria-label="Close">
            <Cross2Icon className="emojiPickerCloseIcon" />
          </Popover.Close>
          <Popover.Arrow className="emojiPickerArrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export { EmojiPicker };
