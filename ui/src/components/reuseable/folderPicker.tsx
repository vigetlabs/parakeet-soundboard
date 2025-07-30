import * as React from "react";
import { Popover, Label, Checkbox } from "radix-ui";
import "./folderPicker.css";
import {
  ArchiveIcon,
  CheckIcon,
  Cross2Icon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { tempFolders } from "../../util/tempData";
import { EditFolderDialog } from "./folder";
import { useState } from "react";

export interface FolderListingProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  folder: string;
  checked: boolean;
  setChecked: (folder: string, pressed: boolean) => void;
}

const FolderListing = ({ folder, checked, setChecked }: FolderListingProps) => {
  return (
    <Label.Root
      htmlFor={folder}
      className={"folderListing" + (checked ? " folderListingChecked" : "")}
    >
      <div>
        <ArchiveIcon className="folderListingIcon" />
        {folder}
      </div>
      <Checkbox.Root
        checked={checked}
        id={folder}
        onCheckedChange={(checked) => setChecked(folder, Boolean(checked))}
        className="folderListingCheckbox"
      >
        <Checkbox.Indicator className="folderListingCheckboxIndicator">
          <CheckIcon />
        </Checkbox.Indicator>
      </Checkbox.Root>
    </Label.Root>
  );
};

export interface FolderPickerProps
  extends React.ComponentPropsWithoutRef<typeof Popover.Content> {
  selectedFolders: string[];
  setSelectedFolders: React.Dispatch<React.SetStateAction<string[]>>;
  disabled?: boolean;
}

const FolderPicker = ({
  selectedFolders,
  setSelectedFolders,
  disabled = false,
  className = "",
  style,
  children,
  ...props
}: FolderPickerProps) => {
  const classes = `folderPicker ${className}`.trim();
  const [newFolderOpen, setNewFolderOpen] = useState(false);

  function handleFolderClick(folder: string, pressed: boolean) {
    if (pressed) {
      setSelectedFolders((prev) => [...prev, folder]);
    } else {
      setSelectedFolders((prev) => [
        ...prev.slice(0, prev.indexOf(folder)),
        ...prev.slice(prev.indexOf(folder) + 1),
      ]);
    }
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="folderPickerButton"
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
          onWheelCapture={(e) => e.stopPropagation() /* Allows scrolling */}
        >
          <h3 className="popoverTitle">Folders</h3>
          <div className="folderContainer">
            {tempFolders.map((folder) => (
              <FolderListing
                folder={folder.name}
                key={folder.name}
                checked={selectedFolders.includes(folder.name)}
                setChecked={handleFolderClick}
                id={folder.name}
              />
            ))}
            <EditFolderDialog
              open={newFolderOpen}
              onOpenChange={setNewFolderOpen}
            >
              <div className="folderListing folderPickerNewButton">
                <div>
                  <PlusIcon className="folderListingIcon" />
                  Create New Folder
                </div>
              </div>
            </EditFolderDialog>
          </div>
          <div className="folderPickerClearContainer">
            <button
              className="folderPickerClearButton"
              onClick={() => setSelectedFolders([])}
            >
              Clear All
            </button>
          </div>
          <Popover.Close className="folderPickerClose" aria-label="Close">
            <Cross2Icon className="folderPickerCloseIcon" />
          </Popover.Close>
          <Popover.Arrow className="folderPickerArrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export { FolderPicker };
