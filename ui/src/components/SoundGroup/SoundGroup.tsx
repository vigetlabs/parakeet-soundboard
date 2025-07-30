import { Link, useSearchParams } from "react-router-dom";
import { chooseIcon, type AvaliableIcons } from "../../util";
import { SoundButton } from "../reuseable";
import "./SoundGroup.css";
import {
  ChevronLeftIcon,
  DotsHorizontalIcon,
  Pencil1Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import type { SoundType } from "../../util/tempData";
import { AudioPlayer } from "../../util/audio";
import { useState } from "react";
import fuzzysort from "fuzzysort";
import { EditDialog } from "../reuseable/editDialog";
import { DropdownMenu } from "radix-ui";
import { EditFolderDialog } from "../reuseable/folder";
import { DeleteDialog } from "../reuseable/confirmDelete";

interface SoundGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon: AvaliableIcons;
  sounds: SoundType;
  backLink?: string;
}

const SoundGroup = ({
  title,
  icon,
  sounds,
  backLink,
  style,
  ...props
}: SoundGroupProps) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState("");
  const [searchParams] = useSearchParams();
  const [currentlyEditingFolder, setCurrentlyEditingFolder] = useState(false);
  const [currentlyEditing, setCurrentlyEditing] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState("");
  const [editingEmoji, setEditingEmoji] = useState("");

  const [currentlyDeleting, setCurrentlyDeleting] = useState("");

  function handleButtonClick(name: string, url: string) {
    AudioPlayer.play(url, () => setCurrentlyPlaying(""));
    setCurrentlyPlaying(name);
  }

  function sortAndFilter() {
    let outputSounds;
    const filters = searchParams.getAll("filter");
    if (filters.length > 0) {
      outputSounds = sounds.filter((sound) => {
        return filters.every((tag) => sound.tags.includes(tag));
      });
    } else {
      outputSounds = sounds;
    }

    const searchInput = searchParams.get("search");
    if (searchInput) {
      outputSounds = fuzzysort
        .go(searchParams.get("search") ?? "", outputSounds, { key: "name" })
        .map((result) => result.obj);
    }

    return outputSounds;
  }

  function handleEditClicked(name: string, color: string, emoji: string) {
    setEditingName(name);
    setEditingColor(color);
    setEditingEmoji(emoji);
    setCurrentlyEditing(true);
  }

  function handleDeleteClicked(name: string) {
    setEditingName(name);
    setCurrentlyDeleting("sound");
  }

  function editFolder() {
    setCurrentlyEditingFolder(true);
  }

  function deleteFolder() {
    setEditingName(title);
    setCurrentlyDeleting("folder");
  }

  return (
    <div className="soundGroup" {...props}>
      <div className="soundGroupTitle" style={style}>
        {backLink && (
          <Link to={backLink} className="soundGroupBack">
            <ChevronLeftIcon className="soundGroupBackIcon" />
          </Link>
        )}
        {chooseIcon(icon, { className: "soundGroupIcon" })}
        <h2>{title}</h2>
        {title !== "All Sounds" && title !== "Favorites" && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button type="button" className="folderViewMenu">
                <DotsHorizontalIcon className="soundButtonMenuIcon" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                side="right"
                sideOffset={5}
                className="soundButtonMenuContent"
              >
                <DropdownMenu.Item
                  className="soundButtonMenuItem"
                  onSelect={editFolder}
                >
                  <Pencil1Icon className="soundButtonMenuItemIcon" />
                  Edit
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="soundButtonMenuItem soundButtonMenuItemDanger"
                  onSelect={deleteFolder}
                >
                  <TrashIcon className="soundButtonMenuItemIcon" />
                  Delete Folder
                </DropdownMenu.Item>

                <DropdownMenu.Arrow className="soundButtonMenuArrow" />
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>
      <div className="soundGroupButtonContainer">
        {sortAndFilter().map((sound) => (
          <SoundButton
            key={sound.name}
            label={sound.name}
            emoji={sound.emoji}
            color={sound.color}
            withinFolder={
              title === "All Sounds" || title === "Favorites" ? "" : title
            }
            isFavorite={sound.folders.includes("Favorites")}
            editFunction={handleEditClicked}
            deleteFunction={handleDeleteClicked}
            onClick={() => handleButtonClick(sound.name, sound.url)}
            isPlaying={currentlyPlaying === sound.name}
            className="soundGroupButton"
          />
        ))}
      </div>
      <EditDialog
        open={currentlyEditing}
        onOpenChange={setCurrentlyEditing}
        name={editingName}
        color={editingColor}
        emoji={editingEmoji}
      />

      <EditFolderDialog
        open={currentlyEditingFolder}
        onOpenChange={setCurrentlyEditingFolder}
        previousName={title}
      />

      <DeleteDialog
        open={currentlyDeleting !== ""}
        setClose={() => setCurrentlyDeleting("")}
        name={editingName}
        isFolder={currentlyDeleting === "folder"}
      />
    </div>
  );
};

export default SoundGroup;
