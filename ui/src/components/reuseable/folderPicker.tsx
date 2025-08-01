/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Popover, Label, Checkbox } from "radix-ui";
import "./folderPicker.css";
import {
  ArchiveIcon,
  CheckIcon,
  Cross2Icon,
  PlusIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { EditFolderDialog } from "./folder";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Folder } from "../../util/types";
import { API_URL } from "../../util/db";

export interface FolderListingProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  folder: Folder;
  checked: boolean;
  setChecked: (folder: Folder, pressed: boolean) => void;
}

const FolderListing = ({ folder, checked, setChecked }: FolderListingProps) => {
  return (
    <Label.Root
      htmlFor={folder.slug}
      className={"folderListing" + (checked ? " folderListingChecked" : "")}
    >
      <div>
        <ArchiveIcon className="folderListingIcon" />
        {folder.name}
      </div>
      <Checkbox.Root
        checked={checked}
        id={folder.slug}
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
  selectedFolders: Folder[];
  setSelectedFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
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
  const [createdFolder, setCreatedFolder] = useState<Folder>();

  const { data: folders = [], isLoading } = useQuery({
    queryKey: ["folders", "minimalFolders"],
    queryFn: () =>
      fetch(`${API_URL}/folders/folder_slug_list`).then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch folder slugs");
        const rawFolders = await res.json();
        return rawFolders.sort(
          (a: any, b: any) => parseInt(a.id) - parseInt(b.id)
        );
      }),
  });

  function handleFolderClick(folder: Folder, pressed: boolean) {
    if (pressed) {
      setSelectedFolders((prev) => [...prev, folder]);
    } else {
      setSelectedFolders((prev) => prev.filter((f) => f.slug !== folder.slug));
    }
  }

  useEffect(() => {
    if (createdFolder) {
      setSelectedFolders((prev) => [...prev, createdFolder]);
    }
  }, [createdFolder, setSelectedFolders]);

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
          {isLoading ? (
            <UpdateIcon className="spinIcon spinIconLarge" />
          ) : (
            <>
              <div className="folderContainer">
                {folders.map((folder: any) => (
                  <FolderListing
                    folder={folder}
                    key={folder.slug}
                    checked={selectedFolders.some(
                      (f) => f.slug === folder.slug
                    )}
                    setChecked={handleFolderClick}
                  />
                ))}
                <EditFolderDialog
                  open={newFolderOpen}
                  onOpenChange={setNewFolderOpen}
                  setCreatedFolder={setCreatedFolder}
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
            </>
          )}
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
