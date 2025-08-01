/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Popover, Toggle } from "radix-ui";
import "./tagPicker.css";
import { Cross2Icon, UpdateIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";

export type Tag = { name: string; id?: number; color?: string };

export interface TagPickerProps
  extends React.ComponentPropsWithoutRef<typeof Popover.Content> {
  selectedTags: Tag[];
  setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>;
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

  const { data: tags, isLoading } = useQuery({
    queryKey: ["tags", "allTags"],
    queryFn: () =>
      fetch(
        `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/tags`
      ).then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch tags");

        const rawTags = (await res.json()).data;
        return rawTags
          .sort((a: any, b: any) => parseInt(a.id) - parseInt(b.id))
          .map((tag: any) => {
            return {
              name: tag.attributes.name,
              id: parseInt(tag.id),
              color: tag.attributes.color,
            };
          });
      }),
  });

  function handleTagClick(tag: any, pressed: boolean) {
    if (pressed) {
      setSelectedTags((prev) => [...prev, tag]);
    } else {
      setSelectedTags((prev) => prev.filter((t) => t.name !== tag.name));
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
          <h3 className="popoverTitle">Tags</h3>
          {isLoading ? (
            <UpdateIcon className="spinIcon spinIconLarge" />
          ) : (
            <>
              <div className="tagContainer">
                {(tags ?? []).map((tag: any) => (
                  <Toggle.Root
                    key={tag.name}
                    className="tagToggle"
                    pressed={selectedTags.some((t) => t.name == tag.name)}
                    onPressedChange={(pressed) => handleTagClick(tag, pressed)}
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
            </>
          )}
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
