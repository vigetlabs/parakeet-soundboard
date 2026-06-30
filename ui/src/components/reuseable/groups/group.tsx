import {
  CheckIcon,
  CopyIcon,
  Cross2Icon,
  DotsHorizontalIcon,
  EnterIcon,
  FaceIcon,
  PlusCircledIcon,
  TrashIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { Dialog, DropdownMenu, Form } from "radix-ui";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Button, EmojiPicker, TextInput } from "..";
import {
  defaultColors,
  placeholderAdmins,
  placeholderGroups,
} from "../../../util/placeholderData";
import "./group.css";

export interface GroupButtonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  slug: string;
  emoji?: string; // placeholder until wired up
  color?: string; // placeholder until wired up
  textColor?: string; // placeholder until wired up
  code?: string; // placeholder until wired up
  editFunction?: (name: string, slug: string) => void;
  deleteFunction?: (name: string, slug: string) => void;
}

const GroupButton = ({
  name,
  slug,
  emoji = "",
  color,
  textColor,
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
      <div
        className={classes}
        style={{ backgroundColor: color }}
        role="button"
        tabIndex={0}
        onClick={() => editFunction(name, slug)}
        {...props}
      >
        <div className="visually-hidden">Edit group: {name}</div>
        <div className="emojiIcon">{emoji}</div>
        <div aria-hidden className="groupButtonLabel" style={{ color: textColor }}>
          <span className="groupButtonName">{name}</span>
        </div>
      </div>
      {/* placeholder: join code for sharing this group — sits below the box */}
      <span aria-hidden className="groupButtonCode">
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
  );
};

export interface GroupMiniButtonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  emoji?: string; // placeholder until wired up
  color?: string; // placeholder until wired up
}

const GroupMiniButton = ({
  name,
  emoji = "",
  color,
  className = "",
  ...props
}: GroupMiniButtonProps) => {
  // mirror the sidebar IconButton (Home/Folders/Groups) markup so group icons
  // look identical — just a custom color, caption (name), and emoji icon
  const classes = `iconButtonWrapper groupMiniButton ${className}`.trim();

  return (
    <div className={classes} title={name} {...props}>
      <div className="iconButton" style={{ backgroundColor: color }}>
        <span aria-hidden className="groupMiniButtonEmoji">
          {emoji}
        </span>
      </div>
      <div className="iconButtonLabel">{name}</div>
    </div>
  );
};

const NewGroupButton = ({
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const classes = `groupButtonWrapper createGroupButtonWrapper ${className}`.trim();

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

type JoinFeedback = {
  status: "success" | "error" | "pending";
  message: string;
};

const JoinGroupButton = ({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const classes =
    `groupButtonWrapper newGroupButtonWrapper joinGroupButtonWrapper ${className}`.trim();
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<JoinFeedback | null>(null);

  function attemptJoin() {
    // placeholder: match the code against known groups until the backend exists
    const match = placeholderGroups.find(
      (group) => group.code?.toLowerCase() === code.trim().toLowerCase(),
    );

    if (!code.trim() || !match) {
      setFeedback({ status: "error", message: "Invalid code" });
    } else if (match.isPublic) {
      setFeedback({ status: "success", message: "Group joined!" });
    } else {
      setFeedback({
        status: "pending",
        message: "Awaiting approval from group admin",
      });
    }
  }

  return (
    <div className="joinGroupButtonContainer">
      <div
        className={classes}
        role="button"
        tabIndex={0}
        onClick={attemptJoin}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            attemptJoin();
          }
        }}
        {...props}
      >
        <div className="visually-hidden">Join a group</div>
        {/* clicking inside the code box edits text — it must not trigger a join */}
        <input
          className="joinGroupCodeBox"
          placeholder="Enter Code"
          aria-label="Group join code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === "Enter") {
              event.preventDefault();
              attemptJoin();
            }
          }}
        />

        <div aria-hidden className="groupButtonLabel newGroupButtonLabel">
          <EnterIcon className="newGroupIcon" />
          Join Group
        </div>
      </div>
      {feedback && (
        <span
          role="status"
          className={`joinGroupFeedback joinGroupFeedback-${feedback.status}`}
        >
          {feedback.message}
        </span>
      )}
    </div>
  );
};

export interface EditGroupProps
  extends React.ComponentPropsWithoutRef<typeof Dialog.Root> {
  previousName?: string;
  slug?: string;
  className?: string;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  onDraftChange?: (draft: {
    name: string;
    emoji: string;
    color?: string;
    textColor: string;
  }) => void;
}

const EditGroupDialog = ({
  previousName = "",
  slug = "",
  open,
  onOpenChange,
  onDraftChange,
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

  // keep the background tile in sync with whatever is being previewed
  useEffect(() => {
    onDraftChange?.({ name, emoji, color, textColor });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, emoji, color, textColor]);

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
              {slug ? "Modify" : "Set up"} your group name and icon
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
                  <Form.Field
                    name="emoji"
                    className="groupDialogEmojiPickerField"
                  >
                    <EmojiPicker setSelectedEmoji={setEmoji} side="right">
                      <FaceIcon className="buttonDisplayPickerIcon" />
                    </EmojiPicker>
                    <Form.Control asChild>
                      <input type="hidden" value={emoji} />
                    </Form.Control>
                  </Form.Field>
                  <span className="groupDialogPreviewEmoji">{emoji}</span>
                  <span
                    className="groupDialogPreviewName"
                    style={{ color: textColor }}
                  >
                    {name || "Group Name"}
                  </span>
                </div>
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
            </div>

            {/* Text font color — below the emoji + color picker row */}
            <div className="groupDialogFontColorSection">
              <span className="groupDialogFontColorLabel">Text Font Color</span>
              <div className="groupDialogFontColorButtons">
                <button
                  type="button"
                  aria-label="Black text"
                  aria-pressed={textColor === "#000000"}
                  className="groupDialogFontColorOption"
                  onClick={() => setTextColor("#000000")}
                >
                  <span
                    aria-hidden
                    className="groupDialogFontColorBtn groupDialogFontColorBtnBlack"
                  />
                  <span className="groupDialogFontColorName">Black</span>
                </button>
                <button
                  type="button"
                  aria-label="White text"
                  aria-pressed={textColor === "#ffffff"}
                  className="groupDialogFontColorOption"
                  onClick={() => setTextColor("#ffffff")}
                >
                  <span
                    aria-hidden
                    className="groupDialogFontColorBtn groupDialogFontColorBtnWhite"
                  />
                  <span className="groupDialogFontColorName">White</span>
                </button>
              </div>
            </div>

            {/* Admin list — scrollable when the dialog reaches 85vh */}
            <div className="groupDialogAdminSection">
              <div className="groupDialogAdminList">
                {admins.map((admin, i) => (
                  <div key={i} className="groupDialogAdminItem">
                    <span className="groupDialogAdminEmail">
                      <span className="groupDialogAdminLabel">Admin:</span>{" "}
                      {admin.email}
                    </span>
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
                placeholder="Enter email to add admins"
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

export {
  EditGroupDialog,
  GroupButton,
  GroupMiniButton,
  JoinGroupButton,
  NewGroupButton,
};
