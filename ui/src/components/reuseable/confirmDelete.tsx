import { Cross2Icon, UpdateIcon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import { Dialog } from "radix-ui";
import * as React from "react";
import { useAuth } from "../../util/auth";
import { queryClient } from "../../util/db";
import { Button } from "./button";
import "./confirmDelete.css";

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
  const { fetchWithAuth } = useAuth();

  const deleteFolderMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(`/folders/${slug}`, {
        method: "DELETE",
      });

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
      setIsDeleting(false);
      setClose();
    },
  });

  const deleteSoundMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(`/sounds/${dbID}`, {
        method: "DELETE",
      });

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
      setIsDeleting(false);
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
          <Dialog.Close className="tagPickerClose" aria-label="Close">
            <Cross2Icon className="tagPickerCloseIcon" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { DeleteDialog };
