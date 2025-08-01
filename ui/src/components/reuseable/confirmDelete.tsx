import * as React from "react";
import { Dialog } from "radix-ui";
import "./confirmDelete.css";
import { Cross2Icon, UpdateIcon } from "@radix-ui/react-icons";
import { Button } from "./button";
import { queryClient } from "../../util/db";
import { useMutation } from "@tanstack/react-query";

export interface DeleteDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog.Content> {
  open: boolean;
  setClose: () => void;
  slug?: string; // for folders
  dbID?: number; // for sounds
  name: string;
}

const DeleteDialog = ({
  open,
  setClose,
  slug,
  dbID,
  name,
  className = "",
  ...props
}: DeleteDialogProps) => {
  const classes = `confirmDeleteModal ${className}`.trim();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const deleteFolderMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_HOST}:${
          import.meta.env.VITE_API_PORT
        }/folders/${slug}`,
        {
          method: "DELETE",
        }
      );

      if (res.status === 204) {
        return null;
      }

      if (!res.ok) {
        throw new Error("Failed to delete folder");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      setClose();
    },
  });

  const deleteSoundMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_HOST}:${
          import.meta.env.VITE_API_PORT
        }/sounds/${dbID}`,
        {
          method: "DELETE",
        }
      );

      if (res.status === 204) {
        return null;
      }

      if (!res.ok) {
        throw new Error("Failed to delete sound");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sounds"] });
      setClose();
    },
  });

  function submitDelete() {
    setIsDeleting(true);
    if (slug) {
      deleteFolderMutation.mutate();
    } else {
      deleteSoundMutation.mutate();
    }
    setIsDeleting(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialogOverlay" />
        <Dialog.Content className={classes} {...props}>
          <Dialog.Title asChild>
            <h3 className="popoverTitle">Are you sure?</h3>
          </Dialog.Title>
          <Dialog.Description asChild>
            <p>
              This will permanently delete the {slug ? "folder" : "sound"} "
              {name}"
            </p>
          </Dialog.Description>
          <div className="confirmDeleteButtons">
            <Button
              className="dangerButton"
              onClick={submitDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <UpdateIcon className="spinIcon" /> : "Delete"}
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
