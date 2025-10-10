import { Cross2Icon, UpdateIcon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import { Dialog, Form } from "radix-ui";
import { useState, useEffect } from "react";
import { Button, FolderPicker, TextInput } from ".";
import { useAuth } from "../../util/auth";
import { queryClient } from "../../util/db";
import type { Folder, Tag } from "../../util/types";

interface AddToFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sound?: {
    name: string;
    id: number | null;
    emoji: string;
    color: string;
    tags: Tag[];
    folders: Folder[];
  };
}

export const AddToFolderDialog = ({
  open,
  onOpenChange,
  sound,
}: AddToFolderDialogProps) => {
  const [editingFolders, setEditingFolders] = useState<Folder[]>(
    sound?.folders || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const { fetchWithAuth } = useAuth();

  const updateFoldersMutation = useMutation({
    mutationFn: async (folders: string[]) => {
      if (!sound?.id) {
        throw new Error("No sound ID available");
      }
      const soundId = sound.id as number;

      const currentFolderSlugs = sound?.folders.map((f) => f.slug) || [];

      const toAdd = folders.filter(
        (slug) => !currentFolderSlugs.includes(slug)
      );
      const toRemove = currentFolderSlugs.filter(
        (slug) => !folders.includes(slug)
      );

      const promises = [
        ...toAdd.map((folderSlug) =>
          fetchWithAuth(`/folders/${folderSlug}/add_sound`, {
            method: "POST",
            body: (() => {
              const fd = new FormData();
              fd.append("sound_id", soundId.toString());
              return fd;
            })(),
          })
        ),
        ...toRemove.map((folderSlug) =>
          fetchWithAuth(`/folders/${folderSlug}/remove_sound`, {
            method: "DELETE",
            body: (() => {
              const fd = new FormData();
              fd.append("sound_id", soundId.toString());
              return fd;
            })(),
          })
        ),
      ];

      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sounds"] });
      setIsSaving(false);
      onOpenChange(false);
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    updateFoldersMutation.mutate(JSON.parse(data.folders as string));
  }

  useEffect(() => {
    if (open) {
      setEditingFolders(sound?.folders || []);
    }
  }, [open, sound]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialogOverlay" />
        <Dialog.Content className="editDialog">
          <Dialog.Title className="editDialogTitle">Add to Folder</Dialog.Title>

          <Form.Root onSubmit={handleSubmit}>
            <Form.Field
              className="editDialogFieldContainer editDialogFieldContainerSelector"
              name="folders"
            >
              <FolderPicker
                selectedFolders={editingFolders}
                setSelectedFolders={setEditingFolders}
                side="right"
                align="center"
                style={{ width: "100%" }}
              >
                <Form.Label className="visually-hidden">Folders</Form.Label>
                <TextInput
                  disabled
                  value={
                    editingFolders.length > 0
                      ? editingFolders
                          .map((folder: any) => folder.name)
                          .join(", ")
                      : "Select Folders"
                  }
                  leftIcon="archive"
                  rightIcon="chevronRight"
                  iconSize={32}
                  className="editDialogInput editDialogInputDisabled"
                  style={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                />
                <Form.Control asChild>
                  <input
                    type="hidden"
                    value={JSON.stringify(
                      editingFolders.map((folder) => folder.slug)
                    )}
                  />
                </Form.Control>
              </FolderPicker>
            </Form.Field>

            <Form.Submit asChild>
              <Button
                className="rightAlign editDialogSubmit"
                disabled={isSaving}
              >
                {isSaving ? <UpdateIcon className="spinIcon" /> : "Save"}
              </Button>
            </Form.Submit>
          </Form.Root>

          <Dialog.Close className="tagPickerClose" aria-label="Close">
            <Cross2Icon className="tagPickerCloseIcon" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
