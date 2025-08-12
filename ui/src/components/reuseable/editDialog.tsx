/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Dialog, Form } from "radix-ui";
import "./editDialog.css";
import {
  Cross2Icon,
  FaceIcon,
  PinTopIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import Dropzone, {
  type DropzoneState,
  type FileRejection,
} from "react-dropzone";
import { TextInput } from "./input";
import { TagPicker } from "./tagPicker";
import { Button } from "./button";
import { SoundButtonDisplay } from "./folder";
import { EmojiPicker } from "./emojiPicker";
import { defaultColors } from "../../util/placeholderData";
import { FolderPicker } from "./folderPicker";
import { useMutation } from "@tanstack/react-query";
import { queryClient, API_URL } from "../../util/db";
import type { Folder, Tag } from "../../util/types";

export interface EditProps {
  name: string;
  id: number;
  emoji: string;
  color: string;
  tags: Tag[];
  folders: Folder[];
}

export interface EditDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog.Root> {
  uploadFirst?: boolean;
  className?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sound?: EditProps;
  addToFolder?: Folder;
}

const defaultSound: EditProps = {
  name: "",
  id: -1,
  emoji: "🎉",
  color: "#bb27ff",
  tags: [],
  folders: [],
};

const EditDialog = ({
  uploadFirst = false,
  sound = defaultSound,
  open,
  onOpenChange,
  addToFolder,
  className = "",
  children,
  ...props
}: EditDialogProps) => {
  const classes = `editDialog ${className}`.trim();
  const [uploading, setUploading] = useState(uploadFirst);
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const [editingName, setEditingName] = useState(sound.name);
  const [editingEmoji, setEditingEmoji] = useState(sound.emoji);
  const [editingColor, setEditingColor] = useState(sound.color);
  const [editingTags, setEditingTags] = useState<Tag[]>(sound.tags);
  const [editingFolders, setEditingFolders] = useState<Folder[]>(sound.folders);
  const [isSaving, setIsSaving] = useState(false);

  type CreateEditSoundProps = {
    name: string;
    color: string;
    emoji: string;
    tags: number[];
    folders: string[];
    audio_file?: File;
  };

  const editSoundMutation = useMutation({
    mutationFn: async (editedSound: CreateEditSoundProps) => {
      const formData = new FormData();
      formData.append("sound[name]", editedSound.name);
      formData.append("sound[color]", editedSound.color);
      formData.append("sound[emoji]", editedSound.emoji);

      // Force the array to exist (in case it's empty so it still removes from tags/folders)
      formData.append("sound[tag_ids][]", "");
      editedSound.tags.forEach((tagId: number) => {
        formData.append("sound[tag_ids][]", tagId.toString());
      });
      formData.append("sound[folder_slugs][]", "");
      editedSound.folders.forEach((folderSlug: string) => {
        formData.append("sound[folder_slugs][]", folderSlug);
      });
      if (editedSound.audio_file) {
        formData.append("sound[audio_file]", editedSound.audio_file); // key matches model attribute
      }

      const res = await fetch(`${API_URL}/sounds/${sound.id}`, {
        method: "PATCH",
        body: formData,
        headers: {
          authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to edit sound");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sounds"] });
      setIsSaving(false);
      onOpenChange(false);
    },
  });

  const createSoundMutation = useMutation({
    mutationFn: async (newSound: CreateEditSoundProps) => {
      const formData = new FormData();
      formData.append("sound[name]", newSound.name);
      formData.append("sound[color]", newSound.color);
      formData.append("sound[emoji]", newSound.emoji);
      newSound.tags.forEach((tagId: number) => {
        formData.append("sound[tag_ids][]", tagId.toString());
      });
      newSound.folders.forEach((folderSlug: string) => {
        formData.append("sound[folder_slugs][]", folderSlug);
      });
      if (newSound.audio_file) {
        formData.append("sound[audio_file]", newSound.audio_file); // key matches model attribute
      }

      const res = await fetch(`${API_URL}/sounds`, {
        method: "POST",
        body: formData,
        headers: {
          authorization: `Bearer ${localStorage.getItem("jwt")}`,
        }
      });

      if (!res.ok) {
        throw new Error("Failed to add sound");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sounds"] });
      setIsSaving(false);
      onOpenChange(false);
    },
  });

  function resetOnOpen() {
    setUploading(uploadFirst);
    setEditingName(sound.name);
    setEditingEmoji(sound.emoji);
    setEditingColor(sound.color.toLowerCase());
    setEditingTags(sound.tags);
    if (addToFolder) {
      setEditingFolders([...sound.folders, addToFolder]);
    } else {
      setEditingFolders(sound.folders);
    }
  }

  function handleUpload(acceptedFiles: File[]) {
    if (acceptedFiles.length === 0) return;
    const uploadedFile = acceptedFiles[0];
    setEditingFile(uploadedFile);
    setEditingName(uploadedFile.name.split(".")[0]);
    setUploading(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    setIsSaving(true);
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (sound.id === -1) {
      createSoundMutation.mutate({
        name: data.name as string,
        color: data.color as string,
        emoji: data.emoji as string,
        tags: JSON.parse(data.tags as string),
        folders: JSON.parse(data.folders as string),
        audio_file: editingFile as File,
      });
    } else {
      if (data.editingFile) {
        editSoundMutation.mutate({
          name: data.name as string,
          color: data.color as string,
          emoji: data.emoji as string,
          tags: JSON.parse(data.tags as string),
          folders: JSON.parse(data.folders as string),
        });
      } else {
        editSoundMutation.mutate({
          name: data.name as string,
          color: data.color as string,
          emoji: data.emoji as string,
          tags: JSON.parse(data.tags as string),
          folders: JSON.parse(data.folders as string),
          audio_file: editingFile as File,
        });
      }
    }
  }

  useEffect(() => {
    if (open) {
      resetOnOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog.Root
      {...props}
      open={open}
      onOpenChange={(open) => {
        resetOnOpen();
        onOpenChange(open);
      }}
    >
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialogOverlay" />
        <Dialog.Content className={classes}>
          {uploading ? (
            <UploadDialogContent handleUpload={handleUpload} />
          ) : (
            <EditDialogContent
              filename={editingFile?.name ?? ""}
              name={editingName}
              setName={setEditingName}
              emoji={editingEmoji}
              setEmoji={setEditingEmoji}
              color={editingColor}
              setColor={setEditingColor}
              tags={editingTags}
              setTags={setEditingTags}
              folders={editingFolders}
              setFolders={setEditingFolders}
              setUploading={setUploading}
              handleSubmit={handleSubmit}
              isSaving={isSaving}
              id={0} // will never be used don't worry about it
            />
          )}
          <Dialog.Close asChild>
            <button type="button" className="tagPickerClose" aria-label="Close">
              <Cross2Icon className="tagPickerCloseIcon" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const UploadDialogContent = ({
  handleUpload,
}: {
  handleUpload: (acceptedFiles: File[]) => void;
}) => {
  function handleRejected(fileRejections: FileRejection[]) {
    fileRejections.forEach((rej) => {
      rej.errors.forEach((err) => {
        // TODO: Replace with toasts
        if (err.code === "file-too-large") {
          alert(
            `${rej.file.name} is too big. ` +
              `Max file size is 5MB, you tried ${(
                rej.file.size /
                1024 /
                1024
              ).toFixed(2)}MB.`
          );
        } else if (err.code === "file-invalid-type") {
          alert(`${rej.file.name} is not an MP3.`);
        } else {
          alert(err.message);
        }
      });
    });
  }

  return (
    <>
      <Dialog.Title className="editDialogTitle">Upload</Dialog.Title>
      <Dropzone
        accept={{ "audio/mpeg": [".mp3"] }}
        multiple={false}
        maxSize={5 * 1024 * 1024}
        onDrop={handleUpload}
        onDropRejected={handleRejected}
      >
        {({ getRootProps, getInputProps, isDragActive }: DropzoneState) => (
          <div
            className={"fileDrop" + (isDragActive ? " fileDropActive" : "")}
            {...getRootProps()}
          >
            <input type="file" {...getInputProps()} />
            <div className="fileDropContent">
              <PinTopIcon className="fileDropIcon" />
              <p className="fileDropText">
                {isDragActive
                  ? "Release to upload!"
                  : "Select or drag any .mp3 less than 5MB"}
              </p>
            </div>
          </div>
        )}
      </Dropzone>
    </>
  );
};

export interface EditScreenProps {
  filename: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  setEmoji: React.Dispatch<React.SetStateAction<string>>;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  setUploading: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
}

const EditDialogContent = ({
  filename,
  name,
  setName,
  emoji,
  setEmoji,
  color,
  setColor,
  tags,
  setTags,
  folders,
  setFolders,
  setUploading,
  handleSubmit,
  isSaving,
}: EditProps & EditScreenProps) => {
  const colorPickerRef = React.useRef<HTMLInputElement>(null);

  function handleColorChange(value: string) {
    value = "#" + value.replaceAll("#", "").toLowerCase();
    setColor(value);
  }

  return (
    <>
      <Dialog.Title className="editDialogTitle">Edit Sound</Dialog.Title>
      <Form.Root onSubmit={handleSubmit}>
        <Form.Field
          className="editDialogFieldContainer editDialogFieldContainerDisabled editDialogFieldContainerSelector"
          name="filename"
        >
          <Form.Label className="visually-hidden">Filename</Form.Label>
          <TextInput
            disabled
            value={filename}
            placeholder="<Already Uploaded>"
            leftIcon="file"
            rightIcon="trash"
            rightIconAction={() => setUploading(true)}
            iconSize={32}
            className="editDialogInput editDialogInputFilename"
          />
          <Form.Control asChild>
            <input type="hidden" value={filename} />
          </Form.Control>
        </Form.Field>

        <Form.Field className="editDialogFieldContainer" name="name">
          <Form.Label className="visually-hidden">Sound Name</Form.Label>
          <Form.Message className="editDialogMessage" match="valueMissing">
            Please enter a name
          </Form.Message>
          <Form.Control asChild>
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              rightIcon="cross"
              rightIconAction={() => setName("")}
              iconSize={32}
              className="editDialogInput"
              required
            />
          </Form.Control>
        </Form.Field>

        <div className="editDialogDesignContainer">
          <SoundButtonDisplay
            color={color}
            emoji={emoji}
            className="editDialogPreviewButton"
          />

          <Form.Field className="editDialogEmojiPickerContainer" name="emoji">
            <EmojiPicker setSelectedEmoji={setEmoji} side="right">
              <Form.Label className="visually-hidden">Emoji</Form.Label>
              <FaceIcon className="buttonDisplayPickerIcon" />
            </EmojiPicker>
            <Form.Control asChild>
              <input type="hidden" value={emoji} />
            </Form.Control>
          </Form.Field>

          <Form.Field className="editDialogColorPickerContainer" name="color">
            {defaultColors.map((color) => (
              <div key={color} className="editDialogColorButtonWrapper">
                <button
                  type="button"
                  className="editDialogColorButton"
                  style={{ backgroundColor: color }}
                  onClick={() => setColor(color.toLowerCase())}
                />
              </div>
            ))}
            <div className="editDialogColorButtonWrapper">
              <input
                type="color"
                ref={colorPickerRef}
                style={{ display: "none" }}
                value={color}
                onInput={(e) => setColor((e.target as HTMLInputElement).value)}
              />
              <button
                type="button"
                className="editDialogColorButton rainbowButton"
                onClick={() => colorPickerRef.current?.click()}
              />
            </div>
            <div className="editDialogHexInputWrapper">
              <Form.Message className="editDialogMessage" match="valueMissing">
                Please enter a color
              </Form.Message>
              <Form.Message
                className="editDialogMessage"
                match={(value) => !/^#[0-9A-F]{6}$/i.test(value)}
              >
                Not a valid hex code
              </Form.Message>
              <Form.Control asChild>
                <input
                  type="text"
                  className="editDialogHexInput"
                  value={color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  required
                />
              </Form.Control>
            </div>
          </Form.Field>
        </div>

        <Form.Field
          className="editDialogFieldContainer editDialogFieldContainerSelector"
          name="tags"
        >
          <TagPicker
            selectedTags={tags}
            setSelectedTags={setTags}
            side="right"
            align="center"
            // TODO: Make sure that it doesn't go off the edge of the screen
            style={{ width: "100%" }}
          >
            <Form.Label className="visually-hidden">Tags</Form.Label>
            <TextInput
              disabled
              value={
                tags.length > 0
                  ? tags.map((tag: any) => tag.name).join(", ")
                  : "Apply Tags"
              }
              leftIcon="idCard"
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
                value={JSON.stringify(tags.map((tag) => tag.id))}
              />
            </Form.Control>
          </TagPicker>
        </Form.Field>

        <Form.Field
          className="editDialogFieldContainer editDialogFieldContainerSelector"
          name="folders"
        >
          <FolderPicker
            selectedFolders={folders}
            setSelectedFolders={setFolders}
            side="right"
            align="center"
            // TODO: Make sure that it doesn't go off the edge of the screen
            style={{ width: "100%" }}
          >
            <Form.Label className="visually-hidden">Folders</Form.Label>
            <TextInput
              disabled
              value={
                folders.length > 0
                  ? folders.map((folder: any) => folder.name).join(", ")
                  : "Add to Folder"
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
                value={JSON.stringify(folders.map((folder) => folder.slug))}
              />
            </Form.Control>
          </FolderPicker>
        </Form.Field>

        <Form.Submit asChild>
          <Button className="rightAlign editDialogSubmit" disabled={isSaving}>
            {isSaving ? <UpdateIcon className="spinIcon" /> : "Finish"}
          </Button>
        </Form.Submit>
      </Form.Root>
    </>
  );
};

export { EditDialog };
