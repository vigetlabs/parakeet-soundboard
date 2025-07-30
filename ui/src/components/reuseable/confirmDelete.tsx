import * as React from "react";
import { Dialog } from "radix-ui";
import "./confirmDelete.css";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "./button";

export interface DeleteDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog.Content> {
  open: boolean;
  setClose: () => void;
  isFolder: boolean;
  name: string;
}

const DeleteDialog = ({
  open,
  setClose,
  isFolder,
  name,
  className = "",
  ...props
}: DeleteDialogProps) => {
  const classes = `confirmDeleteModal ${className}`.trim();

  function submitDelete() {
    if (isFolder) {
      console.log("delete folder " + name);
    } else {
      console.log("delete sound " + name);
    }
    setClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={setClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialogOverlay" />
        <Dialog.Content className={classes} {...props}>
          <Dialog.Title asChild>
            <h1>Are you sure?</h1>
          </Dialog.Title>
          <Dialog.Description asChild>
            <p>
              This will permanently delete the {isFolder ? "folder" : "sound"} "
              {name}"
            </p>
          </Dialog.Description>
          <div className="confirmDeleteButtons">
            <Button className="dangerButton" onClick={submitDelete}>
              Delete
            </Button>
            <Dialog.Close asChild>
              <Button>Cancel</Button>
            </Dialog.Close>
          </div>
          <Dialog.Close className="emojiPickerClose" aria-label="Close">
            <Cross2Icon className="emojiPickerCloseIcon" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { DeleteDialog };
