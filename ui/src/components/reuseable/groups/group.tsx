import {
  CheckIcon,
  CopyIcon,
  Cross2Icon,
  DotsHorizontalIcon,
  EnterIcon,
  FaceIcon,
  Pencil1Icon,
  PlusCircledIcon,
  TrashIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { Dialog, DropdownMenu, Form } from "radix-ui";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button, EmojiPicker, TextInput } from "..";
import { defaultColors, placeholderAdmins } from "../../../util/placeholderData";
import "./group.css";

export interface GroupButtonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  slug: string;
  emoji?: string; // placeholder until wired up
  color?: string; // placeholder until wired up
  code?: string; // placeholder until wired up
  editFunction?: (name: string, slug: string) => void;
  deleteFunction?: (name: string, slug: string) => void;
}

const GroupButton = ({
  name,
  slug,
  emoji = "",
  color,
  code = "",
  editFunction = () => {}, // placeholder until wired up
  deleteFunction = () => {}, // placeholder until wired up
  className = "",
  ...props
}: GroupButtonProps) => {
  const classes = `groupButtonWrapper ${className}`.trim();
  const [displayMenu, setDisplayMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  function handleCopyCode(event: React.MouseEvent) {
    // sits inside a <Link>, so stop the click from navigating
    event.preventDefault();
    event.stopPropagation();
    navigator.clipboard?.writeText(code);
    setCopied(true);
    clearTimeout(copiedTimeout.current);
    copiedTimeout.current = setTimeout(() => setCopied(false), 1500);
  }

  useEffect(() => () => clearTimeout(copiedTimeout.current), []);

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
        <div className={classes} style={{ backgroundColor: color }} {...props}>
          <div className="visually-hidden">Open group: {name}</div>
          <div className="emojiIcon">{emoji}</div>
          <div aria-hidden className="groupButtonLabel">
            <span className="groupButtonName">{name}</span>
            {/* placeholder: join code for sharing this group */}
            <span className="groupButtonCode">
              <span className="groupButtonCodeLabel">Code:</span>
              <span className="groupButtonCodeValueRow">
                <span className="groupButtonCodeValue">{code}</span>
                <button
                  type="button"
                  className="groupButtonCopyButton"
                  aria-label={copied ? "Code copied" : "Copy code"}
                  onClick={handleCopyCode}
                >
                  {copied ? (
                    <CheckIcon className="groupButtonCopyIcon" />
                  ) : (
                    <CopyIcon className="groupButtonCopyIcon" />
                  )}
                </button>
                {copied && (
                  <span aria-live="polite" className="groupButtonCopied">
                    Copied!
                  </span>
                )}
              </span>
            </span>
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
    `groupButtonWrapper createGroupButtonWrapper ${className}`.trim();

  return (
    <button className={classes} {...props}>
      <div className="visually-hidden">Create new group</div>
      <div aria-hidden className="createGroupContent">
        <PlusCircledIcon className="newGroupIcon" />
        Create
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
      {/* placeholder: code entry box, not yet wired up */}
      <div aria-hidden className="joinGroupCodeBox">
        Enter Code
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
  open,
  onOpenChange,
  children,
  ...props
}: EditGroupProps) => {
  const [name, setName] = useState(previousName);
  const [emoji, setEmoji] = useState("🎲");
  const [color, setColor] = useState(defaultColors[0]);
  const [textColor, setTextColor] = useState("#ffffff");
  const [adminEmail, setAdminEmail] = useState("");
  const [admins, setAdmins] = useState(placeholderAdmins);
  const [isSaving, setIsSaving] = useState(false);
  const colorPickerRef = useRef<HTMLInputElement>(null);

  function handleAddAdmin() {
    const trimmed = adminEmail.trim();
    if (!trimmed) return;
    setAdmins([...admins, { name: trimmed, email: trimmed }]);
    setAdminEmail("");
  }

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
    setEmoji("🎲");
    setColor(defaultColors[0]);
    setTextColor("#ffffff");
    setAdminEmail("");
    setAdmins([...placeholderAdmins]);
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
        <Dialog.Content className="groupDialog">
          <Form.Root onSubmit={handleSubmit} className="groupDialogForm">
            <Dialog.Title className="groupDialogTitle">
              {slug ? "Edit" : "Create"} Group
            </Dialog.Title>
            <Dialog.Description className="groupDialogSubtitle">
              Set up your group name and icon
            </Dialog.Description>

            <Form.Field name="name" className="groupDialogNameField">
              <Form.Message className="editDialogMessage" match="valueMissing">
                Please enter a name
              </Form.Message>
              <Form.Control asChild>
                <TextInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Group name"
                  required
                />
              </Form.Control>
            </Form.Field>

            <div className="groupDialogDesignRow">
              {/* 1. Emoji preview + picker */}
              <div className="groupDialogEmojiSection">
                <div
                  className="groupDialogPreview"
                  style={{ backgroundColor: color }}
                >
                  <span className="groupDialogPreviewEmoji">{emoji}</span>
                  <span
                    className="groupDialogPreviewName"
                    style={{ color: textColor }}
                  >
                    {name || "Group Name"}
                  </span>
                </div>
                <Form.Field name="emoji" className="groupDialogEmojiPickerField">
                  <EmojiPicker setSelectedEmoji={setEmoji} side="right">
                    <FaceIcon className="buttonDisplayPickerIcon" />
                  </EmojiPicker>
                  <Form.Control asChild>
                    <input type="hidden" value={emoji} />
                  </Form.Control>
                </Form.Field>
              </div>

              {/* 2. Color swatches */}
              <Form.Field name="color" className="groupDialogColorSection">
                {defaultColors.map((c) => (
                  <div key={c} className="editDialogColorButtonWrapper">
                    <button
                      type="button"
                      className="editDialogColorButton"
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    />
                  </div>
                ))}
                <div className="editDialogColorButtonWrapper">
                  <input
                    type="color"
                    ref={colorPickerRef}
                    style={{ display: "none" }}
                    value={color}
                    onInput={(e) =>
                      setColor((e.target as HTMLInputElement).value)
                    }
                  />
                  <button
                    type="button"
                    className="editDialogColorButton rainbowButton"
                    onClick={() => colorPickerRef.current?.click()}
                  />
                </div>
                <div className="editDialogHexInputWrapper">
                  <Form.Control asChild>
                    <input
                      type="text"
                      className="editDialogHexInput"
                      value={color}
                      onChange={(e) => {
                        const val =
                          "#" +
                          e.target.value.replaceAll("#", "").toLowerCase();
                        setColor(val);
                      }}
                      required
                    />
                  </Form.Control>
                </div>
              </Form.Field>

              {/* 3. Text font color */}
              <div className="groupDialogFontColorSection">
                <span className="groupDialogFontColorLabel">
                  Text Font Color
                </span>
                <div className="groupDialogFontColorButtons">
                  <button
                    type="button"
                    aria-label="Black text"
                    className={`groupDialogFontColorBtn groupDialogFontColorBtnBlack${textColor === "#000000" ? " groupDialogFontColorBtnSelected" : ""}`}
                    onClick={() => setTextColor("#000000")}
                  />
                  <button
                    type="button"
                    aria-label="White text"
                    className={`groupDialogFontColorBtn groupDialogFontColorBtnWhite${textColor === "#ffffff" ? " groupDialogFontColorBtnSelected" : ""}`}
                    onClick={() => setTextColor("#ffffff")}
                  />
                </div>
              </div>
            </div>

            {/* Admin list — scrollable when content pushes past 75vh */}
            <div className="groupDialogAdminSection">
              <h4 className="groupDialogAdminHeader">Admins</h4>
              <div className="groupDialogAdminList">
                {admins.map((admin, i) => (
                  <div key={i} className="groupDialogAdminItem">
                    <span className="groupDialogAdminName">{admin.name}</span>
                    <span className="groupDialogAdminEmail">{admin.email}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fixed bottom — outside scroll */}
            <div className="groupDialogAddAdminRow">
              <TextInput
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAdmin();
                  }
                }}
                placeholder="Email address"
                className="groupDialogEmailInput"
              />
              <Button
                type="button"
                onClick={handleAddAdmin}
                className="groupDialogAddBtn"
              >
                Add
              </Button>
            </div>

            <Form.Submit asChild>
              <Button className="groupDialogFinish" disabled={isSaving}>
                {isSaving ? <UpdateIcon className="spinIcon" /> : "Finish"}
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
