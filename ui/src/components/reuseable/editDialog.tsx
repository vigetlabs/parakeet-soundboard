import * as React from "react";
import { Dialog } from "radix-ui";
import "./editDialog.css";
import { Cross2Icon, PinTopIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import Dropzone, {
  type DropzoneState,
  type FileRejection,
} from "react-dropzone";

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
}

const EditDialog = ({
  uploadFirst,
  filename = "",
  name = "",
  emoji = "",
  color = "black",
  tags = [],
  folders = [],
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

  function handleUpload(acceptedFiles: File[]) {
    if (acceptedFiles.length === 0) return;
    const uploadedFile = acceptedFiles[0];
    setEditingFilename(uploadedFile.name);
    setEditingName(uploadedFile.name.split(".")[0]);
    setUploading(false);
  }

  return (
    <Dialog.Root {...props} onOpenChange={() => setUploading(uploadFirst)}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="editDialogOverlay" />
        <Dialog.Content className={classes}>
          {uploading ? (
            <UploadDialogContent handleUpload={handleUpload} />
          ) : (
            <EditDialogContent
              filename={editingFilename}
              name={editingName}
              emoji={editingEmoji}
              color={editingColor}
              tags={editingTags}
              folders={editingFolders}
            />
          )}
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
      <Dialog.Title className="editDialogTitle">
        <h1>Upload</h1>
      </Dialog.Title>
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

const EditDialogContent = ({
  filename,
  name,
  emoji,
  color,
  tags,
  folders,
}: EditProps) => {
  return (
    <>
      <Dialog.Title>
        <h1>Edit Sound</h1>
      </Dialog.Title>
      filename: {filename}, name: {name}, emoji: {emoji}, color: {color}
    </>
  );
};

export { EditDialog };
