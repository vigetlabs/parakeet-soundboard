import {
  Cross2Icon,
  DotsHorizontalIcon,
  EnterIcon,
  Pencil1Icon,
  PersonIcon,
  PlusCircledIcon,
  TrashIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { Dialog, DropdownMenu, Form } from "radix-ui";
import * as React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, TextInput } from "..";
import { SoundButtonDisplay } from "../folders/folder";
import "../folders/folder.css";

export interface GroupButtonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  slug: string;
  emoji?: string; // placeholder until wired up
  color?: string; // placeholder until wired up
  code?: string; // placeholder until wired up
  numMembers?: number; // placeholder: groups are shared with other people
  editFunction?: (name: string, slug: string) => void;
  deleteFunction?: (name: string, slug: string) => void;
}

const GroupButton = ({
  name,
  slug,
  emoji = "",
  color,
  code = "",
  numMembers = 0,
  editFunction = () => {}, // placeholder until wired up
  deleteFunction = () => {}, // placeholder until wired up
  className = "",
  ...props
}: GroupButtonProps) => {
  const classes = `groupButtonWrapper ${className}`.trim();
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
      title={name}
    >
      <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="soundButtonMenu groupButtonMenu"
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
              Delete Group
            </DropdownMenu.Item>

            <DropdownMenu.Arrow className="soundButtonMenuArrow" />
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <Link to={`/groups/${slug}`}>
        <div className={classes} {...props}>
          <div className="visually-hidden">Open group: {name}</div>
          <div className="emojiIcon" style={{ backgroundColor: color }}>
            {emoji}
          </div>
          <div aria-hidden className="groupButtonLabel">
            {name}
            {/* placeholder: surface how many people share this group */}
            <span className="groupButtonMembers">
              <PersonIcon /> {numMembers}
            </span>
            {/* placeholder: join code for sharing this group */}
            <span className="groupButtonCode">{code}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

const NewGroupButton = ({
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const classes =
    `groupButtonWrapper newGroupButtonWrapper ${className}`.trim();

  return (
    <button className={classes} {...props}>
      <div className="visually-hidden">Create new group</div>
      <div aria-hidden className="groupButtonSoundWrapper">
        {[...Array(4)].map((_, i) => (
          <SoundButtonDisplay
            key={i}
            color="var(--inner-background)"
            style={{ border: "2px solid var(--primary-muted-dark)" }}
            className="groupSoundButtonDisplay"
          />
        ))}
      </div>

      <div aria-hidden className="groupButtonLabel newGroupButtonLabel">
        <PlusCircledIcon className="newGroupIcon" />
        New Group
      </div>
    </button>
  );
};

const JoinGroupButton = ({
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const classes =
    `groupButtonWrapper newGroupButtonWrapper joinGroupButtonWrapper ${className}`.trim();

  return (
    <button className={classes} {...props}>
      <div className="visually-hidden">Join a group</div>
      <div aria-hidden className="groupButtonSoundWrapper">
        {[...Array(4)].map((_, i) => (
          <SoundButtonDisplay
            key={i}
            color="var(--inner-background)"
            style={{ border: "2px solid var(--primary-muted-dark)" }}
            className="groupSoundButtonDisplay"
          />
        ))}
      </div>

      <div aria-hidden className="groupButtonLabel newGroupButtonLabel">
        <EnterIcon className="newGroupIcon" />
        Join Group
      </div>
    </button>
  );
};

export interface EditGroupProps
  extends React.ComponentPropsWithoutRef<typeof Dialog.Root> {
  previousName?: string;
  slug?: string;
  className?: string;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditGroupDialog = ({
  previousName = "",
  slug = "",
  className = "",
  open,
  onOpenChange,
  children,
  ...props
}: EditGroupProps) => {
  const classes = `editGroupDialog ${className}`.trim();
  const [name, setName] = useState(previousName);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    setIsSaving(true);
    event.preventDefault();
    event.stopPropagation();
    // placeholder: groups aren't wired to a backend yet
    setIsSaving(false);
    onOpenChange(false);
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
                    {slug ? "Edit" : "Create"} Group
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
                  className="editGroupDialogInput"
                  placeholder="Group name"
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

export { EditGroupDialog, GroupButton, JoinGroupButton, NewGroupButton };
