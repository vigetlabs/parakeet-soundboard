import * as React from "react";
import "./folder.css";
import type { SoundType } from "../../util/placeholderData";
import { Link } from "react-router-dom";
import {
  Cross2Icon,
  DiscIcon,
  DotsHorizontalIcon,
  FaceIcon,
  Pencil1Icon,
  PlusCircledIcon,
  TrashIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { Dialog, DropdownMenu, Form } from "radix-ui";
import { TextInput } from "./input";
import { Button } from "./button";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, API_URL } from "../../util/db";
import type { Folder } from "../../util/types";

export interface SoundButtonDisplayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  color?: string;
  emoji?: string;
  numSounds?: number;
  emojiPicker?: React.Dispatch<React.SetStateAction<string>>;
}

const SoundButtonDisplay = ({
  // non-functional button that looks the same
  color,
  emoji,
  numSounds,
  emojiPicker,
  className = "",
  ...props
}: SoundButtonDisplayProps) => {
  const classes = `soundButtonDisplay ${className}`.trim();

  return (
    <div
      className={classes}
      style={{
        backgroundColor: color,
      }}
      {...props}
    >
      <div aria-hidden className="buttonDisplayEmoji">
        {emoji ?? ""}
      </div>
      {numSounds && (
        <div aria-hidden className="buttonDisplayNum">
          <DiscIcon className="buttonDisplayNumIcon" /> {numSounds}
        </div>
      )}
      {emojiPicker && (
        <button>
          <FaceIcon className="buttonDisplayPickerIcon" />
        </button>
      )}
    </div>
  );
};

export interface FolderButtonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  slug: string;
  numSounds: number;
  firstSounds: SoundType; // only the first 4 (for display)
  editFunction: (name: string, slug: string) => void;
  deleteFunction: (name: string, slug: string) => void;
}

const FolderButton = ({
  name,
  slug,
  numSounds,
  firstSounds,
  editFunction,
  deleteFunction,
  className = "",
  ...props
}: FolderButtonProps) => {
  const classes = `folderButtonWrapper ${className}`.trim();
  const [displayMenu, setDisplayMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      onMouseEnter={() => {
        setDisplayMenu(true);
      }}
      onMouseLeave={() => {
        setDisplayMenu(false);
      }}
    >
      {name !== "Favorites" && (
        <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="soundButtonMenu folderButtonMenu"
              style={{ opacity: displayMenu || menuOpen ? 1 : 0 }}
            >
              <DotsHorizontalIcon className="soundButtonMenuIcon" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              side="right"
              sideOffset={8}
              className="soundButtonMenuContent"
              onClick={() => setDisplayMenu(false)}
            >
              <DropdownMenu.Item
                className="soundButtonMenuItem"
                onSelect={() => editFunction(name, slug)}
              >
                <Pencil1Icon className="soundButtonMenuItemIcon" />
                Edit
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="soundButtonMenuItem soundButtonMenuItemDanger"
                onSelect={() => deleteFunction(name, slug)}
              >
                <TrashIcon className="soundButtonMenuItemIcon" />
                Delete Folder
              </DropdownMenu.Item>

              <DropdownMenu.Arrow className="soundButtonMenuArrow" />
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
      <Link to={`/folders/${slug}`}>
        <div className={classes} {...props}>
          <div className="visually-hidden">Open folder: {name}</div>
          <div aria-hidden className="folderButtonSoundWrapper">
            {[...Array(4)].map((_, i) => {
              if (i == 3 && numSounds > 4) {
                return (
                  <SoundButtonDisplay
                    key={i}
                    color="var(--elevated-background)"
                    numSounds={numSounds}
                    className="folderSoundButtonDisplay"
                  />
                );
              } else if (firstSounds.length > i) {
                return (
                  <SoundButtonDisplay
                    key={i}
                    color={firstSounds[i].color}
                    emoji={firstSounds[i].emoji}
                    className="folderSoundButtonDisplay"
                  />
                );
              } else {
                return (
                  <SoundButtonDisplay
                    key={i}
                    color="var(--elevated-background)"
                    className="folderSoundButtonDisplay"
                  />
                );
              }
            })}
          </div>
          <div aria-hidden className="folderButtonLabel">
            {name}
          </div>
        </div>
      </Link>
    </div>
  );
};

const NewFolderButton = ({
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const classes =
    `folderButtonWrapper newFolderButtonWrapper ${className}`.trim();

  return (
    <button className={classes} {...props}>
      <div className="visually-hidden">Create new folder</div>
      <div aria-hidden className="folderButtonSoundWrapper">
        {[...Array(4)].map((_, i) => (
          <SoundButtonDisplay
            key={i}
            color="var(--inner-background)"
            style={{ border: "2px solid var(--primary-muted-dark)" }}
            className="folderSoundButtonDisplay"
          />
        ))}
      </div>

      <div aria-hidden className="folderButtonLabel newFolderButtonLabel">
        <PlusCircledIcon className="newFolderIcon" />
        New Folder
      </div>
    </button>
  );
};

export interface EditFolderProps
  extends React.ComponentPropsWithoutRef<typeof Dialog.Root> {
  previousName?: string;
  slug?: string;
  className?: string;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  setCreatedFolder?: React.Dispatch<React.SetStateAction<Folder | undefined>>;
}

const EditFolderDialog = ({
  previousName = "",
  slug = "",
  className = "",
  open,
  onOpenChange,
  setCreatedFolder,
  children,
  ...props
}: EditFolderProps) => {
  const classes = `editFolderDialog ${className}`.trim();
  const [name, setName] = useState(previousName);
  const [isSaving, setIsSaving] = useState(false);

  const editFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const formData = new FormData();
      formData.append("folder[name]", name);

      const res = await fetch(`${API_URL}/folders/${slug}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to edit folder");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      setIsSaving(false);
      onOpenChange(false);
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const formData = new FormData();
      formData.append("folder[name]", name);

      const res = await fetch(`${API_URL}/folders`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to add folder");
      }

      return res.json();
    },
    onSuccess: (createdFolder) => {
      if (setCreatedFolder) {
        setCreatedFolder({
          name: createdFolder.data.attributes.name,
          slug: createdFolder.data.attributes.slug,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      setIsSaving(false);
      onOpenChange(false);
    },
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    setIsSaving(true);
    event.preventDefault();
    event.stopPropagation();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (slug === "") {
      createFolderMutation.mutate(data.name as string);
    } else {
      editFolderMutation.mutate(data.name as string);
    }
  }

  function resetOnOpen() {
    setName(previousName);
  }

  useEffect(() => {
    if (open) {
      resetOnOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open) => {
        resetOnOpen();
        onOpenChange(open);
      }}
      {...props}
    >
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialogOverlay" />
        <Dialog.Content className={classes}>
          <Form.Root onSubmit={handleSubmit}>
            <Form.Field name="name">
              <Dialog.Title>
                <Form.Label>
                  <h3 className="popoverTitle">
                    {slug ? "Edit" : "Create"} Folder
                  </h3>
                </Form.Label>
              </Dialog.Title>
              <Form.Message match="valueMissing">
                Please enter a name
              </Form.Message>
              <Form.Control asChild>
                <TextInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="editFolderDialogInput"
                  placeholder="Folder name"
                  required
                />
              </Form.Control>
            </Form.Field>
            <Form.Submit asChild>
              <Button className="rightAlign" disabled={isSaving}>
                {isSaving ? <UpdateIcon className="spinIcon" /> : "Done"}
              </Button>
            </Form.Submit>
          </Form.Root>
          <Dialog.Close asChild>
            <button className="tagPickerClose" aria-label="Close">
              <Cross2Icon className="tagPickerCloseIcon" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { SoundButtonDisplay, FolderButton, NewFolderButton, EditFolderDialog };
