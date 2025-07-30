import * as React from "react";
import { Dialog, Form } from "radix-ui";
import "./editDialog.css";
import { Cross2Icon, FaceIcon, PinTopIcon } from "@radix-ui/react-icons";
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
import { defaultColors } from "../../util/tempData";
import { FolderPicker } from "./folderPicker";

export interface EditProps {
  filename: string;
  name: string;
  emoji: string;
  color: string;
  tags: string[];
  folders: string[];
}

export interface EditDialogProps
  extends Partial<EditProps>,
    React.ComponentPropsWithoutRef<typeof Dialog.Root> {
  uploadFirst?: boolean;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

const EditDialog = ({
  uploadFirst = false,
  filename = "",
  name = "",
  emoji = "🎉",
  color = "#bb27ff",
  tags = [],
  folders = [],
  onOpenChange,
  className = "",
  children,
  ...props
}: EditDialogProps) => {
  const classes = `editDialog ${className}`.trim();
  const [uploading, setUploading] = useState(uploadFirst);
  const [editingFilename, setEditingFilename] = useState(filename);
  const [editingName, setEditingName] = useState(name);
  const [editingEmoji, setEditingEmoji] = useState(emoji);
  const [editingColor, setEditingColor] = useState(color);
  const [editingTags, setEditingTags] = useState(tags);
  const [editingFolders, setEditingFolders] = useState(folders);

  function resetOnOpen() {
    setUploading(uploadFirst);
    setEditingFilename(filename);
    setEditingName(name);
    setEditingEmoji(emoji);
    setEditingColor(color.toLowerCase());
    setEditingTags(tags);
    setEditingFolders(folders);
  }

  function handleUpload(acceptedFiles: File[]) {
    if (acceptedFiles.length === 0) return;
    const uploadedFile = acceptedFiles[0];
    setEditingFilename(uploadedFile.name);
    setEditingName(uploadedFile.name.split(".")[0]);
    setUploading(false);
  }

  useEffect(() => {
    if (props.open) {
      resetOnOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open]);

  return (
    <Dialog.Root
      {...props}
      onOpenChange={(open) => {
        resetOnOpen();
        onOpenChange?.(open);
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
              filename={editingFilename}
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
  setName: React.Dispatch<React.SetStateAction<string>>;
  setEmoji: React.Dispatch<React.SetStateAction<string>>;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  setFolders: React.Dispatch<React.SetStateAction<string[]>>;
  setUploading: React.Dispatch<React.SetStateAction<boolean>>;
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
}: EditProps & EditScreenProps) => {
  const colorPickerRef = React.useRef<HTMLInputElement>(null);

  function handleColorChange(value: string) {
    value = "#" + value.replaceAll("#", "").toLowerCase();
    setColor(value);
  }

  return (
    <>
      <Dialog.Title className="editDialogTitle">Edit Sound</Dialog.Title>
      <Form.Root
        onSubmit={(e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.currentTarget));
          console.log(data);
        }}
      >
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
              value={tags.length > 0 ? tags.join(", ") : "Apply Tags"}
              leftIcon="idCard"
              rightIcon="chevronRight"
              iconSize={32}
              className="editDialogInput editDialogInputDisabled"
            />
            <Form.Control asChild>
              <input type="hidden" value={JSON.stringify(tags)} />
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
              value={folders.length > 0 ? folders.join(", ") : "Add to Folder"}
              leftIcon="archive"
              rightIcon="chevronRight"
              iconSize={32}
              className="editDialogInput editDialogInputDisabled"
            />
            <Form.Control asChild>
              <input type="hidden" value={JSON.stringify(folders)} />
            </Form.Control>
          </FolderPicker>
        </Form.Field>

        <Form.Submit asChild>
          <Button className="rightAlign editDialogSubmit">Finish</Button>
        </Form.Submit>
      </Form.Root>
    </>
  );
};

export { EditDialog };
